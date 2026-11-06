// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Text;

namespace Progmasoft.Progmaweb.AiSupport.Corpus;

/// <summary>Cuts a document into passages small enough to embed and to quote in a prompt.</summary>
/// <remarks>
/// Markdown is cut at its headings first, so a passage stays within one section and carries the path of headings
/// above it in its title. A section longer than <see cref="MaximumLength"/>, and a file of any other kind, is cut at
/// blank lines, and a paragraph that is still too long at the last white space that fits.
/// </remarks>
internal static class DocumentChunker
{
    /// <summary>The most characters of text in one passage.</summary>
    public const int MaximumLength = 1500;

    /// <summary>The passages of a document.</summary>
    /// <param name="path">The path of the document in its repository; names it when it has no heading.</param>
    /// <param name="content">The text of the document.</param>
    /// <returns>The passages, in the order of the document; none for a document without text.</returns>
    public static IReadOnlyList<Passage> Split(string path, string content)
    {
        string text = content.Replace("\r\n", "\n", StringComparison.Ordinal);
        if (!path.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
        {
            return [.. Pieces(text).Select(piece => new Passage(path, piece))];
        }

        (string? frontTitle, string body) = WithoutFrontMatter(text);
        List<Passage> passages = [];
        string document = frontTitle ?? path;
        string?[] headings = new string?[6];
        StringBuilder section = new();
        bool fenced = false;

        void Flush()
        {
            string title = string.Join(" › ", headings.Where(heading => heading is not null).Prepend(document)
                .Distinct(StringComparer.Ordinal));
            passages.AddRange(Pieces(section.ToString()).Select(piece => new Passage(title, piece)));
            section.Clear();
        }

        foreach (string line in body.Split('\n'))
        {
            if (line.TrimStart().StartsWith("```", StringComparison.Ordinal))
            {
                fenced = !fenced;
            }

            int level = fenced ? 0 : HeadingLevel(line);
            if (level == 0)
            {
                section.Append(line).Append('\n');
                continue;
            }

            Flush();
            string heading = line[level..].Trim();
            if (level == 1 && frontTitle is null && passages.Count == 0)
            {
                document = heading;
            }
            else
            {
                headings[level - 1] = heading;
            }

            Array.Clear(headings, level, headings.Length - level);
        }

        Flush();
        return passages;
    }

    /// <summary>The level of a Markdown heading line, or zero for any other line.</summary>
    private static int HeadingLevel(string line)
    {
        int level = 0;
        while (level < line.Length && line[level] == '#')
        {
            level++;
        }

        return level is >= 1 and <= 6 && level < line.Length && line[level] == ' ' ? level : 0;
    }

    /// <summary>Removes a YAML front matter block and returns its title.</summary>
    private static (string? Title, string Body) WithoutFrontMatter(string text)
    {
        if (!text.StartsWith("---\n", StringComparison.Ordinal))
        {
            return (null, text);
        }

        int end = text.IndexOf("\n---\n", 4, StringComparison.Ordinal);
        if (end < 0)
        {
            return (null, text);
        }

        string? title = text[4..end].Split('\n')
            .Where(line => line.StartsWith("title:", StringComparison.Ordinal))
            .Select(line => line["title:".Length..].Trim().Trim('"', '\''))
            .FirstOrDefault(line => line.Length > 0);
        return (title, text[(end + 5)..]);
    }

    /// <summary>Cuts text into pieces of at most <see cref="MaximumLength"/> characters.</summary>
    private static IEnumerable<string> Pieces(string text)
    {
        StringBuilder piece = new();
        foreach (string paragraph in text.Split("\n\n", StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
        {
            if (piece.Length > 0 && piece.Length + 2 + paragraph.Length > MaximumLength)
            {
                yield return piece.ToString();
                piece.Clear();
            }

            string rest = paragraph;
            while (rest.Length > MaximumLength)
            {
                int cut = rest.LastIndexOfAny([' ', '\n'], MaximumLength - 1);
                cut = cut <= 0 ? MaximumLength : cut;
                yield return rest[..cut].TrimEnd();
                rest = rest[cut..].TrimStart();
            }

            if (piece.Length > 0)
            {
                piece.Append("\n\n");
            }

            piece.Append(rest);
        }

        if (piece.Length > 0)
        {
            yield return piece.ToString();
        }
    }
}

/// <summary>A passage of a document.</summary>
/// <param name="Title">The document and the headings above the passage.</param>
/// <param name="Text">The text of the passage.</param>
internal sealed record Passage(string Title, string Text);
