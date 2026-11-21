// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;

namespace Progmasoft.Progmaweb.Api.Git;

/// <summary>A branch or a tag.</summary>
/// <param name="Name">Its short name.</param>
/// <param name="Commit">The commit it names.</param>
/// <param name="Date">When that commit was made, or the tag was created.</param>
/// <param name="Subject">The first line of its message.</param>
internal sealed record GitRef(string Name, string Commit, DateTimeOffset Date, string Subject);

/// <summary>One commit of a log.</summary>
/// <param name="Commit">Its identifier.</param>
/// <param name="Author">Its author's name.</param>
/// <param name="Date">When it was authored.</param>
/// <param name="Subject">The first line of its message.</param>
internal sealed record GitLogEntry(string Commit, string Author, DateTimeOffset Date, string Subject);

/// <summary>One entry of a tree.</summary>
/// <param name="Name">Its name in the tree.</param>
/// <param name="Kind"><c>tree</c>, <c>blob</c>, <c>link</c> or <c>submodule</c>.</param>
/// <param name="Size">The size of a blob in bytes; null otherwise.</param>
internal sealed record GitTreeEntry(string Name, string Kind, long? Size);

/// <summary>A commit with its message and changes.</summary>
/// <param name="Commit">Its identifier.</param>
/// <param name="Parents">Its parents.</param>
/// <param name="Author">Its author's name.</param>
/// <param name="AuthorDate">When it was authored.</param>
/// <param name="Committer">Its committer's name.</param>
/// <param name="CommitDate">When it was committed.</param>
/// <param name="Message">Its whole message.</param>
/// <param name="Diff">The patch against its first parent, or the whole tree for a root commit.</param>
/// <param name="IsDiffTruncated">Whether the patch was cut at <see cref="GitReader.MaxDiffBytes"/>.</param>
internal sealed record GitCommitDetails(
    string Commit,
    IReadOnlyList<string> Parents,
    string Author,
    DateTimeOffset AuthorDate,
    string Committer,
    DateTimeOffset CommitDate,
    string Message,
    string Diff,
    bool IsDiffTruncated);

/// <summary>Reads a bare mirror with the Git program.</summary>
/// <remarks>
/// <para>
/// Every argument comes from a resolved commit identifier, a validated name or a validated path, and is passed as
/// one element of the argument list, never through a shell; options end before anything a request gave. Git runs
/// without the system and global configuration, without a terminal, and for at most <see cref="Timeout"/>.
/// </para>
/// <para>
/// The mirrors belong to the user that fetches them, so this reader trusts them through <c>safe.directory</c> for
/// its own runs only, as git-http-backend does in the Nginx configuration.
/// </para>
/// </remarks>
/// <param name="options">Where Git is.</param>
internal sealed partial class GitReader(IOptions<GitOptions> options)
{
    /// <summary>How long one run of Git may take.</summary>
    public static readonly TimeSpan Timeout = TimeSpan.FromSeconds(15);

    /// <summary>The largest file shown as text in a page.</summary>
    public const int MaxTextBytes = 1024 * 1024;

    /// <summary>The largest patch shown in a page.</summary>
    public const int MaxDiffBytes = 512 * 1024;

    /// <summary>The largest file served raw.</summary>
    public const long MaxRawBytes = 32L * 1024 * 1024;

    /// <summary>Commits per page of a log.</summary>
    public const int LogPageSize = 50;

    /// <summary>Matches a full commit identifier, SHA-1 or SHA-256.</summary>
    /// <returns>The compiled expression.</returns>
    [GeneratedRegex("^(?:[0-9a-f]{40}|[0-9a-f]{64})$", RegexOptions.CultureInvariant)]
    private static partial Regex CommitPattern();

    /// <summary>Matches the characters a branch or tag name of these repositories may have.</summary>
    /// <returns>The compiled expression.</returns>
    [GeneratedRegex("^[A-Za-z0-9._+/-]{1,200}$", RegexOptions.CultureInvariant)]
    private static partial Regex RefPattern();

