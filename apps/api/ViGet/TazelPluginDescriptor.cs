// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;

namespace Progmasoft.Progmaweb.Api.ViGet;

/// <summary>
/// The descriptor of a Tazel plugin, <c>META-INF/tazel-plugin.properties</c> of its JAR, as Tazel reads it, with the
/// fields ViGet shows on the page of the plugin.
/// </summary>
/// <param name="Publisher">The Progmasoft Account the plugin is published under.</param>
/// <param name="Name">The name of the plugin; one identifier.</param>
/// <param name="Version">An exact semantic version.</param>
/// <param name="ApiVersion">The plugin API of Tazel it was built for.</param>
/// <param name="Description">What the plugin does.</param>
/// <param name="Authors">The authors, in the order of the descriptor.</param>
/// <param name="License">An SPDX license expression.</param>
/// <param name="Homepage">An https address of the plugin.</param>
/// <param name="Repository">An https address of its sources.</param>
internal sealed partial record TazelPluginDescriptor(
    string Publisher,
    string Name,
    string Version,
    int ApiVersion,
    string? Description,
    IReadOnlyList<string> Authors,
    string? License,
    string? Homepage,
    string? Repository)
{
    /// <summary>Where the descriptor lies in the JAR.</summary>
    public const string DescriptorEntry = "META-INF/tazel-plugin.properties";

    /// <summary>The service entry that names the class Tazel loads.</summary>
    public const string ServiceEntry = "META-INF/services/com.progmasoft.api.tazel.dsl.plugin.ProjectPlugin";

    /// <summary>Whether a text is one identifier, as Tazel requires of a publisher and a plugin name.</summary>
    public static bool IsIdentifier(string value) => IdentifierPattern().IsMatch(value);

    /// <summary>Whether a text is an exact semantic version, as Tazel requires of a plugin version.</summary>
    public static bool IsVersion(string value) => VersionPattern().IsMatch(value);

    /// <summary>Reads and checks the descriptor of a plugin JAR.</summary>
    /// <param name="jar">The bytes of the JAR.</param>
    /// <param name="descriptor">The descriptor, when the JAR is a valid plugin.</param>
    /// <returns>Why the JAR is refused, or <see langword="null"/> when it is valid.</returns>
    public static string? TryRead(byte[] jar, out TazelPluginDescriptor? descriptor)
    {
        descriptor = null;
        IReadOnlyDictionary<string, string> properties;
        try
        {
            using ZipArchive archive = new(new MemoryStream(jar, writable: false), ZipArchiveMode.Read);
            ZipArchiveEntry? entry = archive.GetEntry(DescriptorEntry);
            if (entry is null)
            {
                return $"The JAR has no {DescriptorEntry}.";
            }

            ZipArchiveEntry? service = archive.GetEntry(ServiceEntry);
            if (service is null || service.Length == 0)
            {
                return $"The JAR has no {ServiceEntry}.";
            }

            using StreamReader reader = new(entry.Open(), Encoding.Latin1);
            properties = JavaProperties.Parse(reader.ReadToEnd());
        }
        catch (InvalidDataException)
        {
            return "The file is not a JAR.";
        }
        catch (FormatException error)
        {
            return $"The descriptor is not a properties file: {error.Message}";
        }

        string? Text(string key) =>
            properties.TryGetValue(key, out string? value) && !string.IsNullOrWhiteSpace(value) ? value.Trim() : null;

        string? publisher = Text("publisher");
        string? name = Text("name");
        string? version = Text("version");
        if (publisher is null || !IsIdentifier(publisher))
        {
            return "The descriptor needs a publisher that is one identifier.";
        }

        if (name is null || !IsIdentifier(name))
        {
            return "The descriptor needs a name that is one identifier.";
        }

        if (version is null || !IsVersion(version))
        {
            return "The descriptor needs an exact semantic version.";
        }

        if (!int.TryParse(Text("apiVersion"), out int apiVersion) || apiVersion < 1)
        {
            return "The descriptor needs an API version.";
        }

        List<string> authors = [];
        for (int index = 0; Text($"author.{index}") is { } author; index++)
        {
            authors.Add(author);
        }

        string? homepage = Text("homepage");
        string? repository = Text("repository");
        foreach ((string key, string? address) in new[] { ("homepage", homepage), ("repository", repository) })
        {
            if (address is not null &&
                (!Uri.TryCreate(address, UriKind.Absolute, out Uri? uri) || uri.Scheme != Uri.UriSchemeHttps))
            {
                return $"The {key} of the descriptor is not an https address.";
            }
        }

        descriptor = new TazelPluginDescriptor(
            publisher, name, version, apiVersion, Text("description"), authors, Text("license"), homepage, repository);
        return null;
    }

    /// <summary>One identifier: a letter or <c>_</c>, then letters, digits or <c>_</c>.</summary>
    /// <returns>The compiled expression.</returns>
    [GeneratedRegex("^[A-Za-z_][A-Za-z0-9_]*$")]
    private static partial Regex IdentifierPattern();

    /// <summary>An exact semantic version without leading zeros or build metadata, as Tazel accepts it.</summary>
    /// <returns>The compiled expression.</returns>
    [GeneratedRegex(@"^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[0-9A-Za-z.-]+)?$")]
    private static partial Regex VersionPattern();
}
