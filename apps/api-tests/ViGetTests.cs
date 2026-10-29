// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.IO.Compression;
using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.Api.Accounts;
using Progmasoft.Progmaweb.Api.ViGet;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>The Tazel plugin catalog of ViGet: the descriptor, publishing, the endpoints and the command.</summary>
public sealed class ViGetTests : IDisposable
{
    private readonly string artifactRoot = Path.Combine(Path.GetTempPath(), "viget-" + Guid.NewGuid().ToString("N"));

    /// <inheritdoc/>
    public void Dispose()
    {
        if (Directory.Exists(artifactRoot))
        {
            Directory.Delete(artifactRoot, recursive: true);
        }
    }

    [Fact]
    public void PropertiesAreReadAsJavaReadsThem()
    {
        IReadOnlyDictionary<string, string> properties = JavaProperties.Parse(
            "# a comment\n" +
            "! another\n" +
            "publisher=Progmasoft\n" +
            "homepage = https\\://example.com/a\n" +
            "description:Builds C \\u0026 C++,\\\n" +
            "    on every host.\n" +
            "key\\ with\\ spaces value\n" +
            "empty=\n");
        Assert.Equal("Progmasoft", properties["publisher"]);
        Assert.Equal("https://example.com/a", properties["homepage"]);
        Assert.Equal("Builds C & C++,on every host.", properties["description"]);
        Assert.Equal("value", properties["key with spaces"]);
        Assert.Equal(string.Empty, properties["empty"]);
        Assert.Throws<FormatException>(() => JavaProperties.Parse("broken=\\u12"));
    }

    [Fact]
    public void TheDescriptorOfAPluginJarIsReadAndChecked()
    {
        Assert.Null(TazelPluginDescriptor.TryRead(Jar(), out TazelPluginDescriptor? descriptor));
        Assert.Equal(
            new TazelPluginDescriptor(
                "Progmasoft", "CMake", "0.1.0", 2, "Builds CMake projects.", ["First Author", "Second Author"],
                "MPL-2.0", "https://example.com/cmake", null),
            descriptor!,
            new DescriptorComparer());

        Assert.Equal("The JAR has no META-INF/services/com.progmasoft.api.tazel.dsl.plugin.ProjectPlugin.",
            TazelPluginDescriptor.TryRead(Jar(service: false), out _));
        Assert.Equal("The descriptor needs an exact semantic version.",
            TazelPluginDescriptor.TryRead(Jar(version: "1.0"), out _));
        Assert.Equal("The descriptor needs a name that is one identifier.",
            TazelPluginDescriptor.TryRead(Jar(name: "c-make"), out _));
        Assert.Equal("The homepage of the descriptor is not an https address.",
            TazelPluginDescriptor.TryRead(Jar(homepage: "http\\://example.com"), out _));
        Assert.Equal("The file is not a JAR.", TazelPluginDescriptor.TryRead("not a zip"u8.ToArray(), out _));
    }

    [Fact]
    public async Task OnlyAnAllowedPublisherWithAnAccountPublishes()
    {
        (TazelPluginPublishing publishing, InMemoryAccountStore accounts, ITazelPluginCatalog catalog) = Publishing();
        CancellationToken cancellationToken = TestContext.Current.CancellationToken;

        PublishResult noAccount = await publishing.PublishAsync(Jar(), cancellationToken);
        Assert.Equal("No Progmasoft Account is named 'Progmasoft'.", noAccount.Error);

        await AddAccountAsync(accounts, "Progmasoft");
        await AddAccountAsync(accounts, "Someone");
        PublishResult notAllowed = await publishing.PublishAsync(Jar(publisher: "Someone"), cancellationToken);
        Assert.Equal(
            "Publishing Tazel plugins is open to Progmasoft for now; 'Someone' cannot publish yet.",
            notAllowed.Error);

        byte[] jar = Jar();
        PublishResult published = await publishing.PublishAsync(jar, cancellationToken);
        Assert.True(published.Published, published.Error);
        string file = Path.Combine(artifactRoot, "dslplugins", "tazel", "Progmasoft", "CMake", "0.1.0", "CMake-0.1.0.jar");
        Assert.Equal(jar, await File.ReadAllBytesAsync(file, cancellationToken));
        TazelPlugin plugin = (await catalog.FindAsync("Progmasoft", "CMake", cancellationToken))!;
        Assert.Equal(Convert.ToHexStringLower(SHA256.HashData(jar)), plugin.Versions.Single().Sha256);
        Assert.Equal("MPL-2.0", plugin.License);

        PublishResult again = await publishing.PublishAsync(Jar(description: "Another build."), cancellationToken);
        Assert.Equal("Progmasoft.CMake 0.1.0 is published already.", again.Error);
        Assert.Equal(jar, await File.ReadAllBytesAsync(file, cancellationToken));

        PublishResult folded = await publishing.PublishAsync(Jar(name: "CMAKE", version: "0.2.0"), cancellationToken);
        Assert.Equal(
            "Progmasoft has a plugin whose name differs from 'CMAKE' only in letter case.", folded.Error);
        Assert.False(File.Exists(Path.Combine(
            artifactRoot, "dslplugins", "tazel", "Progmasoft", "CMAKE", "0.2.0", "CMAKE-0.2.0.jar")));
    }