    /// <summary>Whether a text is a full commit identifier.</summary>
    /// <param name="text">The text.</param>
    /// <returns><see langword="true"/> when it is one.</returns>
    public static bool IsCommitId(string text) => CommitPattern().IsMatch(text);

    /// <summary>Whether a text may name a branch or a tag: Git's rules, as far as a request needs them.</summary>
    /// <param name="name">The text.</param>
    /// <returns><see langword="true"/> when it may.</returns>
    public static bool IsRefName(string name) =>
        RefPattern().IsMatch(name)
        && !name.StartsWith('-')
        && !name.StartsWith('/')
        && !name.EndsWith('/')
        && !name.EndsWith(".lock", StringComparison.Ordinal)
        && !name.Contains("..", StringComparison.Ordinal)
        && !name.Contains("//", StringComparison.Ordinal)
        && !name.Split('/').Any(part => part.StartsWith('.'));

    /// <summary>Whether a text is a path inside a tree: segments without <c>.</c>, <c>..</c> or control characters.</summary>
    /// <param name="path">The path, without a leading or trailing slash; empty for the root.</param>
    /// <returns><see langword="true"/> when it is one.</returns>
    public static bool IsTreePath(string path) =>
        path.Length == 0
        || (path.Length <= 4096
            && path.Split('/').All(part => part.Length > 0 && part != "." && part != ".." && !part.Any(char.IsControl)));

    /// <summary>The default branch of a mirror.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns>Its name, or <see langword="null"/> when HEAD names no branch.</returns>
    public async Task<string?> DefaultBranchAsync(string mirror, CancellationToken cancellationToken)
    {
        GitResult result = await RunAsync(mirror, ["symbolic-ref", "--quiet", "--short", "HEAD"], cancellationToken);
        return result.Ok ? result.Text.Trim() : null;
    }

    /// <summary>Resolves a branch, a tag or a full commit identifier to a commit.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="reference">What a request named.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns>The commit, or <see langword="null"/> when the reference names none.</returns>
    public async Task<string?> ResolveAsync(string mirror, string reference, CancellationToken cancellationToken)
    {
        string[] candidates = IsCommitId(reference)
            ? [reference]
            : IsRefName(reference) ? [$"refs/heads/{reference}", $"refs/tags/{reference}"] : [];
        foreach (string candidate in candidates)
        {
            GitResult result = await RunAsync(
                mirror,
                ["rev-parse", "--verify", "--quiet", "--end-of-options", candidate + "^{commit}"],
                cancellationToken);
            if (result.Ok)
            {
                return result.Text.Trim();
            }
        }

        return null;
    }

    /// <summary>The branches and the tags of a mirror, the newest first.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns>The branches and the tags.</returns>
    public async Task<(IReadOnlyList<GitRef> Branches, IReadOnlyList<GitRef> Tags)> RefsAsync(
        string mirror,
        CancellationToken cancellationToken)
    {
        GitResult result = await RunAsync(
            mirror,
            [
                "for-each-ref", "--sort=-creatordate",
                "--format=%(refname)%00%(if)%(*objectname)%(then)%(*objectname)%(else)%(objectname)%(end)%00%(creatordate:iso-strict)%00%(contents:subject)%1e",
                "refs/heads", "refs/tags"
            ],
            cancellationToken);
        List<GitRef> branches = [];
        List<GitRef> tags = [];
        foreach (string record in Records(result.Text))
        {
            string[] fields = record.Split('\0');
            if (fields.Length < 4)
            {
                continue;
            }

            if (fields[0].StartsWith("refs/heads/", StringComparison.Ordinal))
            {
                branches.Add(new GitRef(fields[0]["refs/heads/".Length..], fields[1], Date(fields[2]), fields[3]));
            }
            else if (fields[0].StartsWith("refs/tags/", StringComparison.Ordinal))
            {
                tags.Add(new GitRef(fields[0]["refs/tags/".Length..], fields[1], Date(fields[2]), fields[3]));
            }
        }

        return (branches, tags);
    }

