// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

using System.Diagnostics;
using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.Api.Git;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>A bare mirror made for the tests: two commits on main, a branch with a slash and a tag.</summary>
public sealed class GitFixture : IDisposable
{
    public GitFixture()
    {
        Directory.CreateDirectory(Path.Combine(Root, "mirrors"));
        string work = Path.Combine(Root, "work");
        Directory.CreateDirectory(Path.Combine(work, "src"));
        Git(work, "init", "--quiet", "--initial-branch=main");
        File.WriteAllText(Path.Combine(work, "README.md"), "# Sample\n");
        File.WriteAllText(Path.Combine(work, "src", "main.c"), "int main(void) { return 0; }\n");
        File.WriteAllBytes(Path.Combine(work, "logo.bin"), [0x89, 0x50, 0x00, 0x01, 0x02]);
        Git(work, "add", "--all");
        Git(work, "commit", "--quiet", "-m", "First\n\nThe body.");
        First = Git(work, "rev-parse", "HEAD").Trim();
        File.WriteAllText(Path.Combine(work, "src", "main.c"), "int main(void) { return 1; }\n");
        Git(work, "commit", "--quiet", "--all", "-m", "Second");
        Second = Git(work, "rev-parse", "HEAD").Trim();
        Git(work, "tag", "-a", "sample-1.0.0", "-m", "Release", First);
        Git(work, "branch", "feature/slash", First);
        Git(Root, "clone", "--quiet", "--bare", work, Path.Combine(Root, "mirrors", "sample.git"));
        File.WriteAllText(Path.Combine(Root, "catalog.json"), """
            { "sections": [
              { "name": "Samples", "repositories": [
                { "name": "sample", "description": "A sample." },
                { "name": "absent", "description": "Listed, but not mirrored." } ] } ] }
            """);
    }

    public string Root { get; } = Path.Combine(Path.GetTempPath(), "progmaweb-git-" + Guid.NewGuid().ToString("N"));

    public string First { get; }

    public string Second { get; }

    public string Mirror => Path.Combine(Root, "mirrors", "sample.git");

    internal IOptions<GitOptions> Options => Microsoft.Extensions.Options.Options.Create(new GitOptions
    {
        MirrorsPath = Path.Combine(Root, "mirrors"),
        CatalogPath = Path.Combine(Root, "catalog.json"),
        GitPath = "git"
    });

    public void Dispose() => Directory.Delete(Root, recursive: true);

    private static string Git(string directory, params string[] arguments)
    {
        ProcessStartInfo start = new("git") { WorkingDirectory = directory, RedirectStandardOutput = true };
        foreach (string argument in arguments)
        {
            start.ArgumentList.Add(argument);
        }

        start.Environment["GIT_AUTHOR_NAME"] = "Sample Author";
        start.Environment["GIT_AUTHOR_EMAIL"] = "author@example.com";
        start.Environment["GIT_COMMITTER_NAME"] = "Sample Author";
        start.Environment["GIT_COMMITTER_EMAIL"] = "author@example.com";
        start.Environment["GIT_CONFIG_GLOBAL"] = "/dev/null";
        using Process process = Process.Start(start)!;
        string output = process.StandardOutput.ReadToEnd();
        process.WaitForExit();
        Assert.Equal(0, process.ExitCode);
        return output;
    }
}

/// <summary>git.progmasoft.com: what the API reads from a mirror, and what it refuses.</summary>
public sealed class GitTests(GitFixture fixture) : IClassFixture<GitFixture>
{
    private static CancellationToken Cancellation => TestContext.Current.CancellationToken;

    private GitReader Reader => new(fixture.Options);

    [Theory]
    [InlineData("main", true)]
    [InlineData("feature/slash", true)]
    [InlineData("tazel-0.1.0", true)]
    [InlineData("-n", false)]
    [InlineData("--output=/tmp/x", false)]
    [InlineData("main..HEAD", false)]
    [InlineData("a//b", false)]
    [InlineData("/main", false)]
    [InlineData("main/", false)]
    [InlineData("x.lock", false)]
    [InlineData(".hidden", false)]
    [InlineData("a/.hidden", false)]
    [InlineData("HEAD@{1}", false)]
    [InlineData("main~1", false)]
    [InlineData("", false)]
    public void OnlyPlainBranchAndTagNamesAreReferences(string name, bool expected) =>
        Assert.Equal(expected, GitReader.IsRefName(name));

    [Theory]
    [InlineData("", true)]
    [InlineData("src/main.c", true)]
    [InlineData("a b/c", true)]
    [InlineData("../etc/passwd", false)]
    [InlineData("src/../../x", false)]
    [InlineData("src//main.c", false)]
    [InlineData("./src", false)]
    [InlineData("src/\nmain", false)]
    public void APathStaysInsideTheTree(string path, bool expected) => Assert.Equal(expected, GitReader.IsTreePath(path));

