// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class AccountStoreSelectionTests
{
    private const string Database = "Host=/var/run/postgresql;Database=progmaweb;Username=progmaweb";

    private static IConfiguration Configuration(string? store, string? connectionString) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [AccountStoreRegistration.StoreKey] = store,
                ["ConnectionStrings:Accounts"] = connectionString
            })
            .Build();

    [Theory]
    [InlineData(null, Database, false, AccountStoreKind.PostgreSql)]
    [InlineData(null, Database, true, AccountStoreKind.PostgreSql)]
    [InlineData("PostgreSQL", Database, true, AccountStoreKind.PostgreSql)]
    [InlineData("postgresql", Database, false, AccountStoreKind.PostgreSql)]
    [InlineData(null, null, false, AccountStoreKind.Memory)]
    [InlineData("", "  ", false, AccountStoreKind.Memory)]
    [InlineData("Memory", null, false, AccountStoreKind.Memory)]
    [InlineData("memory", null, true, AccountStoreKind.Memory)]
    internal void TheConfigurationSelectsTheStore(
        string? store,
        string? connectionString,
        bool isProduction,
        AccountStoreKind expected)
    {
        Assert.Equal(expected, AccountStoreRegistration.Select(Configuration(store, connectionString), isProduction));
    }

    [Theory]
    // Production never falls back to memory on its own.
    [InlineData(null, null, true, "No account database is configured")]
    [InlineData("", "", true, "No account database is configured")]
    [InlineData("PostgreSQL", null, false, "is not set")]
    [InlineData("Memory", Database, false, "Remove one of them")]
    [InlineData("Sqlite", null, false, "must be PostgreSQL or Memory")]
    public void AConfigurationThatCannotBeMeantIsRefused(
        string? store,
        string? connectionString,
        bool isProduction,
        string expectedMessage)
    {
        InvalidOperationException refused = Assert.Throws<InvalidOperationException>(
            () => AccountStoreRegistration.Select(Configuration(store, connectionString), isProduction));

        Assert.Contains(expectedMessage, refused.Message, StringComparison.Ordinal);
        // A message about the configuration never repeats the connection string.
        Assert.DoesNotContain("Host=", refused.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void AProductionServiceWithoutADatabaseDoesNotStart()
    {
        using AccountApiFactory factory = new(environment: "Production");

        InvalidOperationException refused = Assert.Throws<InvalidOperationException>(() => factory.CreateAccountClient());

        Assert.Contains("No account database is configured", refused.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task AProductionServiceThatAsksForMemoryStartsAndKeepsAccountsInMemory()
    {
        await using AccountApiFactory factory = new(environment: "Production", accountStore: "Memory");
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage health = await client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, health.StatusCode);
        Assert.IsType<InMemoryAccountStore>(factory.Services.GetRequiredService<IAccountStore>());
    }

    [Fact]
    public async Task TheTestServiceKeepsAccountsInMemoryWithoutBeingAsked()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient();
        await client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.IsType<InMemoryAccountStore>(factory.Services.GetRequiredService<IAccountStore>());
    }
}

public sealed class ExpiredSessionCleanupTests
{
    private sealed class FixedClock(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    private sealed class FailingStore : IAccountStore
    {
        public int Attempts { get; private set; }

        public ValueTask<int> RemoveExpiredSessionsAsync(DateTimeOffset now, CancellationToken cancellationToken)
        {
            Attempts++;
            throw new IOException("The database does not answer.");
        }

        public ValueTask<CreateAccountResult> CreateAsync(AccountRecord account, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public ValueTask<AccountRecord?> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public ValueTask<AccountRecord?> FindByGoogleSubjectAsync(string googleSubject, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public ValueTask<AccountRecord?> FindByIdAsync(Guid id, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public ValueTask StoreSessionAsync(SessionRecord session, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public ValueTask<SessionRecord?> FindSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken) =>
            throw new NotSupportedException();

        public ValueTask RevokeSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
    }

    [Fact]
    public async Task ARemovalTakesWhatHasExpiredByTheClock()
    {
        DateTimeOffset now = new(2026, 10, 6, 12, 0, 0, TimeSpan.Zero);
        InMemoryAccountStore store = new();
        AccountRecord account = new(Guid.NewGuid(), "Owner", "OWNER", "o@example.com", "O@EXAMPLE.COM", null, "hash", now);
        await store.CreateAsync(account, TestContext.Current.CancellationToken);
        byte[] expired = [.. Enumerable.Repeat((byte)1, 32)];
        byte[] valid = [.. Enumerable.Repeat((byte)2, 32)];
        await store.StoreSessionAsync(new SessionRecord(expired, account.Id, now.AddHours(-13), now.AddHours(-1)), TestContext.Current.CancellationToken);
        await store.StoreSessionAsync(new SessionRecord(valid, account.Id, now, now.AddHours(12)), TestContext.Current.CancellationToken);
        using ExpiredSessionCleanup cleanup = new(store, new FixedClock(now), NullLogger<ExpiredSessionCleanup>.Instance);

        await cleanup.RemoveOnceAsync(TestContext.Current.CancellationToken);

        Assert.Null(await store.FindSessionAsync(expired, TestContext.Current.CancellationToken));
        Assert.NotNull(await store.FindSessionAsync(valid, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task ARemovalThatFailsDoesNotStopTheService()
    {
        FailingStore store = new();
        using ExpiredSessionCleanup cleanup = new(store, TimeProvider.System, NullLogger<ExpiredSessionCleanup>.Instance);

        await cleanup.RemoveOnceAsync(TestContext.Current.CancellationToken);
        await cleanup.RemoveOnceAsync(TestContext.Current.CancellationToken);

        Assert.Equal(2, store.Attempts);
    }

    [Fact]
    public async Task ACancelledRemovalIsNotSwallowed()
    {
        InMemoryAccountStore store = new();
        using ExpiredSessionCleanup cleanup = new(store, TimeProvider.System, NullLogger<ExpiredSessionCleanup>.Instance);
        using CancellationTokenSource cancelled = new();
        await cancelled.CancelAsync();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => cleanup.RemoveOnceAsync(cancelled.Token));
    }
}

public sealed class DurableAccountApiTests
{
    private static async Task<string> SessionCookieAsync(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        string header = Assert.Single(
            response.Headers.GetValues("Set-Cookie"),
            value => value.StartsWith("__Host-ProgmasoftSession=", StringComparison.Ordinal));
        return header[..header.IndexOf(';', StringComparison.Ordinal)];
    }

    private static HttpRequestMessage Me(string cookie)
    {
        HttpRequestMessage request = new(HttpMethod.Get, "/api/v1/accounts/me");
        request.Headers.Add("Cookie", cookie);
        return request;
    }

    [Fact]
    public async Task AnAccountAndItsSessionSurviveARestartOfTheService()
    {
        await using PostgresTestDatabase database = await PostgresTestDatabase.CreateAsync();
        string cookie;

        await using (AccountApiFactory beforeRestart = new(accountDatabase: database.ConnectionString))
        {
            using HttpClient client = beforeRestart.CreateAccountClient(handleCookies: false);
            HttpResponseMessage registration = await client.PostAsJsonAsync("/api/v1/accounts/register", new
            {
                accountName = "Survivor",
                email = "survivor@example.com",
                password = "a-long-development-password"
            }, TestContext.Current.CancellationToken);
            Assert.Equal(HttpStatusCode.Created, registration.StatusCode);
            cookie = await SessionCookieAsync(registration);
            Assert.IsType<PostgresAccountStore>(beforeRestart.Services.GetRequiredService<IAccountStore>());
        }

        // The first service is gone with everything it held in memory. The second starts on the same database.
        await using AccountApiFactory afterRestart = new(accountDatabase: database.ConnectionString);
        using HttpClient restarted = afterRestart.CreateAccountClient(handleCookies: false);

        HttpResponseMessage me = await restarted.SendAsync(Me(cookie), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        AccountResponse account = Assert.IsType<AccountResponse>(
            await me.Content.ReadFromJsonAsync<AccountResponse>(TestContext.Current.CancellationToken));
        Assert.Equal("Survivor", account.AccountName);
        Assert.Equal("survivor@example.com", account.Email);

        HttpResponseMessage login = await restarted.PostAsJsonAsync("/api/v1/accounts/login", new
        {
            email = "survivor@example.com",
            password = "a-long-development-password"
        }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        HttpResponseMessage again = await restarted.PostAsJsonAsync("/api/v1/accounts/register", new
        {
            accountName = "survivor",
            email = "other@example.com",
            password = "a-long-development-password"
        }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, again.StatusCode);

        // Signing out removes the session from the database, not only from this process.
        HttpRequestMessage logout = new(HttpMethod.Post, "/api/v1/accounts/logout");
        logout.Headers.Add("Cookie", cookie);
        await restarted.SendAsync(logout, TestContext.Current.CancellationToken);
        HttpResponseMessage afterLogout = await restarted.SendAsync(Me(cookie), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, afterLogout.StatusCode);
    }

    [Fact]
    public async Task TheHealthEndpointAnswersWhileTheDatabaseDoes()
    {
        await using PostgresTestDatabase database = await PostgresTestDatabase.CreateAsync();
        await using AccountApiFactory factory = new(accountDatabase: database.ConnectionString, environment: "Production");
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage health = await client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, health.StatusCode);
    }

    [Fact]
    public void AServiceWhoseDatabaseCannotBeReachedDoesNotStart()
    {
        // Nothing listens on this port of the loopback address; the short timeout keeps the test quick.
        using AccountApiFactory factory = new(
            accountDatabase: "Host=127.0.0.1;Port=1;Database=absent;Username=nobody;Timeout=2;Command Timeout=2");

        Assert.ThrowsAny<Exception>(() => factory.CreateAccountClient());
    }
}
