// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class SessionLifetimeTests
{
    private static readonly DateTimeOffset Now = new(2026, 10, 16, 9, 0, 0, TimeSpan.Zero);

    private sealed class FixedClock(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private static async Task<DateTimeOffset> SessionExpiryAsync(AccountSessionOptions options)
    {
        InMemoryAccountStore store = new();
        FixedClock clock = new(Now);
        AccountService accounts = new(store, clock);
        SessionService sessions = new(store, clock, Options.Create(options));
        (AuthenticatedAccount? registration, _) = await accounts.RegisterAsync(
            new RegisterAccountRequest("LifetimeUser", "lifetime@example.com", "a-long-development-password"),
            sessions,
            TestContext.Current.CancellationToken);
        return Assert.IsType<AuthenticatedAccount>(registration).ExpiresAt;
    }

    [Fact]
    public async Task ASessionLastsThirtyDaysByDefault()
    {
        Assert.Equal(Now.AddDays(30), await SessionExpiryAsync(new AccountSessionOptions()));
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(12, 12)]
    [InlineData(720, 720)]
    [InlineData(10_000, 720)]
    public async Task AConfiguredLifetimeIsKeptWithinOneHourAndThirtyDays(int configured, int expected)
    {
        DateTimeOffset expiry = await SessionExpiryAsync(new AccountSessionOptions { LifetimeHours = configured });

        Assert.Equal(Now.AddHours(expected), expiry);
    }
}