    [Fact]
    public void ACommitIsAFullIdentifier()
    {
        Assert.True(GitReader.IsCommitId(fixture.First));
        Assert.True(GitReader.IsCommitId(new string('a', 64)));
        Assert.False(GitReader.IsCommitId(fixture.First[..12]));
        Assert.False(GitReader.IsCommitId(fixture.First.ToUpperInvariant()));
        Assert.False(GitReader.IsCommitId("HEAD"));
    }

    [Fact]
    public async Task BranchesTagsAndCommitsResolveAndNothingElseDoes()
    {
        GitReader git = Reader;
        Assert.Equal("main", await git.DefaultBranchAsync(fixture.Mirror, Cancellation));
        Assert.Equal(fixture.Second, await git.ResolveAsync(fixture.Mirror, "main", Cancellation));
        Assert.Equal(fixture.First, await git.ResolveAsync(fixture.Mirror, "feature/slash", Cancellation));
        // An annotated tag resolves to its commit.
        Assert.Equal(fixture.First, await git.ResolveAsync(fixture.Mirror, "sample-1.0.0", Cancellation));
        Assert.Equal(fixture.First, await git.ResolveAsync(fixture.Mirror, fixture.First, Cancellation));
        foreach (string other in new[] { "HEAD", "main~1", "--all", "missing", new string('0', 40) })
        {
            Assert.Null(await git.ResolveAsync(fixture.Mirror, other, Cancellation));
        }
    }

    [Fact]
    public async Task TreesBlobsLogsCommitsAndRefsReadTheMirror()
    {
        GitReader git = Reader;
        IReadOnlyList<GitTreeEntry> root = await git.TreeAsync(fixture.Mirror, fixture.Second, "", Cancellation);
        Assert.Equal(["src", "README.md", "logo.bin"], root.Select(entry => entry.Name));
        Assert.Equal("tree", root[0].Kind);
        Assert.Equal(9, root[1].Size);
        Assert.Equal("tree", await git.KindAsync(fixture.Mirror, fixture.Second, "src", Cancellation));
        Assert.Equal("blob", await git.KindAsync(fixture.Mirror, fixture.Second, "src/main.c", Cancellation));
        Assert.Null(await git.KindAsync(fixture.Mirror, fixture.Second, "nothing", Cancellation));

        (byte[] bytes, bool isTruncated) = await git.BlobAsync(fixture.Mirror, fixture.Second, "src/main.c", 10, Cancellation);
        Assert.Equal("int main(v"u8.ToArray(), bytes);
        Assert.True(isTruncated);

        (IReadOnlyList<GitLogEntry> commits, bool hasMore) = await git.LogAsync(fixture.Mirror, fixture.Second, "", 0, Cancellation);
        Assert.Equal(["Second", "First"], commits.Select(entry => entry.Subject));
        Assert.Equal("Sample Author", commits[0].Author);
        Assert.False(hasMore);
        (commits, _) = await git.LogAsync(fixture.Mirror, fixture.Second, "README.md", 0, Cancellation);
        Assert.Equal(["First"], commits.Select(entry => entry.Subject));

        GitCommitDetails details = await git.CommitAsync(fixture.Mirror, fixture.Second, Cancellation);
        Assert.Equal([fixture.First], details.Parents);
        Assert.Contains("-int main(void) { return 0; }", details.Diff, StringComparison.Ordinal);
        Assert.Contains("+int main(void) { return 1; }", details.Diff, StringComparison.Ordinal);
        GitCommitDetails first = await git.CommitAsync(fixture.Mirror, fixture.First, Cancellation);
        Assert.Equal("First\n\nThe body.", first.Message);
        Assert.Empty(first.Parents);

        (IReadOnlyList<GitRef> branches, IReadOnlyList<GitRef> tags) = await git.RefsAsync(fixture.Mirror, Cancellation);
        Assert.Equal(["feature/slash", "main"], branches.Select(branch => branch.Name).Order());
        GitRef tag = Assert.Single(tags);
        Assert.Equal("sample-1.0.0", tag.Name);
        Assert.Equal(fixture.First, tag.Commit);
    }

    [Fact]
    public async Task AnArchiveIsAGzipOfTheCommit()
    {
        using MemoryStream archive = new();
        await Reader.ArchiveAsync(fixture.Mirror, fixture.Second, "sample-main/", archive, Cancellation);
        byte[] bytes = archive.ToArray();
        Assert.True(bytes.Length > 20);
        Assert.Equal([0x1f, 0x8b], bytes[..2]);
    }

