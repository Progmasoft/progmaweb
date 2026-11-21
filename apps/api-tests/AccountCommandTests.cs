// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

using Microsoft.Extensions.DependencyInjection;
using MimeKit;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>The operations command that provisions the reserved accounts.</summary>
public sealed class AccountCommandTests
{
    private const string Password = "a long test passphrase";

    private sealed class Input(bool terminal, params string?[] lines) : IPasswordInput
    {
        private readonly Queue<string?> remaining = new(lines);

        public bool IsTerminal { get; } = terminal;

        public List<string> Prompts { get; } = [];

        public string? Read(string prompt)
        {
            Prompts.Add(prompt);
            return remaining.Count > 0 ? remaining.Dequeue() : null;
        }
    }

    private sealed class Outbox(int failAfter = int.MaxValue) : IPolicyNoticeSender
    {
        public List<MimeMessage> Sent { get; } = [];

        public Task SendAsync(MimeMessage message, CancellationToken cancellationToken)
        {
            if (Sent.Count >= failAfter)
            {
                throw new IOException("the mail server went away");
            }

            Sent.Add(message);
            return Task.CompletedTask;
        }
    }

    private static (ServiceProvider Services, InMemoryAccountStore Store) Services(Outbox? outbox = null)
    {
        InMemoryAccountStore store = new();
        ServiceProvider services = new ServiceCollection()
            .AddSingleton<IAccountStore>(store)
            .AddSingleton<IPolicyNoticeSender>(outbox ?? new Outbox())
            .AddSingleton(TimeProvider.System)
            .AddSingleton<AccountService>()
            .BuildServiceProvider();
        return (services, store);
    }

    private static async Task<(int Code, string Output, string Errors)> RunAsync(
        IServiceProvider services,
        IPasswordInput input,
        params string[] args)
    {
        StringWriter output = new();
        StringWriter errors = new();
        int code = await AccountCommand.RunAsync(
            services, args, input, output, errors, TestContext.Current.CancellationToken);
        return (code, output.ToString(), errors.ToString());
    }

    [Fact]
    public async Task AReservedAccountIsCreatedWithThePasswordTypedTwice()
    {
        (ServiceProvider services, InMemoryAccountStore store) = Services();
        Input input = new(terminal: true, Password, Password);

        (int code, string output, _) = await RunAsync(
            services, input, "provision-reserved", "Progmasoft", "support@progmasoft.com");

        Assert.Equal(0, code);
        Assert.Contains("Created the reserved account Progmasoft", output, StringComparison.Ordinal);
        Assert.DoesNotContain(Password, output, StringComparison.Ordinal);
        Assert.Equal(["Password: ", "Password again: "], input.Prompts);
        AccountRecord? account = await store.FindByAccountNameAsync("PROGMASOFT", TestContext.Current.CancellationToken);
        Assert.NotNull(account);
        Assert.Equal("Progmasoft", account.AccountName);
        // The password works for signing in.
        AccountRecord? verified = await services.GetRequiredService<AccountService>().VerifyPasswordAsync(
            "support@progmasoft.com", Password, TestContext.Current.CancellationToken);
        Assert.Equal(account.Id, verified?.Id);
    }

    [Fact]
    public async Task OnlyReservedNamesAreProvisioned()
    {
        (ServiceProvider services, _) = Services();
        (int code, _, string errors) = await RunAsync(
            services, new Input(terminal: false, Password), "provision-reserved", "Somebody1", "a@example.com");
        Assert.Equal(1, code);
        Assert.Contains("is not a reserved name", errors, StringComparison.Ordinal);
    }

