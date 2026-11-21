// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

using System.Text;
using Microsoft.Extensions.Options;

namespace Progmasoft.Progmaweb.Api.Git;

/// <summary>A repository in a listing.</summary>
/// <param name="Name">Its name.</param>
/// <param name="Description">What it is.</param>
/// <param name="Homepage">Where it is developed, on GitHub.</param>
/// <param name="CloneUrl">Where it is cloned from.</param>
/// <param name="DefaultBranch">Its default branch.</param>
/// <param name="UpdatedAt">When its default branch last changed.</param>
internal sealed record GitRepositoryResponse(
    string Name,
    string Description,
    string Homepage,
    string CloneUrl,
    string? DefaultBranch,
    DateTimeOffset? UpdatedAt);

/// <summary>A section of the listing.</summary>
/// <param name="Name">Its heading.</param>
/// <param name="Repositories">Its repositories.</param>
internal sealed record GitSectionResponse(string Name, IReadOnlyList<GitRepositoryResponse> Repositories);

/// <summary>What is at a path of a commit.</summary>
/// <param name="Reference">The branch, tag or commit the request named.</param>
/// <param name="Commit">The commit it resolved to.</param>
/// <param name="Path">The path; empty for the root.</param>
/// <param name="Kind"><c>tree</c> or <c>blob</c>.</param>
/// <param name="Entries">The entries of a tree; null for a blob.</param>
/// <param name="Size">The size of a blob; null for a tree.</param>
/// <param name="IsBinary">Whether the blob is not text; a binary blob carries no text.</param>
/// <param name="Text">The text of a blob up to <see cref="GitReader.MaxTextBytes"/>.</param>
/// <param name="IsTruncated">Whether the text was cut.</param>
internal sealed record GitTreeResponse(
    string Reference,
    string Commit,
    string Path,
    string Kind,
    IReadOnlyList<GitTreeEntry>? Entries,
    long? Size,
    bool IsBinary,
    string? Text,
    bool IsTruncated);

/// <summary>The read-only mirrors of git.progmasoft.com, for the pages of the Progmasoft site.</summary>
/// <remarks>
/// The pages are rendered by Next.js on the same host, which calls these endpoints on loopback. Two of them reach the
/// browser through Nginx: the raw files and the archives. Clones are served by git-http-backend, not here.
/// </remarks>
internal static class GitEndpoints
{
    /// <summary>The prefix of every endpoint.</summary>
    public const string Prefix = "/api/v1/git";

    /// <summary>Maps the endpoints.</summary>
    /// <param name="app">The application.</param>
    public static void MapGitEndpoints(this WebApplication app)
    {
        RouteGroupBuilder api = app.MapGroup(Prefix + "/repositories").RequireRateLimiting("git");
        api.MapGet("/", ListAsync);
        api.MapGet("/{name}", ShowAsync);
        api.MapGet("/{name}/refs", RefsAsync);
        api.MapGet("/{name}/tree", TreeAsync);
        api.MapGet("/{name}/log", LogAsync);
        api.MapGet("/{name}/commits/{commit}", CommitAsync);
        api.MapGet("/{name}/raw", RawAsync);
        api.MapGet("/{name}/archive", ArchiveAsync);
    }

    private static string Homepage(string name) => $"https://github.com/Progmasoft/{name}";

    private static string CloneUrl(IOptions<GitOptions> options, string name) => $"https://{options.Value.Host}/{name}";

    private static async Task<IResult> ListAsync(
        GitCatalog catalog,
        GitReader git,
        IOptions<GitOptions> options,
        CancellationToken cancellationToken)
    {
        List<GitSectionResponse> sections = [];
        foreach (GitCatalogSection section in catalog.Sections())
        {
            List<GitRepositoryResponse> repositories = [];
            foreach (GitCatalogRepository repository in section.Repositories)
            {
                if (catalog.Find(repository.Name) is not { } found)
                {
                    continue;
                }

                repositories.Add(await DescribeAsync(git, options, found.Repository, found.MirrorPath, cancellationToken));
            }

            if (repositories.Count > 0)
            {
                sections.Add(new GitSectionResponse(section.Name, repositories));
            }
        }

        return Results.Ok(sections);
    }