    /// <summary>The kind of the object at a path of a commit.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="commit">A resolved commit.</param>
    /// <param name="path">A valid tree path.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns><c>tree</c>, <c>blob</c>, or <see langword="null"/> when nothing is there.</returns>
    public async Task<string?> KindAsync(string mirror, string commit, string path, CancellationToken cancellationToken)
    {
        GitResult result = await RunAsync(mirror, ["cat-file", "-t", "--end-of-options", $"{commit}:{path}"], cancellationToken);
        return result.Ok ? result.Text.Trim() : null;
    }

    /// <summary>The entries of a tree: directories first, then by name.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="commit">A resolved commit.</param>
    /// <param name="path">A valid tree path that names a tree.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns>The entries.</returns>
    public async Task<IReadOnlyList<GitTreeEntry>> TreeAsync(
        string mirror,
        string commit,
        string path,
        CancellationToken cancellationToken)
    {
        GitResult result = await RunAsync(mirror, ["ls-tree", "-l", "-z", "--end-of-options", $"{commit}:{path}"], cancellationToken);
        List<GitTreeEntry> entries = [];
        foreach (string line in result.Text.Split('\0', StringSplitOptions.RemoveEmptyEntries))
        {
            // <mode> SP <type> SP <object> SP+ <size> TAB <name>
            int tab = line.IndexOf('\t', StringComparison.Ordinal);
            if (tab < 0)
            {
                continue;
            }

            string[] meta = line[..tab].Split(' ', StringSplitOptions.RemoveEmptyEntries);
            string name = line[(tab + 1)..];
            string kind = meta[0] switch
            {
                "040000" => "tree",
                "120000" => "link",
                "160000" => "submodule",
                _ => "blob"
            };
            long? size = kind is "blob" or "link" && long.TryParse(meta[^1], CultureInfo.InvariantCulture, out long bytes)
                ? bytes
                : null;
            entries.Add(new GitTreeEntry(name, kind, size));
        }

        return [.. entries.OrderBy(entry => entry.Kind == "tree" ? 0 : 1).ThenBy(entry => entry.Name, StringComparer.Ordinal)];
    }

    /// <summary>The size of a blob.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="commit">A resolved commit.</param>
    /// <param name="path">A valid tree path that names a blob.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns>The size in bytes.</returns>
    public async Task<long> SizeAsync(string mirror, string commit, string path, CancellationToken cancellationToken)
    {
        GitResult result = await RunAsync(mirror, ["cat-file", "-s", "--end-of-options", $"{commit}:{path}"], cancellationToken);
        return long.Parse(result.Text.Trim(), CultureInfo.InvariantCulture);
    }

    /// <summary>The content of a blob, up to a limit.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="commit">A resolved commit.</param>
    /// <param name="path">A valid tree path that names a blob.</param>
    /// <param name="limit">The most bytes to read.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns>The bytes, and whether there were more.</returns>
    public async Task<(byte[] Bytes, bool IsTruncated)> BlobAsync(
        string mirror,
        string commit,
        string path,
        long limit,
        CancellationToken cancellationToken)
    {
        GitResult result = await RunAsync(mirror, ["cat-file", "blob", "--end-of-options", $"{commit}:{path}"], cancellationToken, limit);
        return (result.Bytes, result.IsTruncated);
    }