    [Fact]
    public async Task DifferentPasswordsCreateNothing()
    {
        (ServiceProvider services, InMemoryAccountStore store) = Services();
        (int code, _, string errors) = await RunAsync(
            services, new Input(terminal: true, Password, Password + "!"), "provision-reserved", "Leitwolf",
            "owner@example.com");
        Assert.Equal(1, code);
        Assert.Contains("differ", errors, StringComparison.Ordinal);
        Assert.Null(await store.FindByAccountNameAsync("LEITWOLF", TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task AWeakPasswordOrAnExistingAccountIsRefused()
    {
        (ServiceProvider services, _) = Services();
        (int weak, _, string weakErrors) = await RunAsync(
            services, new Input(terminal: false, "short"), "provision-reserved", "Progmasoft", "support@progmasoft.com");
        Assert.Equal(1, weak);
        Assert.Contains("at least 12 characters", weakErrors, StringComparison.Ordinal);

        Assert.Equal(0, (await RunAsync(
            services, new Input(terminal: false, Password), "provision-reserved", "Progmasoft",
            "support@progmasoft.com")).Code);
        (int again, _, string againErrors) = await RunAsync(
            services, new Input(terminal: false, Password), "provision-reserved", "PROGMASOFT", "other@progmasoft.com");
        Assert.Equal(1, again);
        Assert.Contains("exists already", againErrors, StringComparison.Ordinal);
    }

    [Fact]
    public async Task PublicRegistrationStillRefusesReservedNames()
    {
        Assert.False(AccountNamePolicy.TryNormalize("Progmasoft", out _, out string error));
        Assert.Equal("That account name is reserved.", error);
        (int code, _, string errors) = await RunAsync(Services().Services, new Input(terminal: false), "provision");
        Assert.Equal(2, code);
        Assert.Contains("usage", errors, StringComparison.Ordinal);
    }

    private static async Task AddAccountAsync(InMemoryAccountStore store, string name, string? policies)
    {
        AccountRecord account = new(
            Guid.NewGuid(), name, name.ToUpperInvariant(), $"{name.ToLowerInvariant()}@example.com",
            $"{name.ToUpperInvariant()}@EXAMPLE.COM", null, "hash", DateTimeOffset.UnixEpoch,
            policies, policies is null ? null : DateTimeOffset.UnixEpoch);
        await store.CreateAsync(account, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task EveryHolderOfAnEarlierVersionIsToldOnceFromNoReply()
    {
        Outbox outbox = new();
        (ServiceProvider services, InMemoryAccountStore store) = Services(outbox);
        await AddAccountAsync(store, "OlderHolder1", PolicyAcceptance.PreviousVersion);
        await AddAccountAsync(store, "CurrentHolder1", PolicyAcceptance.CurrentVersion);

        (int code, string output, _) = await RunAsync(services, new Input(false), "notify-policies", "--dry-run");
        Assert.Equal(0, code);
        Assert.Contains("1 account holders would be told", output, StringComparison.Ordinal);
        Assert.Empty(outbox.Sent);

        (code, output, _) = await RunAsync(services, new Input(false), "notify-policies");
        Assert.Equal(0, code);
        Assert.Contains("Told 1 account holders", output, StringComparison.Ordinal);
        MimeMessage notice = Assert.Single(outbox.Sent);
        Assert.Equal("noreply@progmasoft.com", notice.From.Mailboxes.Single().Address);
        Assert.Equal("support@progmasoft.com", notice.ReplyTo.Mailboxes.Single().Address);
        Assert.Equal("olderholder1@example.com", notice.To.Mailboxes.Single().Address);
        Assert.Equal("auto-generated", notice.Headers["Auto-Submitted"]);
        Assert.Contains("6 December 2026", notice.Subject, StringComparison.Ordinal);
        string body = notice.TextBody ?? string.Empty;
        Assert.Contains("https://progmasoft.com/privacy/2026-12-06", body, StringComparison.Ordinal);
        Assert.Contains("Agenceland MCP Marketplace", body, StringComparison.Ordinal);
        Assert.Contains("6 November 2026", body, StringComparison.Ordinal);

        (code, output, _) = await RunAsync(services, new Input(false), "notify-policies");
        Assert.Equal(0, code);
        Assert.Contains("Told 0 account holders", output, StringComparison.Ordinal);
        Assert.Single(outbox.Sent);
    }

    [Fact]
    public async Task AFailedNoticeStopsAndARunAfterItSendsOnlyWhatIsLeft()
    {
        (ServiceProvider services, InMemoryAccountStore store) = Services(new Outbox(failAfter: 1));
        await AddAccountAsync(store, "FirstHolder1", null);
        await AddAccountAsync(store, "SecondHolder1", PolicyAcceptance.PreviousVersion);

        (int code, _, string errors) = await RunAsync(services, new Input(false), "notify-policies");
        Assert.Equal(1, code);
        Assert.Contains("Sent 1 of 2", errors, StringComparison.Ordinal);

        IReadOnlyList<AccountRecord> left = await store.ListAccountsToNotifyAsync(
            PolicyAcceptance.CurrentVersion, TestContext.Current.CancellationToken);
        Assert.Single(left);
    }

    [Theory]
    [InlineData("notify-policies", "--now")]
    [InlineData("notify-policies", "--dry-run", "extra")]
    public async Task ANoticeCommandWithOtherWordsIsAUsageError(params string[] args)
    {
        (ServiceProvider services, _) = Services();
        (int code, _, string errors) = await RunAsync(services, new Input(false), args);
        Assert.Equal(2, code);
        Assert.Contains("accounts notify-policies [--dry-run]", errors, StringComparison.Ordinal);
    }
}
