// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

// Documentation coverage gate of the API reference.
//
// DocFX builds a reference from whatever comments exist and does not report a declaration that has none. This
// program reads the metadata DocFX generated and fails when a namespace, type or member is undocumented, so the
// reference cannot contain an entry without a description.
//
// Usage, after `dotnet docfx metadata docs/api/docfx.json`:
//
//     dotnet run docs/api/CheckDocumentation.cs -- docs/api
//
// The exit code is 0 when everything is documented, 1 when something is not, and 2 when the metadata is missing.

using System.Text.RegularExpressions;

string root = args.Length > 0 ? args[0] : "docs/api";
string referenceDirectory = Path.Combine(root, "reference");
string namespaceDirectory = Path.Combine(root, "namespaces");

if (!Directory.Exists(referenceDirectory))
{
    Console.Error.WriteLine($"No metadata in '{referenceDirectory}'. Run 'dotnet docfx metadata' first.");
    return 2;
}

// A namespace has no declaration that could carry a comment. Its description is an overwrite file named after it.
HashSet<string> describedNamespaces = Directory.Exists(namespaceDirectory)
    ? Directory.EnumerateFiles(namespaceDirectory, "*.md")
        .Where(HasDescription)
        .Select(path => Path.GetFileNameWithoutExtension(path)!)
        .ToHashSet(StringComparer.Ordinal)
    : [];

List<string> undocumented = [];
int checkedItems = 0;

foreach (string file in Directory.EnumerateFiles(referenceDirectory, "*.yml").Order(StringComparer.Ordinal))
{
    if (Path.GetFileName(file) == "toc.yml")
    {
        continue;
    }

    // The items a file defines come first; the `references` section after them repeats names of other files.
    string text = File.ReadAllText(file).ReplaceLineEndings("\n");
    int references = text.IndexOf("\nreferences:", StringComparison.Ordinal);
    string definitions = references < 0 ? text : text[..references];

    foreach (string item in ItemStart().Split(definitions).Skip(1))
    {
        string uid = item[..item.IndexOf('\n')].Trim();
        string type = ItemType().Match(item) is { Success: true } match ? match.Groups[1].Value : "Item";
        checkedItems++;

        bool documented = type == "Namespace"
            ? describedNamespaces.Contains(uid)
            : ItemSummary().IsMatch(item);
        if (!documented)
        {
            undocumented.Add($"{type} {uid}");
        }
    }
}

if (checkedItems == 0)
{
    Console.Error.WriteLine($"The metadata in '{referenceDirectory}' defines nothing; the gate would pass vacuously.");
    return 2;
}

if (undocumented.Count != 0)
{
    Console.Error.WriteLine($"{undocumented.Count} of {checkedItems} API items have no documentation:");
    foreach (string entry in undocumented)
    {
        Console.Error.WriteLine($"  {entry}");
    }

    Console.Error.WriteLine("Add a <summary> to each declaration, or a file in docs/api/namespaces for a namespace.");
    return 1;
}

Console.WriteLine($"All {checkedItems} API items are documented.");
return 0;

// An overwrite file describes its namespace when it has text after its front matter and comment header.
static bool HasDescription(string path)
{
    string text = File.ReadAllText(path).ReplaceLineEndings("\n");
    int frontMatterEnd = text.IndexOf("\n---", 3, StringComparison.Ordinal);
    if (!text.StartsWith("---\n", StringComparison.Ordinal) || frontMatterEnd < 0)
    {
        return false;
    }

    string body = HtmlComment().Replace(text[(frontMatterEnd + 4)..], string.Empty);
    return text[..frontMatterEnd].Contains($"uid: {Path.GetFileNameWithoutExtension(path)}", StringComparison.Ordinal)
        && !string.IsNullOrWhiteSpace(body);
}

internal static partial class Program
{
    // Every defined item starts with its identifier at the left margin.
    [GeneratedRegex(@"^- uid: ", RegexOptions.Multiline)]
    private static partial Regex ItemStart();

    [GeneratedRegex(@"^  type: (\w+)", RegexOptions.Multiline)]
    private static partial Regex ItemType();

    // A summary with content: text on the same line, or a block scalar followed by an indented line.
    [GeneratedRegex(@"^  summary: (?:[^\s>|].*|[>|][-+]?\n    \S)", RegexOptions.Multiline)]
    private static partial Regex ItemSummary();

    [GeneratedRegex(@"<!--.*?-->", RegexOptions.Singleline)]
    private static partial Regex HtmlComment();
}
