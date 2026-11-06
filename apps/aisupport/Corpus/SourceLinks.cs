// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Text.RegularExpressions;

namespace Progmasoft.Progmaweb.AiSupport.Corpus;

/// <summary>The public address of a file of the corpus, which an answer shows as its source.</summary>
internal static partial class SourceLinks
{
    /// <summary>The address of a file.</summary>
    /// <param name="file">The file.</param>
    /// <returns>
    /// For <c>github</c>, the file on GitHub at the branch of its source. For <c>tazel-docs</c>, the page of
    /// tazel.net built from the file: <c>content/en-US/docs/2.reference/1.commands.md</c> is
    /// <c>https://tazel.net/docs/reference/commands</c>.
    /// </returns>
    /// <exception cref="InvalidDataException">The source names an unknown kind of link.</exception>
    public static string For(CorpusFile file) => file.Source.Links switch
    {
        "github" =>
            $"https://github.com/Progmasoft/{file.Source.Repository}/blob/{file.Source.Branch}/{file.Path}",
        "tazel-docs" => TazelDocs(file.Path),
        _ => throw new InvalidDataException($"Unknown kind of link '{file.Source.Links}'.")
    };

    private static string TazelDocs(string path)
    {
        const string Prefix = "content/en-US/docs/";
        string page = path.StartsWith(Prefix, StringComparison.Ordinal) ? path[Prefix.Length..] : path;
        page = page.EndsWith(".md", StringComparison.Ordinal) ? page[..^3] : page;
        List<string> segments = [.. page.Split('/').Select(segment => Order().Replace(segment, string.Empty))];
        // Nuxt Content serves an index page at the address of its folder.
        if (segments is [.., "index"])
        {
            segments.RemoveAt(segments.Count - 1);
        }

        return "https://tazel.net/docs/" + string.Join('/', segments);
    }

    /// <summary>The number that orders a page or a folder of the documentation.</summary>
    [GeneratedRegex(@"^\d+\.")]
    private static partial Regex Order();
}
