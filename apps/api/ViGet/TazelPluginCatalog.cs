// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.ViGet;

/// <summary>One published version of a Tazel plugin.</summary>
/// <param name="Version">The version.</param>
/// <param name="Sha256">The SHA-256 digest of its JAR, in lower-case hex.</param>
/// <param name="ApiVersion">The plugin API of Tazel it was built for.</param>
/// <param name="Size">The size of its JAR in bytes.</param>
/// <param name="PublishedAt">When it was published.</param>
/// <param name="Yanked">Whether it was yanked: Tazel takes it only when a project names it.</param>
internal sealed record TazelPluginVersion(
    string Version,
    string Sha256,
    int ApiVersion,
    long Size,
    DateTimeOffset PublishedAt,
    bool Yanked);

/// <summary>A Tazel plugin of the catalog, described by the descriptor of its newest publication.</summary>
/// <param name="Publisher">The Progmasoft Account it is published under.</param>
/// <param name="Name">Its name.</param>
/// <param name="Description">What it does.</param>
/// <param name="Authors">Its authors.</param>
/// <param name="License">An SPDX license expression.</param>
/// <param name="Homepage">An https address of the plugin.</param>
/// <param name="Repository">An https address of its sources.</param>
/// <param name="Versions">Its versions, newest publication first.</param>
internal sealed record TazelPlugin(
    string Publisher,
    string Name,
    string? Description,
    IReadOnlyList<string> Authors,
    string? License,
    string? Homepage,
    string? Repository,
    IReadOnlyList<TazelPluginVersion> Versions)
{
    /// <summary>The newest version that is not yanked, or the newest of all when every one is.</summary>
    public TazelPluginVersion Latest =>
        Versions.Where(version => !version.Yanked).DefaultIfEmpty(Versions[0]).First();
}

/// <summary>What adding a version to the catalog did.</summary>
internal enum AddVersionResult
{
    /// <summary>The version was added.</summary>
    Added,

    /// <summary>The plugin has this version already; a version is never replaced.</summary>
    VersionExists,

    /// <summary>A plugin of the publisher has the same name in other letter case.</summary>
    NameTaken,
}

/// <summary>The Tazel plugins of ViGet: their descriptions and versions. The JARs live in files beside it.</summary>
internal interface ITazelPluginCatalog
{
    /// <summary>Every plugin, ordered by publisher and name.</summary>
    ValueTask<IReadOnlyList<TazelPlugin>> ListAsync(CancellationToken cancellationToken);

    /// <summary>A plugin by its exact publisher and name.</summary>
    ValueTask<TazelPlugin?> FindAsync(string publisher, string name, CancellationToken cancellationToken);

    /// <summary>Adds a version, and describes the plugin with the descriptor of that version.</summary>
    ValueTask<AddVersionResult> AddVersionAsync(
        TazelPluginDescriptor descriptor,
        string sha256,
        long size,
        DateTimeOffset publishedAt,
        CancellationToken cancellationToken);

    /// <summary>Yanks a version, or takes the yank back.</summary>
    /// <returns>Whether the plugin has the version.</returns>
    ValueTask<bool> SetYankedAsync(
        string publisher,
        string name,
        string version,
        bool yanked,
        CancellationToken cancellationToken);
}

/// <summary>A catalog that lives as long as the process, for development and tests.</summary>
internal sealed class InMemoryTazelPluginCatalog : ITazelPluginCatalog
{
    /// <summary>Guards <see cref="plugins"/>.</summary>
    private readonly Lock gate = new();
    /// <summary>The plugins by their exact publisher and name.</summary>
    private readonly Dictionary<(string Publisher, string Name), TazelPlugin> plugins = [];

    /// <inheritdoc/>
    public ValueTask<IReadOnlyList<TazelPlugin>> ListAsync(CancellationToken cancellationToken)
    {
        lock (gate)
        {
            return ValueTask.FromResult<IReadOnlyList<TazelPlugin>>(plugins.Values
                .OrderBy(plugin => plugin.Publisher, StringComparer.Ordinal)
                .ThenBy(plugin => plugin.Name, StringComparer.Ordinal)
                .ToList());
        }
    }

    /// <inheritdoc/>
    public ValueTask<TazelPlugin?> FindAsync(string publisher, string name, CancellationToken cancellationToken)
    {
        lock (gate)
        {
            return ValueTask.FromResult(plugins.GetValueOrDefault((publisher, name)));
        }
    }

    /// <inheritdoc/>
    public ValueTask<AddVersionResult> AddVersionAsync(
        TazelPluginDescriptor descriptor,
        string sha256,
        long size,
        DateTimeOffset publishedAt,
        CancellationToken cancellationToken)
    {
        lock (gate)
        {
            (string, string) key = (descriptor.Publisher, descriptor.Name);
            if (!plugins.ContainsKey(key) && plugins.Keys.Any(existing =>
                    string.Equals(existing.Publisher, descriptor.Publisher, StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(existing.Name, descriptor.Name, StringComparison.OrdinalIgnoreCase)))
            {
                return ValueTask.FromResult(AddVersionResult.NameTaken);
            }

            List<TazelPluginVersion> versions = plugins.TryGetValue(key, out TazelPlugin? existingPlugin)
                ? [.. existingPlugin.Versions]
                : [];
            if (versions.Any(version => version.Version == descriptor.Version))
            {
                return ValueTask.FromResult(AddVersionResult.VersionExists);
            }

            versions.Insert(
                0, new TazelPluginVersion(descriptor.Version, sha256, descriptor.ApiVersion, size, publishedAt, false));
            plugins[key] = new TazelPlugin(
                descriptor.Publisher,
                descriptor.Name,
                descriptor.Description,
                descriptor.Authors,
                descriptor.License,
                descriptor.Homepage,
                descriptor.Repository,
                versions);
            return ValueTask.FromResult(AddVersionResult.Added);
        }
    }

    /// <inheritdoc/>
    public ValueTask<bool> SetYankedAsync(
        string publisher,
        string name,
        string version,
        bool yanked,
        CancellationToken cancellationToken)
    {
        lock (gate)
        {
            if (!plugins.TryGetValue((publisher, name), out TazelPlugin? plugin) ||
                plugin.Versions.All(existing => existing.Version != version))
            {
                return ValueTask.FromResult(false);
            }

            plugins[(publisher, name)] = plugin with
            {
                Versions = [.. plugin.Versions.Select(existing =>
                    existing.Version == version ? existing with { Yanked = yanked } : existing)]
            };
            return ValueTask.FromResult(true);
        }
    }
}
