// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Text;
using Progmasoft.Progmaweb.AiSupport.Llama;
using Progmasoft.Progmaweb.AiSupport.Retrieval;

namespace Progmasoft.Progmaweb.AiSupport.Answering;

/// <summary>Answers a question from the passages of the corpus closest to it.</summary>
/// <param name="models">The embedding and the chat model.</param>
/// <param name="index">The index of the corpus.</param>
internal sealed class AnswerService(ILanguageModels models, KnowledgeIndex index)
{
    /// <summary>The most characters of a question.</summary>
    public const int MaximumQuestionLength = 1000;

    /// <summary>How many passages a prompt quotes.</summary>
    /// <remarks>
    /// The server reads about 20 prompt tokens a second, so three passages of at most
    /// <see cref="Corpus.DocumentChunker.MaximumLength"/> characters keep the wait for the first word under a minute.
    /// </remarks>
    private const int PassageCount = 3;

    /// <summary>The lowest similarity a quoted passage may have.</summary>
    private const float MinimumScore = 0.3f;

    /// <summary>
    /// What Qwen3-Embedding expects before a query: the task, then the query. Passages are embedded without it.
    /// </summary>
    private const string QueryInstruction =
        "Instruct: Given a question about Progmasoft software, retrieve the documentation passages that answer it\nQuery: ";

    /// <summary>The rules the chat model answers by.</summary>
    internal const string SystemPrompt =
        """
        You are AI Support, the support assistant of Progmasoft. Progmasoft makes Tala, a lazy programming language,
        with its compiler talac, its build system and package manager Tazel, its formatter talafmt, its linter talalint
        and its language server tala-analyzer; ViGet, the registry of Tala packages and Tazel plugins; Progmasoft
        Account; and Catch3, a C++ test toolkit.

        Answer only from the documentation excerpts below. If they do not contain the answer, say that you do not
        know, and suggest writing to support@progmasoft.com. Never invent commands, options, syntax, rules or
        behavior: state only what an excerpt says, and copy code, names and options exactly as the excerpt writes
        them. Mark what you take from an excerpt with its number, like [1]. Answer in the language of the question,
        in at most 120 words plus one short code block. In Tala, comments start with --.
        For questions about a particular account, a payment or a security problem, refer to support@progmasoft.com.
        """;

    /// <summary>Finds the passages for a question.</summary>
    /// <param name="question">The question, already checked.</param>
    /// <param name="cancellationToken">Cancels the search.</param>
    /// <returns>The passages closest to the question, closest first.</returns>
    public async Task<IReadOnlyList<IndexEntry>> RetrieveAsync(string question, CancellationToken cancellationToken)
    {
        float[][] vectors = await models.EmbedAsync([QueryInstruction + question], cancellationToken);
        return [.. index.Search(vectors[0], PassageCount, MinimumScore).Select(result => result.Entry)];
    }

    /// <summary>Streams the answer to a question.</summary>
    /// <param name="question">The question, already checked.</param>
    /// <param name="passages">The passages <see cref="RetrieveAsync"/> found.</param>
    /// <param name="cancellationToken">Cancels the answer; the model stops generating.</param>
    /// <returns>The pieces of the answer.</returns>
    public IAsyncEnumerable<string> AnswerAsync(
        string question,
        IReadOnlyList<IndexEntry> passages,
        CancellationToken cancellationToken) =>
        models.ChatAsync(Messages(question, passages), cancellationToken);

    /// <summary>The conversation the chat model receives.</summary>
    internal static IReadOnlyList<ChatMessage> Messages(string question, IReadOnlyList<IndexEntry> passages)
    {
        StringBuilder system = new(SystemPrompt);
        system.Append("\n\nDocumentation excerpts:\n");
        if (passages.Count == 0)
        {
            system.Append("\n(none matched the question)\n");
        }

        for (int number = 0; number < passages.Count; number++)
        {
            IndexEntry passage = passages[number];
            system.Append('\n').Append('[').Append(number + 1).Append("] ").Append(passage.Title)
                .Append('\n').Append(passage.Text).Append('\n');
        }

        return [new ChatMessage("system", system.ToString()), new ChatMessage("user", question)];
    }

    /// <summary>Checks a question and puts it in the form the models receive.</summary>
    /// <param name="question">The question as it was sent.</param>
    /// <param name="normalized">The question without surrounding white space.</param>
    /// <returns>Whether the question can be answered.</returns>
    public static bool TryNormalize(string? question, out string normalized)
    {
        normalized = question?.Replace("\r\n", "\n", StringComparison.Ordinal).Trim() ?? string.Empty;
        return normalized.Length is > 0 and <= MaximumQuestionLength &&
               !normalized.Any(character => char.IsControl(character) && character is not '\n' and not '\t');
    }
}