    private static async Task<GitRepositoryResponse> DescribeAsync(
        GitReader git,
        IOptions<GitOptions> options,
        GitCatalogRepository repository,
        string mirror,
        CancellationToken cancellationToken)
    {
        string? branch = await git.DefaultBranchAsync(mirror, cancellationToken);
        DateTimeOffset? updated = null;
        if (branch is not null && await git.ResolveAsync(mirror, branch, cancellationToken) is { } head)
        {
            (IReadOnlyList<GitLogEntry> commits, _) = await git.LogAsync(mirror, head, "", 0, cancellationToken);
            updated = commits.Count > 0 ? commits[0].Date : null;
        }

        return new GitRepositoryResponse(
            repository.Name, repository.Description, Homepage(repository.Name), CloneUrl(options, repository.Name), branch, updated);
    }

    private static async Task<IResult> ShowAsync(
        string name,
        GitCatalog catalog,
        GitReader git,
        IOptions<GitOptions> options,
        CancellationToken cancellationToken) =>
        catalog.Find(name) is { } found
            ? Results.Ok(await DescribeAsync(git, options, found.Repository, found.MirrorPath, cancellationToken))
            : Results.NotFound();

    private static async Task<IResult> RefsAsync(
        string name,
        GitCatalog catalog,
        GitReader git,
        CancellationToken cancellationToken)
    {
        if (catalog.Find(name) is not { } found)
        {
            return Results.NotFound();
        }

        (IReadOnlyList<GitRef> branches, IReadOnlyList<GitRef> tags) = await git.RefsAsync(found.MirrorPath, cancellationToken);
        return Results.Ok(new { branches, tags });
    }

    /// <summary>Finds the mirror, the commit a reference names (the default branch without one) and checks a path.</summary>
    private static async Task<(string Mirror, string Reference, string Commit, string Path)?> LocateAsync(
        string name,
        string? reference,
        string? path,
        GitCatalog catalog,
        GitReader git,
        CancellationToken cancellationToken)
    {
        string trimmed = (path ?? "").Trim('/');
        if (catalog.Find(name) is not { } found || !GitReader.IsTreePath(trimmed))
        {
            return null;
        }

        string? named = string.IsNullOrEmpty(reference)
            ? await git.DefaultBranchAsync(found.MirrorPath, cancellationToken)
            : reference;
        if (named is null || await git.ResolveAsync(found.MirrorPath, named, cancellationToken) is not { } commit)
        {
            return null;
        }

        return (found.MirrorPath, named, commit, trimmed);
    }

    private static async Task<IResult> TreeAsync(
        string name,
        string? @ref,
        string? path,
        GitCatalog catalog,
        GitReader git,
        CancellationToken cancellationToken)
    {
        if (await LocateAsync(name, @ref, path, catalog, git, cancellationToken) is not { } at)
        {
            return Results.NotFound();
        }

        string? kind = await git.KindAsync(at.Mirror, at.Commit, at.Path, cancellationToken);
        if (kind == "tree")
        {
            IReadOnlyList<GitTreeEntry> entries = await git.TreeAsync(at.Mirror, at.Commit, at.Path, cancellationToken);
            return Results.Ok(new GitTreeResponse(at.Reference, at.Commit, at.Path, "tree", entries, null, false, null, false));
        }

        if (kind != "blob")
        {
            return Results.NotFound();
        }

        long size = await git.SizeAsync(at.Mirror, at.Commit, at.Path, cancellationToken);
        (byte[] bytes, bool isTruncated) = await git.BlobAsync(at.Mirror, at.Commit, at.Path, GitReader.MaxTextBytes, cancellationToken);
        bool isBinary = IsBinary(bytes);
        return Results.Ok(new GitTreeResponse(
            at.Reference, at.Commit, at.Path, "blob", null, size, isBinary, isBinary ? null : Encoding.UTF8.GetString(bytes), isTruncated));
    }

    /// <summary>Whether bytes are not text: a NUL in the first 8000, as Git decides.</summary>
    internal static bool IsBinary(ReadOnlySpan<byte> bytes) => bytes[..Math.Min(bytes.Length, 8000)].Contains((byte)0);

    private static async Task<IResult> LogAsync(
        string name,
        string? @ref,
        string? path,
        int? page,
        GitCatalog catalog,
        GitReader git,
        CancellationToken cancellationToken)
    {
        if (page is < 0 or > 10_000
            || await LocateAsync(name, @ref, path, catalog, git, cancellationToken) is not { } at)
        {
            return Results.NotFound();
        }

        (IReadOnlyList<GitLogEntry> commits, bool hasMore) =
            await git.LogAsync(at.Mirror, at.Commit, at.Path, page ?? 0, cancellationToken);
        return Results.Ok(new { reference = at.Reference, commit = at.Commit, path = at.Path, page = page ?? 0, commits, hasMore });
    }

