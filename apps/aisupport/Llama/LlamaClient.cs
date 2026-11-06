// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace Progmasoft.Progmaweb.AiSupport.Llama;

/// <summary>The two models AI Support uses.</summary>
internal interface ILanguageModels
{
    /// <summary>Embeds texts, each as a vector of unit length.</summary>
    /// <param name="texts">The texts.</param>
    /// <param name="cancellationToken">Cancels the request.</param>
    /// <returns>One vector per text, in the same order.</returns>
    Task<float[][]> EmbedAsync(IReadOnlyList<string> texts, CancellationToken cancellationToken);

    /// <summary>Streams the answer of the chat model.</summary>
    /// <param name="messages">The conversation: the system message and the question.</param>
    /// <param name="cancellationToken">Cancels the request; the model stops generating.</param>
    /// <returns>The pieces of the answer as they are generated.</returns>
    IAsyncEnumerable<string> ChatAsync(IReadOnlyList<ChatMessage> messages, CancellationToken cancellationToken);
}

/// <summary>A message of a conversation.</summary>
/// <param name="Role"><c>system</c>, <c>user</c> or <c>assistant</c>.</param>
/// <param name="Content">The text of the message.</param>
internal sealed record ChatMessage(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("content")] string Content);

/// <summary>Where the two llama.cpp servers listen, and how the chat model samples.</summary>
internal sealed class LanguageModelOptions
{
    /// <summary>The llama-server that runs Qwen3.5 2B.</summary>
    public Uri ChatEndpoint { get; set; } = new("http://127.0.0.1:8090/");
    /// <summary>The llama-server that runs the embedding model.</summary>
    public Uri EmbeddingEndpoint { get; set; } = new("http://127.0.0.1:8091/");
    /// <summary>The most tokens of one answer.</summary>
    public int MaximumAnswerTokens { get; set; } = 400;
}

/// <summary>Talks to two llama-server processes through their OpenAI-compatible API.</summary>
/// <remarks>
/// The chat model runs without thinking: the server starts with <c>--reasoning off</c>, and every request also sets
/// <c>enable_thinking</c> to false in the chat template. It samples cooler than the 0.7 Qwen gives for chat and without
/// a presence penalty: an answer copies code and names from the excerpts, and a penalty on tokens that already
/// appeared works against that. Compared on the server with the same excerpts (2026-11-06), these settings gave the
/// documented syntax in every answer, where 0.7 with a penalty of 1.5 now and then invented its own.
/// </remarks>
/// <param name="http">A client without a base address; each call names its server.</param>
/// <param name="options">The servers and the sampling.</param>
internal sealed class LlamaClient(HttpClient http, IOptions<LanguageModelOptions> options) : ILanguageModels
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    /// <inheritdoc/>
    public async Task<float[][]> EmbedAsync(IReadOnlyList<string> texts, CancellationToken cancellationToken)
    {
        using HttpResponseMessage response = await http.PostAsJsonAsync(
            new Uri(options.Value.EmbeddingEndpoint, "v1/embeddings"),
            new { input = texts },
            Json,
            cancellationToken);
        response.EnsureSuccessStatusCode();
        EmbeddingResponse? body = await response.Content.ReadFromJsonAsync<EmbeddingResponse>(Json, cancellationToken);
        if (body?.Data is not { } data || data.Count != texts.Count)
        {
            throw new InvalidDataException("The embedding server answered with a different number of vectors.");
        }

        return [.. data.OrderBy(item => item.Index).Select(item => Normalize(item.Embedding))];
    }

    /// <inheritdoc/>
    public async IAsyncEnumerable<string> ChatAsync(
        IReadOnlyList<ChatMessage> messages,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        var body = new
        {
            messages,
            stream = true,
            max_tokens = options.Value.MaximumAnswerTokens,
            temperature = 0.3,
            top_p = 0.8,
            top_k = 20,
            min_p = 0.0,
            presence_penalty = 0.0,
            chat_template_kwargs = new { enable_thinking = false }
        };
        using HttpRequestMessage request = new(HttpMethod.Post, new Uri(options.Value.ChatEndpoint, "v1/chat/completions"))
        {
            Content = JsonContent.Create(body, options: Json)
        };
        using HttpResponseMessage response =
            await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();
        await using Stream stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using StreamReader reader = new(stream);

        while (await reader.ReadLineAsync(cancellationToken) is { } line)
        {
            if (!line.StartsWith("data:", StringComparison.Ordinal))
            {
                continue;
            }

            string data = line["data:".Length..].Trim();
            if (data == "[DONE]")
            {
                yield break;
            }

            string? piece = ChunkText(data);
            if (!string.IsNullOrEmpty(piece))
            {
                yield return piece;
            }
        }

        // The stream ended without its [DONE] marker: the answer is cut short, and must not pass for a whole one.
        throw new IOException("The chat server closed the answer before its end.");
    }

    /// <summary>The text one streamed chunk adds to the answer.</summary>
    /// <param name="data">The JSON of a <c>data:</c> line.</param>
    /// <returns>The text, or null for a chunk that adds none.</returns>
    internal static string? ChunkText(string data)
    {
        using JsonDocument chunk = JsonDocument.Parse(data);
        if (!chunk.RootElement.TryGetProperty("choices", out JsonElement choices) || choices.GetArrayLength() == 0)
        {
            return null;
        }

        return choices[0].TryGetProperty("delta", out JsonElement delta) &&
               delta.TryGetProperty("content", out JsonElement content) &&
               content.ValueKind == JsonValueKind.String
            ? content.GetString()
            : null;
    }

    /// <summary>Scales a vector to unit length, so a dot product is the cosine similarity.</summary>
    internal static float[] Normalize(float[] vector)
    {
        double length = Math.Sqrt(vector.Sum(value => (double)value * value));
        // A vector without length (all zeros, which no model returns for text) has no direction to keep.
        if (length < double.Epsilon)
        {
            return vector;
        }

        return [.. vector.Select(value => (float)(value / length))];
    }

    private sealed record EmbeddingResponse(List<EmbeddingItem>? Data);

    private sealed record EmbeddingItem(int Index, float[] Embedding);
}
