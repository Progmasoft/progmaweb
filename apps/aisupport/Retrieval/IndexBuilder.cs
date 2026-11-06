// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Security.Cryptography;
using System.Text;
using Progmasoft.Progmaweb.AiSupport.Corpus;
using Progmasoft.Progmaweb.AiSupport.Llama;

namespace Progmasoft.Progmaweb.AiSupport.Retrieval;

/// <summary>Builds the index of the corpus: <c>Progmaweb.AiSupport index &lt;corpus&gt; &lt;index&gt;</c>.</summary>
/// <remarks>
/// A passage whose title and text are unchanged keeps the vector of the previous index, so a new deployment embeds
/// only what changed. Passages are embedded a few at a time, which keeps each request to the embedding server small.
/// </remarks>
/// <param name="models">The embedding model.</param>
internal sealed class IndexBuilder(ILanguageModels models)
{
    /// <summary>The model the vectors come from; a different model invalidates every vector.</summary>
    public const string Model = "Qwen3-Embedding-0.6B";

    private const int BatchSize = 8;

    /// <summary>Builds the index.</summary>
    /// <param name="manifest">The documents to take.</param>
    /// <param name="corpusRoot">The directory with one directory per repository.</param>
    /// <param name="previous">The index of the previous deployment; empty when there is none.</param>
    /// <param name="cancellationToken">Cancels the build.</param>
    /// <returns>The new index and how many passages had to be embedded.</returns>
    public async Task<(KnowledgeIndex Index, int Embedded)> BuildAsync(
        CorpusManifest manifest,
        string corpusRoot,
        KnowledgeIndex previous,
        CancellationToken cancellationToken)
    {
        Dictionary<string, float[]> known = previous.Model == Model
            ? previous.Entries.GroupBy(entry => entry.Hash).ToDictionary(group => group.Key, group => group.First().Vector)
            : [];

        List<(string Title, string Url, string Text, string Hash)> passages = [];
        foreach (CorpusFile file in manifest.Enumerate(corpusRoot))
        {
            string url = SourceLinks.For(file);
            string content = await File.ReadAllTextAsync(file.FullPath, cancellationToken);
            foreach (Passage passage in DocumentChunker.Split(file.Path, content))
            {
                passages.Add((passage.Title, url, passage.Text, Hash(passage)));
            }
        }

        List<string> missing = [.. passages.Select(passage => passage.Hash).Distinct().Where(hash => !known.ContainsKey(hash))];
        Dictionary<string, string> textOf = passages.GroupBy(passage => passage.Hash)
            .ToDictionary(group => group.Key, group => Document(group.First().Title, group.First().Text));
        foreach (string[] batch in missing.Chunk(BatchSize))
        {
            float[][] vectors = await models.EmbedAsync([.. batch.Select(hash => textOf[hash])], cancellationToken);
            for (int position = 0; position < batch.Length; position++)
            {
                known[batch[position]] = vectors[position];
            }
        }

        KnowledgeIndex index = new(
            Model,
            [.. passages.Select(passage => new IndexEntry(
                passage.Title, passage.Url, passage.Text, passage.Hash, known[passage.Hash]))]);
        return (index, missing.Count);
    }

    /// <summary>The text that is embedded for a passage: its title and its text.</summary>
    internal static string Document(string title, string text) => title + "\n\n" + text;

    private static string Hash(Passage passage) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(Document(passage.Title, passage.Text))));
}