    /// <summary>A page of the log of a commit, of a path in it when one is given.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="commit">A resolved commit.</param>
    /// <param name="path">A valid tree path, or empty for the whole tree.</param>
    /// <param name="page">The page, from zero.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns>The commits of the page, and whether another page follows.</returns>
    public async Task<(IReadOnlyList<GitLogEntry> Commits, bool HasMore)> LogAsync(
        string mirror,
        string commit,
        string path,
        int page,
        CancellationToken cancellationToken)
    {
        List<string> arguments =
        [
            "log", "--format=%H%x00%an%x00%aI%x00%s%x1e",
            $"--skip={page * LogPageSize}", $"--max-count={LogPageSize + 1}", "--end-of-options", commit
        ];
        if (path.Length > 0)
        {
            arguments.AddRange(["--", path]);
        }

        GitResult result = await RunAsync(mirror, arguments, cancellationToken);
        List<GitLogEntry> commits = [];
        foreach (string record in Records(result.Text))
        {
            string[] fields = record.Split('\0');
            if (fields.Length >= 4)
            {
                commits.Add(new GitLogEntry(fields[0], fields[1], Date(fields[2]), fields[3]));
            }
        }

        bool hasMore = commits.Count > LogPageSize;
        return (hasMore ? commits[..LogPageSize] : commits, hasMore);
    }

    /// <summary>A commit, its message and its patch.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="commit">A resolved commit.</param>
    /// <param name="cancellationToken">Cancels the runs.</param>
    /// <returns>The commit.</returns>
    public async Task<GitCommitDetails> CommitAsync(string mirror, string commit, CancellationToken cancellationToken)
    {
        GitResult header = await RunAsync(
            mirror,
            ["show", "-s", "--format=%H%x00%P%x00%an%x00%aI%x00%cn%x00%cI%x00%B", "--end-of-options", commit],
            cancellationToken);
        string[] fields = header.Text.Split('\0', 7);
        GitResult diff = await RunAsync(
            mirror,
            ["diff-tree", "--patch", "--stat", "--no-color", "--no-ext-diff", "--find-renames", "--root", "--no-commit-id", "--end-of-options", commit],
            cancellationToken,
            MaxDiffBytes);
        return new GitCommitDetails(
            fields[0],
            fields[1].Split(' ', StringSplitOptions.RemoveEmptyEntries),
            fields[2],
            Date(fields[3]),
            fields[4],
            Date(fields[5]),
            fields[6].TrimEnd(),
            Encoding.UTF8.GetString(diff.Bytes),
            diff.IsTruncated);
    }