    [Fact]
    public async Task ViGetNeedsADescriptionAnAuthorAndALicense()
    {
        (TazelPluginPublishing publishing, InMemoryAccountStore accounts, _) = Publishing();
        await AddAccountAsync(accounts, "Progmasoft");
        PublishResult result = await publishing.PublishAsync(Jar(license: null), TestContext.Current.CancellationToken);
        Assert.Equal(
            "ViGet needs a description, at least one author and a license in the descriptor.", result.Error);
    }

    [Fact]
    public async Task TheIndexIsWhatTazelReads()
    {
        await using AccountApiFactory factory = new();
        ITazelPluginCatalog catalog = factory.Services.GetRequiredService<ITazelPluginCatalog>();
        CancellationToken cancellationToken = TestContext.Current.CancellationToken;
        Assert.Null(TazelPluginDescriptor.TryRead(Jar(), out TazelPluginDescriptor? descriptor));
        await catalog.AddVersionAsync(descriptor!, new string('a', 64), 10, DateTimeOffset.UnixEpoch, cancellationToken);
        await catalog.AddVersionAsync(
            descriptor! with { Version = "0.2.0" }, new string('b', 64), 10, DateTimeOffset.UnixEpoch.AddDays(1),
            cancellationToken);
        await catalog.SetYankedAsync("Progmasoft", "CMake", "0.2.0", true, cancellationToken);
        using HttpClient client = factory.CreateClient();

        using JsonDocument index = JsonDocument.Parse(await client.GetStringAsync(
            "/api/v1/viget/dslplugins/tazel/Progmasoft/CMake/index.json", cancellationToken));
        Assert.Equal("Progmasoft", index.RootElement.GetProperty("publisher").GetString());
        Assert.Equal("CMake", index.RootElement.GetProperty("name").GetString());
        JsonElement[] versions = [.. index.RootElement.GetProperty("versions").EnumerateArray()];
        Assert.Equal(["0.2.0", "0.1.0"], versions.Select(version => version.GetProperty("version").GetString()));
        Assert.True(versions[0].GetProperty("yanked").GetBoolean());
        Assert.Equal(2, versions[1].GetProperty("apiVersion").GetInt32());
        Assert.Equal(new string('a', 64), versions[1].GetProperty("sha256").GetString());

        using JsonDocument detail = JsonDocument.Parse(await client.GetStringAsync(
            "/api/v1/viget/dslplugins/tazel/Progmasoft/CMake", cancellationToken));
        Assert.Equal("0.1.0", detail.RootElement.GetProperty("latestVersion").GetString());
        Assert.Equal(
            "/dslplugins/tazel/Progmasoft/CMake/0.1.0/CMake-0.1.0.jar",
            detail.RootElement.GetProperty("versions")[1].GetProperty("path").GetString());

        using JsonDocument list = JsonDocument.Parse(
            await client.GetStringAsync("/api/v1/viget/dslplugins/tazel", cancellationToken));
        Assert.Equal("CMake", list.RootElement.GetProperty("plugins")[0].GetProperty("name").GetString());

        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(
            "/api/v1/viget/dslplugins/tazel/Progmasoft/Missing/index.json", cancellationToken)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(
            "/api/v1/viget/dslplugins/tazel/Progmasoft/not-a-name/index.json", cancellationToken)).StatusCode);
    }

    [Fact]
    public async Task TheCommandPublishesAndYanks()
    {
        (TazelPluginPublishing publishing, InMemoryAccountStore accounts, ITazelPluginCatalog catalog) = Publishing();
        await AddAccountAsync(accounts, "Progmasoft");
        ServiceProvider services = new ServiceCollection()
            .AddSingleton(publishing)
            .AddSingleton(catalog)
            .BuildServiceProvider();
        string jar = Path.Combine(artifactRoot, "upload.jar");
        Directory.CreateDirectory(artifactRoot);
        await File.WriteAllBytesAsync(jar, Jar(), TestContext.Current.CancellationToken);
        StringWriter output = new();
        StringWriter errors = new();

        Assert.Equal(0, await ViGetCommand.RunAsync(
            services, ["publish-tazel-plugin", jar], output, errors, TestContext.Current.CancellationToken));
        Assert.Contains("Published Progmasoft.CMake 0.1.0", output.ToString(), StringComparison.Ordinal);
        Assert.Equal(0, await ViGetCommand.RunAsync(
            services, ["yank-tazel-plugin", "Progmasoft", "CMake", "0.1.0"], output, errors,
            TestContext.Current.CancellationToken));
        Assert.True((await catalog.FindAsync("Progmasoft", "CMake", TestContext.Current.CancellationToken))!
            .Versions.Single().Yanked);
        Assert.Equal(1, await ViGetCommand.RunAsync(
            services, ["publish-tazel-plugin", jar], output, errors, TestContext.Current.CancellationToken));
        Assert.Equal(2, await ViGetCommand.RunAsync(
            services, ["publish"], output, errors, TestContext.Current.CancellationToken));
    }

    private (TazelPluginPublishing, InMemoryAccountStore, ITazelPluginCatalog) Publishing()
    {
        InMemoryAccountStore accounts = new();
        InMemoryTazelPluginCatalog catalog = new();
        TazelPluginPublishing publishing = new(
            catalog,
            accounts,
            Options.Create(new ViGetOptions { ArtifactRoot = artifactRoot }),
            TimeProvider.System);
        return (publishing, accounts, catalog);
    }

    private static async Task AddAccountAsync(InMemoryAccountStore accounts, string name) =>
        await accounts.CreateAsync(
            new AccountRecord(
                Guid.NewGuid(),
                name,
                AccountNamePolicy.NormalizeForLookup(name),
                $"{name}@example.com",
                $"{name}@example.com".ToUpperInvariant(),
                null,
                null,
                DateTimeOffset.UnixEpoch),
            TestContext.Current.CancellationToken);

    private static byte[] Jar(
        string publisher = "Progmasoft",
        string name = "CMake",
        string version = "0.1.0",
        string? description = "Builds CMake projects.",
        string? license = "MPL-2.0",
        string homepage = "https\\://example.com/cmake",
        bool service = true)
    {
        using MemoryStream bytes = new();
        using (ZipArchive archive = new(bytes, ZipArchiveMode.Create, leaveOpen: true))
        {
            List<string> lines =
            [
                "publisher=" + publisher,
                "name=" + name,
                "version=" + version,
                "apiVersion=2",
                "author.0=First Author",
                "author.1=Second Author",
                "homepage=" + homepage
            ];
            if (description is not null)
            {
                lines.Add("description=" + description);
            }

            if (license is not null)
            {
                lines.Add("license=" + license);
            }

            using (StreamWriter writer = new(archive.CreateEntry(TazelPluginDescriptor.DescriptorEntry).Open()))
            {
                writer.Write(string.Join('\n', lines) + "\n");
            }

            if (service)
            {
                using StreamWriter writer = new(archive.CreateEntry(TazelPluginDescriptor.ServiceEntry).Open());
                writer.Write("com.example.CMakePlugin\n");
            }
        }

        return bytes.ToArray();
    }

    /// <summary>Compares descriptors by value, with their authors as sequences.</summary>
    private sealed class DescriptorComparer : IEqualityComparer<TazelPluginDescriptor>
    {
        public bool Equals(TazelPluginDescriptor? left, TazelPluginDescriptor? right) =>
            left is not null && right is not null &&
            left with { Authors = [] } == right with { Authors = [] } &&
            left.Authors.SequenceEqual(right.Authors);

        public int GetHashCode(TazelPluginDescriptor descriptor) => descriptor.Name.GetHashCode(StringComparison.Ordinal);
    }
}