    private static async Task<IResult> CommitAsync(
        string name,
        string commit,
        GitCatalog catalog,
        GitReader git,
        CancellationToken cancellationToken)
    {
        if (!GitReader.IsCommitId(commit)
            || catalog.Find(name) is not { } found
            || await git.ResolveAsync(found.MirrorPath, commit, cancellationToken) is not { } resolved)
        {
            return Results.NotFound();
        }

        return Results.Ok(await git.CommitAsync(found.MirrorPath, resolved, cancellationToken));
    }

    private static async Task<IResult> RawAsync(
        string name,
        string? @ref,
        string? path,
        HttpContext context,
        GitCatalog catalog,
        GitReader git,
        CancellationToken cancellationToken)
    {
        if (await LocateAsync(name, @ref, path, catalog, git, cancellationToken) is not { } at
            || at.Path.Length == 0
            || await git.KindAsync(at.Mirror, at.Commit, at.Path, cancellationToken) != "blob")
        {
            return Results.NotFound();
        }

        long size = await git.SizeAsync(at.Mirror, at.Commit, at.Path, cancellationToken);
        if (size > GitReader.MaxRawBytes)
        {
            return Results.StatusCode(StatusCodes.Status413PayloadTooLarge);
        }

        (byte[] bytes, _) = await git.BlobAsync(at.Mirror, at.Commit, at.Path, GitReader.MaxRawBytes, cancellationToken);
        // Raw files are never rendered by the browser: text is plain text, anything else is a download, and the
        // content security policy of the API allows nothing to run.
        context.Response.Headers.ContentDisposition = IsBinary(bytes)
            ? $"attachment; filename=\"{SafeFileName(at.Path)}\""
            : "inline";
        return Results.Bytes(bytes, IsBinary(bytes) ? "application/octet-stream" : "text/plain; charset=utf-8");
    }

    private static async Task ArchiveAsync(
        string name,
        string? @ref,
        HttpContext context,
        GitCatalog catalog,
        GitReader git,
        CancellationToken cancellationToken)
    {
        if (await LocateAsync(name, @ref, "", catalog, git, cancellationToken) is not { } at)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        string label = SafeFileName(at.Reference.Replace('/', '-'));
        string prefix = $"{name}-{label}";
        context.Response.ContentType = "application/gzip";
        context.Response.Headers.ContentDisposition = $"attachment; filename=\"{prefix}.tar.gz\"";
        await git.ArchiveAsync(at.Mirror, at.Commit, prefix + "/", context.Response.Body, cancellationToken);
    }

    /// <summary>The last segment of a path with only safe characters, for a Content-Disposition file name.</summary>
    internal static string SafeFileName(string path)
    {
        string last = path[(path.LastIndexOf('/') + 1)..];
        string safe = new([.. last.Select(c => char.IsAsciiLetterOrDigit(c) || c is '.' or '-' or '_' or '+' ? c : '_')]);
        return safe.Length == 0 ? "file" : safe;
    }
}

/// <summary>Keeps the Git endpoints on git.progmasoft.com and loopback, and everything else off that host.</summary>
/// <param name="next">The rest of the pipeline.</param>
/// <param name="options">The host of the mirrors.</param>
internal sealed class GitHostFilter(RequestDelegate next, IOptions<GitOptions> options)
{
    /// <summary>Answers 404 for a Git path on another host, or another path on the Git host.</summary>
    /// <param name="context">The request.</param>
    /// <returns>A task that completes when the request has been answered.</returns>
    public Task InvokeAsync(HttpContext context)
    {
        PathString path = context.Request.Path;
        string host = context.Request.Host.Host;
        bool isGitPath = path.StartsWithSegments(GitEndpoints.Prefix, StringComparison.OrdinalIgnoreCase);
        bool isHealth = path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase);
        bool isGitHost = string.Equals(host, options.Value.Host, StringComparison.OrdinalIgnoreCase);
        bool isLoopback = host is "127.0.0.1" or "localhost" or "::1" or "[::1]";
        bool allowed = isGitHost ? isGitPath || isHealth : !isGitPath || isLoopback;
        if (allowed)
        {
            return next(context);
        }

        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return Task.CompletedTask;
    }
}
