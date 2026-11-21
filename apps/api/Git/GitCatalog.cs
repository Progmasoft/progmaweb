// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;

namespace Progmasoft.Progmaweb.Api.Git;

/// <summary>Where the read-only mirrors of git.progmasoft.com are and how they are read.</summary>
internal sealed class GitOptions
{
    /// <summary>The section of the configuration.</summary>
    public const string Section = "Git";

    /// <summary>The host the mirrors are shown on.</summary>
    public string Host { get; set; } = "git.progmasoft.com";

    /// <summary>The directory of the bare mirrors, <c>&lt;name&gt;.git</c> each.</summary>
    public string MirrorsPath { get; set; } = "/srv/git/mirrors";

    /// <summary>The catalog: the sections, the repositories in them and their descriptions.</summary>
    public string CatalogPath { get; set; } = "/etc/git-mirror/catalog.json";

    /// <summary>The Git program.</summary>
    public string GitPath { get; set; } = "/usr/bin/git";
}

/// <summary>One repository of the catalog.</summary>
/// <param name="Name">Its name, the same on GitHub and in the mirrors.</param>
/// <param name="Description">What it is.</param>
internal sealed record GitCatalogRepository(string Name, string Description);

/// <summary>One section of the catalog.</summary>
/// <param name="Name">Its heading.</param>
/// <param name="Repositories">Its repositories, in the order shown.</param>
internal sealed record GitCatalogSection(string Name, IReadOnlyList<GitCatalogRepository> Repositories);

/// <summary>The repositories git.progmasoft.com shows, read from the catalog file.</summary>
/// <remarks>
/// The file is <c>ops/git/catalog.json</c>, installed beside the list <c>git-mirror</c> reads; a repository that is in
/// the catalog but has no mirror is not shown. The file is read again when it changes.
/// </remarks>
/// <param name="options">Where the catalog is.</param>
internal sealed partial class GitCatalog(IOptions<GitOptions> options)
{
    /// <summary>How the catalog file is read: property names in any case.</summary>
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    /// <summary>Guards <see cref="cached"/>.</summary>
    private readonly Lock gate = new();

    /// <summary>The catalog as last read, with the time its file was written then.</summary>
    private (DateTime Written, IReadOnlyList<GitCatalogSection> Sections)? cached;

    /// <summary>Matches a repository name: what GitHub allows, without a leading dot.</summary>
    /// <returns>The compiled expression.</returns>
    [GeneratedRegex("^[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}$", RegexOptions.CultureInvariant)]
    private static partial Regex NamePattern();

    /// <summary>Whether a text is a repository name.</summary>
    /// <param name="name">The text.</param>
    /// <returns><see langword="true"/> when it is one.</returns>
    public static bool IsName(string name) => NamePattern().IsMatch(name) && !name.EndsWith(".git", StringComparison.Ordinal);

    /// <summary>The sections, with only the repositories that have a mirror.</summary>
    /// <returns>The sections; empty when there is no catalog.</returns>
    public IReadOnlyList<GitCatalogSection> Sections()
    {
        string path = options.Value.CatalogPath;
        DateTime written = File.Exists(path) ? File.GetLastWriteTimeUtc(path) : DateTime.MinValue;
        lock (gate)
        {
            if (cached is { } known && known.Written == written)
            {
                return known.Sections;
            }

            IReadOnlyList<GitCatalogSection> sections = written == DateTime.MinValue ? [] : Read(path);
            cached = (written, sections);
            return sections;
        }
    }

    /// <summary>One repository by name, when the catalog has it and its mirror exists.</summary>
    /// <param name="name">The name.</param>
    /// <returns>The repository and the path of its mirror, or <see langword="null"/>.</returns>
    public (GitCatalogRepository Repository, string MirrorPath)? Find(string name)
    {
        if (!IsName(name))
        {
            return null;
        }

        foreach (GitCatalogSection section in Sections())
        {
            foreach (GitCatalogRepository repository in section.Repositories)
            {
                if (string.Equals(repository.Name, name, StringComparison.Ordinal))
                {
                    string mirror = MirrorOf(repository.Name);
                    return Directory.Exists(mirror) ? (repository, mirror) : null;
                }
            }
        }

        return null;
    }

    /// <summary>The path of a repository's mirror.</summary>
    /// <param name="name">A valid name.</param>
    /// <returns>The path.</returns>
    public string MirrorOf(string name) => Path.Combine(options.Value.MirrorsPath, name + ".git");

    /// <summary>Reads and checks the catalog file.</summary>
    /// <param name="path">The file.</param>
    /// <returns>Its sections.</returns>
    /// <exception cref="InvalidDataException">The file is empty or names something that is not a repository name.</exception>
    private static IReadOnlyList<GitCatalogSection> Read(string path)
    {
        using FileStream stream = File.OpenRead(path);
        GitCatalogFile file = JsonSerializer.Deserialize<GitCatalogFile>(stream, JsonOptions)
            ?? throw new InvalidDataException($"{path} is empty.");
        foreach (GitCatalogSection section in file.Sections)
        {
            foreach (GitCatalogRepository repository in section.Repositories)
            {
                if (!IsName(repository.Name))
                {
                    throw new InvalidDataException($"{path} names a repository '{repository.Name}' that is not a name.");
                }
            }
        }

        return file.Sections;
    }

    /// <summary>The shape of the catalog file.</summary>
    /// <param name="Sections">The sections.</param>
    private sealed record GitCatalogFile(IReadOnlyList<GitCatalogSection> Sections);
}
