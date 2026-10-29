// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.ViGet;

/// <summary>The read endpoints of the Tazel plugin catalog.</summary>
/// <remarks>
/// <para>
/// The pages of ViGet read the catalog from these endpoints on the loopback address of the API; Nginx does not pass
/// <c>/api/</c> of the ViGet host on. What the public reaches is the index of a plugin, which Tazel reads at
/// <c>https://viget.progmasoft.com/dslplugins/tazel/&lt;Publisher&gt;/&lt;Name&gt;/index.json</c>: Nginx passes
/// that address to <c>/api/v1/viget/dslplugins/tazel/&lt;Publisher&gt;/&lt;Name&gt;/index.json</c>, and serves the
/// JARs from the files of ViGet itself.
/// </para>
/// </remarks>
internal static class ViGetEndpoints
{
    /// <summary>Maps the endpoints.</summary>
    /// <param name="app">The routes of the API.</param>
    public static void MapViGetEndpoints(this IEndpointRouteBuilder app)
    {
        RouteGroupBuilder tazel = app.MapGroup("/api/v1/viget/dslplugins/tazel");

        tazel.MapGet("/", async (ITazelPluginCatalog catalog, CancellationToken cancellationToken) =>
        {
            IReadOnlyList<TazelPlugin> plugins = await catalog.ListAsync(cancellationToken);
            return Results.Ok(new
            {
                plugins = plugins.Select(plugin => new
                {
                    plugin.Publisher,
                    plugin.Name,
                    plugin.Description,
                    plugin.License,
                    latestVersion = plugin.Latest.Version,
                    updatedAt = plugin.Versions[0].PublishedAt
                })
            });
        });

        tazel.MapGet("/{publisher}/{name}", async (
            string publisher,
            string name,
            ITazelPluginCatalog catalog,
            CancellationToken cancellationToken) =>
        {
            TazelPlugin? plugin = await FindAsync(catalog, publisher, name, cancellationToken);
            return plugin is null
                ? Results.NotFound()
                : Results.Ok(new
                {
                    plugin.Publisher,
                    plugin.Name,
                    plugin.Description,
                    plugin.Authors,
                    plugin.License,
                    plugin.Homepage,
                    plugin.Repository,
                    latestVersion = plugin.Latest.Version,
                    versions = plugin.Versions.Select(version => new
                    {
                        version.Version,
                        version.Sha256,
                        version.ApiVersion,
                        version.Size,
                        version.PublishedAt,
                        version.Yanked,
                        path = $"/dslplugins/tazel/{plugin.Publisher}/{plugin.Name}/{version.Version}/" +
                               $"{plugin.Name}-{version.Version}.jar"
                    })
                });
        });

        // The index Tazel reads to choose a version and check the JAR it downloads.
        tazel.MapGet("/{publisher}/{name}/index.json", async (
            string publisher,
            string name,
            ITazelPluginCatalog catalog,
            CancellationToken cancellationToken) =>
        {
            TazelPlugin? plugin = await FindAsync(catalog, publisher, name, cancellationToken);
            return plugin is null
                ? Results.NotFound()
                : Results.Ok(new
                {
                    plugin.Publisher,
                    plugin.Name,
                    versions = plugin.Versions.Select(version => new
                    {
                        version.Version,
                        version.Sha256,
                        version.ApiVersion,
                        version.Yanked
                    })
                });
        });
    }

    private static ValueTask<TazelPlugin?> FindAsync(
        ITazelPluginCatalog catalog,
        string publisher,
        string name,
        CancellationToken cancellationToken) =>
        TazelPluginDescriptor.IsIdentifier(publisher) && TazelPluginDescriptor.IsIdentifier(name)
            ? catalog.FindAsync(publisher, name, cancellationToken)
            : ValueTask.FromResult<TazelPlugin?>(null);
}
