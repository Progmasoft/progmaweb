// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Text.Json;
using Progmasoft.Progmaweb.AiSupport.Retrieval;

namespace Progmasoft.Progmaweb.AiSupport.Answering;

/// <summary>The body of <c>POST /api/ask</c>.</summary>
/// <param name="Question">The question, at most <see cref="AnswerService.MaximumQuestionLength"/> characters.</param>
internal sealed record AskRequest(string? Question);

/// <summary><c>POST /api/ask</c>: answers a question as a stream of server-sent events.</summary>
/// <remarks>
/// <para>
/// The stream has a <c>sources</c> event with the documents the answer quotes, a <c>text</c> event for every piece
/// of the answer, and a <c>done</c> event; an <c>error</c> event ends a stream that could not finish.
/// </para>
/// <para>
/// Neither the question nor the answer is written anywhere, and nothing about the person who asked is used: the
/// service limits how many questions it answers at once, not who asks them.
/// </para>
/// </remarks>
internal static class AskEndpoints
{
    /// <summary>The name of the limit on questions answered at once.</summary>
    public const string ConcurrencyPolicy = "ask";

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    /// <summary>Registers the endpoint.</summary>
    /// <param name="endpoints">The routes of the application.</param>
    /// <returns>The same routes, for chaining.</returns>
    public static IEndpointRouteBuilder MapAskEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/ask", AskAsync).RequireRateLimiting(ConcurrencyPolicy);
        endpoints.MapGet("/healthz", (KnowledgeIndex index) => Results.Ok(new { passages = index.Entries.Count }));
        return endpoints;
    }

    private static async Task AskAsync(
        AskRequest request,
        AnswerService answers,
        HttpContext context,
        ILoggerFactory loggers,
        CancellationToken cancellationToken)
    {
        if (!AnswerService.TryNormalize(request.Question, out string question))
        {
            await Results.Problem(
                title: "The question cannot be answered",
                detail: $"Ask a question of 1 to {AnswerService.MaximumQuestionLength} characters.",
                statusCode: StatusCodes.Status400BadRequest).ExecuteAsync(context);
            return;
        }

        HttpResponse response = context.Response;
        response.ContentType = "text/event-stream; charset=utf-8";
        response.Headers.CacheControl = "no-store";
        // nginx passes the events on as they are written instead of collecting the whole answer.
        response.Headers["X-Accel-Buffering"] = "no";

        try
        {
            IReadOnlyList<IndexEntry> passages = await answers.RetrieveAsync(question, cancellationToken);
            await WriteAsync(response, "sources",
                passages.Select((passage, number) => new { number = number + 1, title = passage.Title, url = passage.Url }),
                cancellationToken);
            await foreach (string piece in answers.AnswerAsync(question, passages, cancellationToken))
            {
                await WriteAsync(response, "text", new { text = piece }, cancellationToken);
            }

            await WriteAsync(response, "done", new { }, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            // The person left; the model has stopped with the request.
        }
        catch (HttpRequestException exception)
        {
            // Only the kind of failure is written, never the question.
            Log.ModelFailed(loggers.CreateLogger(typeof(AskEndpoints)), exception.StatusCode);
            await WriteAsync(response, "error", new { message = "unavailable" }, CancellationToken.None);
        }
    }

    private static async Task WriteAsync(HttpResponse response, string name, object data, CancellationToken cancellationToken)
    {
        await response.WriteAsync($"event: {name}\ndata: {JsonSerializer.Serialize(data, Json)}\n\n", cancellationToken);
        await response.Body.FlushAsync(cancellationToken);
    }
}
