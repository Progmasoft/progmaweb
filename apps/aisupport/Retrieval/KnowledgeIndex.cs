// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Text.Json;

namespace Progmasoft.Progmaweb.AiSupport.Retrieval;

/// <summary>The passages of the corpus with their vectors, searched by cosine similarity.</summary>
/// <remarks>
/// The index is a JSON file the <c>index</c> command writes. It is small (a few thousand passages), so it is read
/// whole and searched by comparing the question with every passage.
/// </remarks>
/// <param name="Model">The embedding model the vectors come from.</param>
/// <param name="Entries">The passages.</param>
internal sealed record KnowledgeIndex(string Model, IReadOnlyList<IndexEntry> Entries)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    /// <summary>An index without passages, for a service whose index has not been built.</summary>
    public static KnowledgeIndex Empty { get; } = new(string.Empty, []);

    /// <summary>Reads an index.</summary>
    /// <param name="path">The file the <c>index</c> command wrote.</param>
    /// <returns>The index.</returns>
    public static KnowledgeIndex Load(string path)
    {
        using FileStream stream = File.OpenRead(path);
        return JsonSerializer.Deserialize<KnowledgeIndex>(stream, Json)
            ?? throw new InvalidDataException($"{path} is not an index.");
    }

    /// <summary>Writes the index.</summary>
    /// <param name="path">The file to write; it is replaced at once, so a reader never sees half of it.</param>
    public void Save(string path)
    {
        string temporary = path + ".new";
        using (FileStream stream = File.Create(temporary))
        {
            JsonSerializer.Serialize(stream, this, Json);
        }

        File.Move(temporary, path, overwrite: true);
    }

    /// <summary>The passages closest to a question.</summary>
    /// <param name="question">The vector of the question, of unit length.</param>
    /// <param name="count">The most passages to return.</param>
    /// <param name="minimumScore">The lowest similarity a passage may have.</param>
    /// <returns>The passages, closest first, with their similarity.</returns>
    public IReadOnlyList<(IndexEntry Entry, float Score)> Search(float[] question, int count, float minimumScore)
    {
        return [.. Entries
            .Select(entry => (Entry: entry, Score: Dot(entry.Vector, question)))
            .Where(result => result.Score >= minimumScore)
            .OrderByDescending(result => result.Score)
            .Take(count)];
    }

    private static float Dot(float[] left, float[] right)
    {
        if (left.Length != right.Length)
        {
            return float.MinValue;
        }

        float sum = 0;
        for (int index = 0; index < left.Length; index++)
        {
            sum += left[index] * right[index];
        }

        return sum;
    }
}

/// <summary>A passage of the corpus.</summary>
/// <param name="Title">The document and the headings above the passage.</param>
/// <param name="Url">The public address of the document.</param>
/// <param name="Text">The text of the passage.</param>
/// <param name="Hash">The digest of the title and the text; the index keeps the vector of an unchanged passage.</param>
/// <param name="Vector">The embedding of the passage, of unit length.</param>
internal sealed record IndexEntry(string Title, string Url, string Text, string Hash, float[] Vector);
