// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.ViGet;

/// <summary>The settings of ViGet, from the configuration section <c>ViGet</c>.</summary>
internal sealed class ViGetOptions
{
    /// <summary>The name of the configuration section.</summary>
    public const string SectionName = "ViGet";

    /// <summary>
    /// The directory the files of ViGet are kept in, which Nginx serves: a JAR lies at
    /// <c>dslplugins/tazel/&lt;Publisher&gt;/&lt;Name&gt;/&lt;Version&gt;/&lt;Name&gt;-&lt;Version&gt;.jar</c> below it.
    /// </summary>
    public string ArtifactRoot { get; set; } = "/srv/viget/files";

    /// <summary>
    /// The accounts that may publish Tazel plugins. ViGet opens publishing in stages: first to Progmasoft alone,
    /// later to every account.
    /// </summary>
    public List<string> TazelPublishers { get; set; } = ["Progmasoft"];
}

/// <summary>What publishing a plugin did.</summary>
/// <param name="Plugin">The descriptor of the published version, when it was published.</param>
/// <param name="Error">Why it was refused, when it was.</param>
internal sealed record PublishResult(TazelPluginDescriptor? Plugin, string? Error)
{
    /// <summary>Whether the version was published.</summary>
    public bool Published => Error is null;
}

/// <summary>Publishes Tazel plugins: checks a JAR, keeps its file and adds its version to the catalog.</summary>
/// <param name="catalog">The catalog.</param>
/// <param name="accounts">The accounts, which name the publishers.</param>
/// <param name="options">Where the files go and who may publish.</param>
/// <param name="time">The clock.</param>
internal sealed class TazelPluginPublishing(
    ITazelPluginCatalog catalog,
    IAccountStore accounts,
    IOptions<ViGetOptions> options,
    TimeProvider time)
{
    /// <summary>The largest JAR ViGet takes.</summary>
    public const long MaximumSize = 64L * 1024 * 1024;

    /// <summary>The path of the JAR of a version, relative to <see cref="ViGetOptions.ArtifactRoot"/>.</summary>
    public static string RelativePath(string publisher, string name, string version) =>
        Path.Combine("dslplugins", "tazel", publisher, name, version, $"{name}-{version}.jar");

    /// <summary>Publishes the plugin in a JAR.</summary>
    /// <param name="jar">The bytes of the JAR.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The published descriptor, or why the JAR was refused.</returns>
    public async Task<PublishResult> PublishAsync(byte[] jar, CancellationToken cancellationToken)
    {
        if (jar.LongLength > MaximumSize)
        {
            return Refused($"The JAR is larger than {MaximumSize / 1024 / 1024} MiB.");
        }

        if (TazelPluginDescriptor.TryRead(jar, out TazelPluginDescriptor? descriptor) is { } invalid)
        {
            return Refused(invalid);
        }

        // ViGet shows these on the page of the plugin; Tazel itself does not need them.
        if (descriptor!.Description is null || descriptor.Authors.Count == 0 || descriptor.License is null)
        {
            return Refused("ViGet needs a description, at least one author and a license in the descriptor.");
        }

        if (!options.Value.TazelPublishers.Contains(descriptor.Publisher, StringComparer.Ordinal))
        {
            return Refused(
                $"Publishing Tazel plugins is open to {string.Join(", ", options.Value.TazelPublishers)} for now; " +
                $"'{descriptor.Publisher}' cannot publish yet.");
        }

        AccountRecord? account = await accounts.FindByAccountNameAsync(
            AccountNamePolicy.NormalizeForLookup(descriptor.Publisher), cancellationToken);
        if (account is null || !string.Equals(account.AccountName, descriptor.Publisher, StringComparison.Ordinal))
        {
            return Refused($"No Progmasoft Account is named '{descriptor.Publisher}'.");
        }

        TazelPlugin? existing = await catalog.FindAsync(descriptor.Publisher, descriptor.Name, cancellationToken);
        if (existing?.Versions.Any(version => version.Version == descriptor.Version) == true)
        {
            return Refused($"{descriptor.Publisher}.{descriptor.Name} {descriptor.Version} is published already.");
        }

        string sha256 = Convert.ToHexStringLower(SHA256.HashData(jar));
        string target = Path.Combine(
            options.Value.ArtifactRoot, RelativePath(descriptor.Publisher, descriptor.Name, descriptor.Version));
        bool written = await WriteAsync(target, jar, sha256, cancellationToken);

        AddVersionResult result = await catalog.AddVersionAsync(
            descriptor, sha256, jar.LongLength, time.GetUtcNow(), cancellationToken);
        if (result is not AddVersionResult.Added)
        {
            if (written)
            {
                File.Delete(target);
            }

            return Refused(result is AddVersionResult.NameTaken
                ? $"{descriptor.Publisher} has a plugin whose name differs from '{descriptor.Name}' only in letter case."
                : $"{descriptor.Publisher}.{descriptor.Name} {descriptor.Version} is published already.");
        }

        return new PublishResult(descriptor, null);
    }

    /// <summary>Writes the JAR of a version; a file that is there already must be the same bytes.</summary>
    /// <returns>Whether the file was written now.</returns>
    private static async Task<bool> WriteAsync(
        string target,
        byte[] jar,
        string sha256,
        CancellationToken cancellationToken)
    {
        if (File.Exists(target))
        {
            byte[] present = await File.ReadAllBytesAsync(target, cancellationToken);
            if (Convert.ToHexStringLower(SHA256.HashData(present)) != sha256)
            {
                throw new InvalidOperationException(
                    $"{target} exists with other bytes, and no version of the catalog names it.");
            }

            return false;
        }

        Directory.CreateDirectory(Path.GetDirectoryName(target)!);
        string partial = target + ".partial";
        await File.WriteAllBytesAsync(partial, jar, cancellationToken);
        File.Move(partial, target);
        return true;
    }

    private static PublishResult Refused(string error) => new(null, error);
}