    /// <summary>Writes a gzip-compressed tar archive of a commit.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="commit">A resolved commit.</param>
    /// <param name="prefix">The directory every file is put in, such as <c>tazel-main/</c>.</param>
    /// <param name="output">Where the archive goes.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <returns>A task that completes when the archive is written.</returns>
    public async Task ArchiveAsync(string mirror, string commit, string prefix, Stream output, CancellationToken cancellationToken)
    {
        using Process process = Start(mirror, ["archive", "--format=tar.gz", $"--prefix={prefix}", "--end-of-options", commit]);
        using CancellationTokenSource timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromMinutes(2));
        try
        {
            Task<string> errors = process.StandardError.ReadToEndAsync(timeout.Token);
            await process.StandardOutput.BaseStream.CopyToAsync(output, timeout.Token);
            await process.WaitForExitAsync(timeout.Token);
            if (process.ExitCode != 0)
            {
                throw new IOException($"git archive exited with {process.ExitCode}: {(await errors).Trim()}");
            }
        }
        finally
        {
            Stop(process);
        }
    }

    /// <summary>The result of one run.</summary>
    /// <param name="Ok">Whether Git exited with 0.</param>
    /// <param name="Bytes">What it wrote, up to the limit.</param>
    /// <param name="IsTruncated">Whether it wrote more than the limit.</param>
    private sealed record GitResult(bool Ok, byte[] Bytes, bool IsTruncated)
    {
        /// <summary>What Git wrote, as UTF-8 text.</summary>
        public string Text => Encoding.UTF8.GetString(Bytes);
    }

    /// <summary>Runs Git on a mirror and reads what it writes, up to a limit.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="arguments">The arguments after the global options.</param>
    /// <param name="cancellationToken">Cancels the run.</param>
    /// <param name="limit">The most bytes to read; Git is stopped past it.</param>
    /// <returns>The result.</returns>
    private async Task<GitResult> RunAsync(
        string mirror,
        IReadOnlyList<string> arguments,
        CancellationToken cancellationToken,
        long limit = 16 * 1024 * 1024)
    {
        using Process process = Start(mirror, arguments);
        using CancellationTokenSource timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(Timeout);
        try
        {
            Task drain = process.StandardError.ReadToEndAsync(timeout.Token);
            using MemoryStream bytes = new();
            byte[] buffer = new byte[81920];
            bool isTruncated = false;
            Stream stdout = process.StandardOutput.BaseStream;
            int read;
            while ((read = await stdout.ReadAsync(buffer, timeout.Token)) > 0)
            {
                long room = limit - bytes.Length;
                if (read > room)
                {
                    bytes.Write(buffer, 0, (int)Math.Max(room, 0));
                    isTruncated = true;
                    break;
                }

                bytes.Write(buffer, 0, read);
            }

            if (isTruncated)
            {
                Stop(process);
                return new GitResult(true, bytes.ToArray(), true);
            }

            await process.WaitForExitAsync(timeout.Token);
            await drain;
            return new GitResult(process.ExitCode == 0, bytes.ToArray(), false);
        }
        finally
        {
            Stop(process);
        }
    }

    /// <summary>Starts Git on a mirror, without a shell, in a cleared environment.</summary>
    /// <param name="mirror">The path of the mirror.</param>
    /// <param name="arguments">The arguments after the global options.</param>
    /// <returns>The process, its output redirected.</returns>
    private Process Start(string mirror, IReadOnlyList<string> arguments)
    {
        ProcessStartInfo start = new(options.Value.GitPath)
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            RedirectStandardInput = false,
            UseShellExecute = false,
            WorkingDirectory = mirror
        };
        foreach (string argument in (string[])["-c", $"safe.directory={mirror}", "-c", "core.quotePath=false", "--git-dir", mirror, "--no-pager"])
        {
            start.ArgumentList.Add(argument);
        }

        foreach (string argument in arguments)
        {
            start.ArgumentList.Add(argument);
        }

        start.Environment.Clear();
        start.Environment["PATH"] = "/usr/bin:/bin";
        start.Environment["LANG"] = "C.UTF-8";
        start.Environment["GIT_CONFIG_NOSYSTEM"] = "1";
        start.Environment["GIT_CONFIG_GLOBAL"] = "/dev/null";
        start.Environment["GIT_TERMINAL_PROMPT"] = "0";
        start.Environment["GIT_NO_REPLACE_OBJECTS"] = "1";
        return Process.Start(start) ?? throw new InvalidOperationException("Git did not start.");
    }

    /// <summary>Kills a run that has not exited.</summary>
    /// <param name="process">The run.</param>
    private static void Stop(Process process)
    {
        try
        {
            if (!process.HasExited)
            {
                process.Kill();
            }
        }
        catch (InvalidOperationException)
        {
            // It exited between the check and the kill.
        }
    }

    /// <summary>Splits output into the records a format ended with the record separator.</summary>
    /// <param name="text">The output.</param>
    /// <returns>The records that are not empty.</returns>
    private static IEnumerable<string> Records(string text) =>
        text.Split('\u001e').Select(record => record.TrimStart('\n')).Where(record => record.Length > 0);

    /// <summary>Reads a strict ISO 8601 date Git wrote.</summary>
    /// <param name="text">The date.</param>
    /// <returns>The date, or the Unix epoch when it cannot be read.</returns>
    private static DateTimeOffset Date(string text) =>
        DateTimeOffset.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTimeOffset date)
            ? date
            : DateTimeOffset.UnixEpoch;
}
