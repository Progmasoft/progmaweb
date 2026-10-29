// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Npgsql;

namespace Progmasoft.Progmaweb.Api.ViGet;

/// <summary>
/// The commands that manage the Tazel plugin catalog on the server, while publishing is not open through the API:
/// <c>viget publish-tazel-plugin &lt;jar&gt;</c> and <c>viget yank-tazel-plugin &lt;Publisher&gt; &lt;Name&gt;
/// &lt;Version&gt; [--undo]</c>. They run with the configuration of the service, as its user.
/// </summary>
internal static class ViGetCommand
{
    /// <summary>Whether the arguments of the program ask for a ViGet command rather than the web service.</summary>
    public static bool IsCommand(string[] args) => args is ["viget", ..];

    /// <summary>Runs a ViGet command.</summary>
    /// <param name="services">The services of the API, not started.</param>
    /// <param name="args">The arguments after <c>viget</c>.</param>
    /// <param name="output">Where results go.</param>
    /// <param name="errors">Where errors go.</param>
    /// <param name="cancellationToken">Cancels the command.</param>
    /// <returns>The exit code: 0 on success, 1 when the command was refused, 2 for a wrong command line.</returns>
    public static async Task<int> RunAsync(
        IServiceProvider services,
        string[] args,
        TextWriter output,
        TextWriter errors,
        CancellationToken cancellationToken)
    {
        // The service applies the schema when it starts; a command may run before it ever did.
        if (services.GetService<NpgsqlDataSource>() is { } dataSource)
        {
            await ViGetSchema.ApplyAsync(dataSource, cancellationToken);
        }

        switch (args)
        {
            case ["publish-tazel-plugin", string path]:
            {
                if (!File.Exists(path))
                {
                    await errors.WriteLineAsync($"{path} does not exist.");
                    return 1;
                }

                TazelPluginPublishing publishing = services.GetRequiredService<TazelPluginPublishing>();
                PublishResult result = await publishing.PublishAsync(
                    await File.ReadAllBytesAsync(path, cancellationToken), cancellationToken);
                if (!result.Published)
                {
                    await errors.WriteLineAsync(result.Error);
                    return 1;
                }

                TazelPluginDescriptor plugin = result.Plugin!;
                await output.WriteLineAsync(
                    $"Published {plugin.Publisher}.{plugin.Name} {plugin.Version}: " +
                    $"https://viget.progmasoft.com/dslplugins/tazel/{plugin.Publisher}/{plugin.Name}");
                return 0;
            }
            case ["yank-tazel-plugin", string publisher, string name, string version, .. var rest]
                when rest is [] or ["--undo"]:
            {
                bool yanked = rest is [];
                ITazelPluginCatalog catalog = services.GetRequiredService<ITazelPluginCatalog>();
                if (!await catalog.SetYankedAsync(publisher, name, version, yanked, cancellationToken))
                {
                    await errors.WriteLineAsync($"{publisher}.{name} has no version {version}.");
                    return 1;
                }

                await output.WriteLineAsync(
                    $"{publisher}.{name} {version} is {(yanked ? "yanked" : "no longer yanked")}.");
                return 0;
            }
            default:
                await errors.WriteLineAsync(
                    "usage: viget publish-tazel-plugin <jar>\n" +
                    "       viget yank-tazel-plugin <Publisher> <Name> <Version> [--undo]");
                return 2;
        }
    }
}
