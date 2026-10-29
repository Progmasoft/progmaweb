// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Text;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>
/// The command that provisions a reserved account on the server: <c>accounts provision-reserved &lt;Name&gt;
/// &lt;email&gt;</c>. Public registration refuses the reserved names (Progmasoft, Leitwolf); this is the trusted
/// operations tooling that creates them. The password is read from the terminal without echo, twice, or from one line
/// of standard input when it is not a terminal; it never appears on a command line.
/// </summary>
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
        if (args is not ["provision-reserved", string name, string email])
        {
            await errors.WriteLineAsync("usage: accounts provision-reserved <Name> <email>");
            return 2;
        }

        // The service brings the account tables to the current schema when it starts; a command may run before.
        if (services.GetService<Npgsql.NpgsqlDataSource>() is { } dataSource)
        {
            await AccountSchema.ApplyAsync(dataSource, cancellationToken);
        }

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
