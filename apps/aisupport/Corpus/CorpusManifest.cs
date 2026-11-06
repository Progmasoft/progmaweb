// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Text.Json;
using Microsoft.Extensions.FileSystemGlobbing;

namespace Progmasoft.Progmaweb.AiSupport.Corpus;

/// <summary>The documents AI Support answers from: <c>corpus.json</c>.</summary>
/// <remarks>
/// Each source is a public Progmasoft repository at a branch. The deployment unpacks every repository into a directory
/// of its name, and <see cref="Enumerate"/> picks the files of each source from there.
/// </remarks>
/// <param name="Sources">The repositories and the files taken from each.</param>
internal sealed record CorpusManifest(IReadOnlyList<CorpusSource> Sources)
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    /// <summary>Reads a manifest.</summary>
    /// <param name="path">The path of <c>corpus.json</c>.</param>
    /// <returns>The manifest.</returns>
    /// <exception cref="InvalidDataException">The file is not a manifest.</exception>
    public static CorpusManifest Load(string path)
    {
        CorpusManifest? manifest = JsonSerializer.Deserialize<CorpusManifest>(File.ReadAllText(path), Options);
        if (manifest?.Sources is not { Count: > 0 })
        {
            throw new InvalidDataException($"{path} names no sources.");
        }

        return manifest;
    }

    /// <summary>The files of every source, in a fixed order.</summary>
    /// <param name="root">The directory that holds one directory per repository.</param>
    /// <returns>Each file with the source it belongs to and its path inside the repository.</returns>
    public IEnumerable<CorpusFile> Enumerate(string root)
    {
        foreach (CorpusSource source in Sources)
        {
            string directory = Path.Combine(root, source.Repository);
            Matcher matcher = new(StringComparison.Ordinal);
            matcher.AddIncludePatterns(source.Include);
            matcher.AddExcludePatterns(source.Exclude ?? []);
            IEnumerable<string> paths = matcher.GetResultsInFullPath(directory)
                .Select(path => Path.GetRelativePath(directory, path).Replace('\\', '/'))
                .Order(StringComparer.Ordinal);
            foreach (string relative in paths)
            {
                yield return new CorpusFile(source, relative, Path.Combine(directory, relative));
            }
        }
    }
}

/// <summary>One repository of the corpus.</summary>
/// <param name="Repository">The name of the repository under github.com/Progmasoft.</param>
/// <param name="Branch">The branch the deployment takes.</param>
/// <param name="Include">Glob patterns of the files to take, relative to the repository.</param>
/// <param name="Exclude">Glob patterns of the files to leave out.</param>
/// <param name="Links">How a file becomes a public address; see <see cref="SourceLinks"/>.</param>
internal sealed record CorpusSource(
    string Repository,
    string Branch,
    IReadOnlyList<string> Include,
    IReadOnlyList<string>? Exclude,
    string Links);

/// <summary>A file of the corpus.</summary>
/// <param name="Source">The source the file belongs to.</param>
/// <param name="Path">The path inside the repository, with forward slashes.</param>
/// <param name="FullPath">The path on disk.</param>
internal sealed record CorpusFile(CorpusSource Source, string Path, string FullPath);
