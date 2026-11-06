// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Progmasoft.Progmaweb.AiSupport.Llama;
using Progmasoft.Progmaweb.AiSupport.Retrieval;

namespace Progmasoft.Progmaweb.AiSupport.Tests;

public sealed class AskEndpointTests
{
    private static WebApplicationFactory<Program> Factory(ILanguageModels models) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseSetting("AiSupport:IndexPath", Path.Combine(Path.GetTempPath(), "no-such-index.json"));
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<ILanguageModels>();
                services.AddSingleton(models);
                services.RemoveAll<KnowledgeIndex>();
                services.AddSingleton(new KnowledgeIndex(IndexBuilder.Model, [
                    new IndexEntry("Tazel › build", "https://tazel.net/docs/reference/commands", "tazel build",
                        "hash", [1, 0])
                ]));
            });
        });

    [Fact]
    public async Task AnAnswerStreamsItsSourcesItsTextAndItsEnd()
    {
        await using WebApplicationFactory<Program> factory = Factory(new FakeModels("Run ", "`tazel build` [1]."));
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/ask", new { question = "How do I build?" },
            TestContext.Current.CancellationToken);
        string body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/event-stream", response.Content.Headers.ContentType?.MediaType);
        (string Name, JsonElement Data)[] events = [.. body.Split("\n\n", StringSplitOptions.RemoveEmptyEntries)
            .Select(block => block.Split('\n'))
            .Select(lines => (lines[0]["event: ".Length..], JsonDocument.Parse(lines[1]["data: ".Length..]).RootElement))];
        Assert.Equal(["sources", "text", "text", "done"], events.Select(item => item.Name));
        JsonElement source = Assert.Single(events[0].Data.EnumerateArray());
        Assert.Equal(1, source.GetProperty("number").GetInt32());
        Assert.Equal("Tazel › build", source.GetProperty("title").GetString());
        Assert.Equal("https://tazel.net/docs/reference/commands", source.GetProperty("url").GetString());
        Assert.Equal("Run `tazel build` [1].",
            string.Concat(events[1..3].Select(item => item.Data.GetProperty("text").GetString())));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task AnEmptyQuestionIsRefused(string question)
    {
        await using WebApplicationFactory<Program> factory = Factory(new FakeModels());
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/ask", new { question },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task AFailedModelEndsTheStreamWithAnError()
    {
        await using WebApplicationFactory<Program> factory = Factory(new FakeModels { Fails = true });
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/ask", new { question = "How?" },
            TestContext.Current.CancellationToken);
        string body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.EndsWith("event: error\ndata: {\"message\":\"unavailable\"}\n\n", body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ThePageLoadsWithItsSecurityHeaders()
    {
        await using WebApplicationFactory<Program> factory = Factory(new FakeModels());
        using HttpClient client = factory.CreateClient();

        HttpResponseMessage response = await client.GetAsync("/", TestContext.Current.CancellationToken);
        string page = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("<title>AI Support · Progmasoft</title>", page, StringComparison.Ordinal);
        Assert.Equal(PageSecurityHeaders.ContentSecurityPolicy,
            response.Headers.GetValues("Content-Security-Policy").Single());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
    }

    [Fact]
    public async Task TheHealthEndpointCountsThePassages()
    {
        await using WebApplicationFactory<Program> factory = Factory(new FakeModels());
        using HttpClient client = factory.CreateClient();

        string health = await client.GetStringAsync("/healthz", TestContext.Current.CancellationToken);

        Assert.Equal("{\"passages\":1}", health);
    }

    private sealed class FakeModels(params string[] pieces) : ILanguageModels
    {
        public bool Fails { get; init; }

        public Task<float[][]> EmbedAsync(IReadOnlyList<string> texts, CancellationToken cancellationToken) =>
            Fails
                ? throw new HttpRequestException("down", null, HttpStatusCode.BadGateway)
                : Task.FromResult(texts.Select(_ => new float[] { 1, 0 }).ToArray());

        public async IAsyncEnumerable<string> ChatAsync(
            IReadOnlyList<ChatMessage> messages,
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            foreach (string piece in pieces)
            {
                await Task.Yield();
                yield return piece;
            }
        }
    }
}
