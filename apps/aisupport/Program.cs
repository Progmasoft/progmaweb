// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.AiSupport;
using Progmasoft.Progmaweb.AiSupport.Answering;
using Progmasoft.Progmaweb.AiSupport.Corpus;
using Progmasoft.Progmaweb.AiSupport.Llama;
using Progmasoft.Progmaweb.AiSupport.Retrieval;

// Progmaweb.AiSupport index <corpus.json> <corpus directory> <index file>
if (args is ["index", string manifestPath, string corpusRoot, string indexPath])
{
    using HttpClient http = new() { Timeout = TimeSpan.FromMinutes(5) };
    LlamaClient models = new(http, Options.Create(new LanguageModelOptions()));
    KnowledgeIndex previous = File.Exists(indexPath) ? KnowledgeIndex.Load(indexPath) : KnowledgeIndex.Empty;
    (KnowledgeIndex index, int embedded) = await new IndexBuilder(models).BuildAsync(
        CorpusManifest.Load(manifestPath), corpusRoot, previous, CancellationToken.None);
    index.Save(indexPath);
    Console.WriteLine($"{index.Entries.Count} passages, {embedded} embedded.");
    return 0;
}

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<LanguageModelOptions>(builder.Configuration.GetSection("LanguageModels"));
builder.Services.AddHttpClient<ILanguageModels, LlamaClient>(client => client.Timeout = TimeSpan.FromMinutes(3));
builder.Services.AddSingleton(services =>
{
    string path = builder.Configuration["AiSupport:IndexPath"] ?? "/srv/aisupport/current/index.json";
    if (File.Exists(path))
    {
        return KnowledgeIndex.Load(path);
    }

    Log.MissingIndex(services.GetRequiredService<ILoggerFactory>().CreateLogger("AiSupport"), path);
    return KnowledgeIndex.Empty;
});
builder.Services.AddSingleton<AnswerService>();
builder.Services.AddRateLimiter(options =>
{
    // The chat model answers one question at a time with all four cores of the server (llama-chat.service); a few
    // more wait their turn. The limit is the same for everyone: the service does not look at who asks.
    options.AddConcurrencyLimiter(AskEndpoints.ConcurrencyPolicy, limiter =>
    {
        limiter.PermitLimit = 1;
        limiter.QueueLimit = 4;
        limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
    options.RejectionStatusCode = StatusCodes.Status503ServiceUnavailable;
    options.OnRejected = (context, _) =>
    {
        context.HttpContext.Response.Headers.RetryAfter = "30";
        return ValueTask.CompletedTask;
    };
});

WebApplication app = builder.Build();

app.UseMiddleware<PageSecurityHeaders>();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRateLimiter();
app.MapAskEndpoints();

await app.RunAsync();
return 0;

/// <summary>Lets the tests start the application.</summary>
public partial class Program;