    [Fact]
    public void TheCatalogShowsOnlyMirroredRepositories()
    {
        GitCatalog catalog = new(fixture.Options);
        Assert.NotNull(catalog.Find("sample"));
        Assert.Null(catalog.Find("absent"));
        Assert.Null(catalog.Find("../sample"));
        Assert.Null(catalog.Find("sample.git"));
        Assert.Equal("Samples", Assert.Single(catalog.Sections()).Name);
    }

    [Fact]
    public void TheInstalledCatalogNamesWhatIsMirrored()
    {
        string ops = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "ops", "git");
        string[] mirrored =
        [
            .. File.ReadAllLines(Path.Combine(ops, "repositories"))
                .Select(line => line.Trim())
                .Where(line => line.Length > 0 && !line.StartsWith('#'))
                .Order(StringComparer.Ordinal)
        ];
        using JsonDocument catalog = JsonDocument.Parse(File.ReadAllText(Path.Combine(ops, "catalog.json")));
        string[] shown =
        [
            .. catalog.RootElement.GetProperty("sections").EnumerateArray()
                .SelectMany(section => section.GetProperty("repositories").EnumerateArray())
                .Select(repository => repository.GetProperty("name").GetString()!)
                .Order(StringComparer.Ordinal)
        ];
        Assert.Equal(mirrored, shown);
    }

    [Fact]
    public async Task TheEndpointsAnswerOnTheGitHostAndLoopbackOnly()
    {
        await using AccountApiFactory factory = new(gitDirectory: fixture.Root);
        using HttpClient loopback = factory.CreateClient();
        HttpResponseMessage listing = await loopback.GetAsync(new Uri("/api/v1/git/repositories/", UriKind.Relative), Cancellation);
        Assert.Equal(HttpStatusCode.OK, listing.StatusCode);
        Assert.Contains("\"sample\"", await listing.Content.ReadAsStringAsync(Cancellation), StringComparison.Ordinal);

        HttpResponseMessage tree = await loopback.GetAsync(
            new Uri("/api/v1/git/repositories/sample/tree?path=logo.bin", UriKind.Relative), Cancellation);
        using (JsonDocument blob = JsonDocument.Parse(await tree.Content.ReadAsStringAsync(Cancellation)))
        {
            Assert.True(blob.RootElement.GetProperty("isBinary").GetBoolean());
            Assert.Equal(JsonValueKind.Null, blob.RootElement.GetProperty("text").ValueKind);
        }

        HttpResponseMessage raw = await loopback.GetAsync(
            new Uri("/api/v1/git/repositories/sample/raw?path=logo.bin", UriKind.Relative), Cancellation);
        Assert.Equal("application/octet-stream", raw.Content.Headers.ContentType?.MediaType);
        Assert.Equal("attachment", raw.Content.Headers.ContentDisposition?.DispositionType);
        raw = await loopback.GetAsync(new Uri("/api/v1/git/repositories/sample/raw?path=README.md", UriKind.Relative), Cancellation);
        Assert.Equal("text/plain", raw.Content.Headers.ContentType?.MediaType);
        Assert.Equal("# Sample\n", await raw.Content.ReadAsStringAsync(Cancellation));

        foreach (string refused in new[]
        {
            "/api/v1/git/repositories/absent",
            "/api/v1/git/repositories/sample/tree?path=../x",
            "/api/v1/git/repositories/sample/tree?ref=--all",
            "/api/v1/git/repositories/sample/commits/HEAD",
            "/api/v1/git/repositories/sample/raw?path=src",
            "/api/v1/git/repositories/sample/log?page=-1"
        })
        {
            HttpResponseMessage response = await loopback.GetAsync(new Uri(refused, UriKind.Relative), Cancellation);
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        using HttpClient gitHost = factory.CreateClient(new() { BaseAddress = new Uri("https://git.progmasoft.com") });
        Assert.Equal(HttpStatusCode.OK, (await gitHost.GetAsync(new Uri("/api/v1/git/repositories/sample/archive", UriKind.Relative), Cancellation)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await gitHost.GetAsync(new Uri("/api/v1/accounts/me", UriKind.Relative), Cancellation)).StatusCode);

        using HttpClient account = factory.CreateClient(new() { BaseAddress = new Uri("https://account.progmasoft.com") });
        Assert.Equal(HttpStatusCode.NotFound, (await account.GetAsync(new Uri("/api/v1/git/repositories/", UriKind.Relative), Cancellation)).StatusCode);
    }

    [Theory]
    [InlineData("dir/report v2.pdf", "report_v2.pdf")]
    [InlineData("a\"b", "a_b")]
    [InlineData("", "file")]
    public void ADownloadIsNamedWithSafeCharactersOnly(string path, string expected) =>
        Assert.Equal(expected, GitEndpoints.SafeFileName(path));
}
