// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

using System.Text;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>
/// The account commands of the server.
/// </summary>
/// <remarks>
/// <para>
/// <c>accounts provision-reserved &lt;Name&gt; &lt;email&gt;</c> provisions a reserved account. Public registration
/// refuses the reserved names (Progmasoft, Leitwolf); this is the trusted operations tooling that creates them. The
/// password is read from the terminal without echo, twice, or from one line of standard input when it is not a
/// terminal; it never appears on a command line.
/// </para>
/// <para>
/// <c>accounts notify-policies [--dry-run]</c> tells every account holder who accepted an earlier version of the
/// policies about <see cref="PolicyAcceptance.CurrentVersion"/>, once: each notice sent is recorded, so the command can
/// run again after a failure and sends only what is left. <c>--dry-run</c> counts them and sends nothing.
/// </para>
/// </remarks>
internal static class AccountCommand
{
    /// <summary>Runs an account command.</summary>
    /// <param name="services">The services of the API, not started.</param>
    /// <param name="args">The arguments after <c>accounts</c>.</param>
    /// <param name="input">Where the password comes from.</param>
    /// <param name="output">Where results go.</param>
    /// <param name="errors">Where errors go.</param>
    /// <param name="cancellationToken">Cancels the command.</param>
    /// <returns>The exit code: 0 on success, 1 when refused, 2 for a wrong command line.</returns>
    public static async Task<int> RunAsync(
        IServiceProvider services,
        string[] args,
        IPasswordInput input,
        TextWriter output,
        TextWriter errors,
        CancellationToken cancellationToken)
    {
        bool isNotice = args is ["notify-policies"] or ["notify-policies", "--dry-run"];
        if (!isNotice && args is not ["provision-reserved", _, _])
        {
            await errors.WriteLineAsync("usage: accounts provision-reserved <Name> <email>");
            await errors.WriteLineAsync("       accounts notify-policies [--dry-run]");
            return 2;
        }

        // The service brings the account tables to the current schema when it starts; a command may run before.
        if (services.GetService<Npgsql.NpgsqlDataSource>() is { } dataSource)
        {
            await AccountSchema.ApplyAsync(dataSource, cancellationToken);
        }

        if (isNotice)
        {
            return await NotifyPoliciesAsync(services, args.Length == 2, output, errors, cancellationToken);
        }

        string name = args[1];
        string email = args[2];

        string? password = input.Read("Password: ");
        if (input.IsTerminal && password != input.Read("Password again: "))
        {
            await errors.WriteLineAsync("The two passwords differ; nothing was created.");
            return 1;
        }

        AccountService accounts = services.GetRequiredService<AccountService>();
        (AccountRecord? account, string? error) =
            await accounts.ProvisionReservedAsync(name, email, password, cancellationToken);
        if (account is null)
        {
            await errors.WriteLineAsync(error);
            return 1;
        }

        await output.WriteLineAsync($"Created the reserved account {account.AccountName} ({account.Email}).");
        return 0;
    }

    /// <summary>Sends the notices of the newest version of the policies that were not sent yet.</summary>
    /// <param name="services">The services of the API.</param>
    /// <param name="isDryRun">Whether to count them only.</param>
    /// <param name="output">Where results go.</param>
    /// <param name="errors">Where errors go.</param>
    /// <param name="cancellationToken">Cancels the command.</param>
    /// <returns>0 when every notice went out, 1 when one failed.</returns>
    private static async Task<int> NotifyPoliciesAsync(
        IServiceProvider services,
        bool isDryRun,
        TextWriter output,
        TextWriter errors,
        CancellationToken cancellationToken)
    {
        IAccountStore store = services.GetRequiredService<IAccountStore>();
        string version = PolicyAcceptance.CurrentVersion;
        IReadOnlyList<AccountRecord> accounts = await store.ListAccountsToNotifyAsync(version, cancellationToken);
        if (isDryRun)
        {
            await output.WriteLineAsync($"{accounts.Count} account holders would be told about the policies of {version}.");
            return 0;
        }

        IPolicyNoticeSender sender = services.GetRequiredService<IPolicyNoticeSender>();
        TimeProvider time = services.GetService<TimeProvider>() ?? TimeProvider.System;
        int sent = 0;
        foreach (AccountRecord account in accounts)
        {
            try
            {
                await sender.SendAsync(PolicyNotice.For(account), cancellationToken);
            }
            catch (Exception exception) when (exception is IOException or MailKit.ProtocolException
                or MailKit.Net.Smtp.SmtpCommandException or System.Net.Sockets.SocketException)
            {
                await errors.WriteLineAsync(
                    $"Sent {sent} of {accounts.Count}; the notice to {account.AccountName} failed: {exception.Message}");
                return 1;
            }

            await store.RecordPolicyNoticeAsync(account.Id, version, time.GetUtcNow(), cancellationToken);
            sent++;
        }

        await output.WriteLineAsync($"Told {sent} account holders about the policies of {version}.");
        return 0;
    }
}

/// <summary>Where <see cref="AccountCommand"/> reads a password from.</summary>
internal interface IPasswordInput
{
    /// <summary>Whether the input is a terminal, which asks twice and does not echo.</summary>
    bool IsTerminal { get; }

    /// <summary>Reads one password.</summary>
    /// <param name="prompt">What to show before it, on a terminal.</param>
    /// <returns>The password, or <see langword="null"/> at the end of the input.</returns>
    string? Read(string prompt);
}

/// <summary>The console: a terminal without echo, or one line of redirected standard input.</summary>
internal sealed class ConsolePasswordInput : IPasswordInput
{
    /// <inheritdoc/>
    public bool IsTerminal => !Console.IsInputRedirected;

    /// <inheritdoc/>
    public string? Read(string prompt)
    {
        if (!IsTerminal)
        {
            return Console.In.ReadLine();
        }

        Console.Error.Write(prompt);
        StringBuilder password = new();
        while (true)
        {
            ConsoleKeyInfo key = Console.ReadKey(intercept: true);
            if (key.Key == ConsoleKey.Enter)
            {
                Console.Error.WriteLine();
                return password.ToString();
            }

            if (key.Key == ConsoleKey.Backspace)
            {
                if (password.Length > 0)
                {
                    password.Length--;
                }

                continue;
            }

            if (!char.IsControl(key.KeyChar))
            {
                password.Append(key.KeyChar);
            }
        }
    }
}
