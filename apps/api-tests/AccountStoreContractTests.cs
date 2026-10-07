// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Npgsql;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>The rules every <see cref="IAccountStore"/> keeps, run against each implementation.</summary>
/// <remarks>
/// The in-memory store and the PostgreSQL store have to behave alike, because the service tests run on the first
/// and production runs on the second. One set of tests states the rules; a subclass supplies the store.
/// </remarks>
public abstract class AccountStoreContractTests
{
    /// <summary>A moment with a fraction PostgreSQL cannot keep: seven digits where it keeps six.</summary>
    private static readonly DateTimeOffset Moment = new DateTimeOffset(2026, 10, 6, 12, 30, 15, TimeSpan.Zero).AddTicks(1234567);

    private static CancellationToken Cancellation => TestContext.Current.CancellationToken;

    /// <summary>Creates an empty store. A subclass without its database skips the test here.</summary>
    private protected abstract ValueTask<IAccountStore> CreateStoreAsync();

    private static AccountRecord Account(string name, string email, string? googleSubject = null, string? passwordHash = "hash") =>
        new(
            Guid.NewGuid(),
            name,
            name.ToUpperInvariant(),
            email,
            email.ToUpperInvariant(),
            googleSubject,
            passwordHash,
            Moment);

    private static byte[] Digest(byte seed) => [.. Enumerable.Range(0, 32).Select(index => (byte)(seed + index))];

    [Fact]
    public async Task AStoredAccountIsFoundByEachOfItsKeys()
    {
        IAccountStore store = await CreateStoreAsync();
        AccountRecord account = Account("Ada", "ada@example.com", googleSubject: "google-ada", passwordHash: null);

        CreateAccountResult result = await store.CreateAsync(account, Cancellation);

        Assert.Equal(CreateAccountStatus.Created, result.Status);
        AccountRecord stored = Assert.IsType<AccountRecord>(result.Account);
        Assert.Equal(account with { CreatedAt = stored.CreatedAt }, stored);
        // What the store returns is what it keeps: a later read gives the same moment, to the last digit.
        Assert.True((account.CreatedAt - stored.CreatedAt).Duration() < TimeSpan.FromMicroseconds(1));
        Assert.Equal(stored, await store.FindByIdAsync(account.Id, Cancellation));
        Assert.Equal(stored, await store.FindByEmailAsync("ADA@EXAMPLE.COM", Cancellation));
        Assert.Equal(stored, await store.FindByGoogleSubjectAsync("google-ada", Cancellation));
    }

    [Fact]
    public async Task AnAccountWithoutAGoogleIdentityKeepsItsPasswordHash()
    {
        IAccountStore store = await CreateStoreAsync();
        AccountRecord account = Account("Grace", "grace@example.com", passwordHash: "AQAAAA-hash");

        await store.CreateAsync(account, Cancellation);

        AccountRecord found = Assert.IsType<AccountRecord>(await store.FindByIdAsync(account.Id, Cancellation));
        Assert.Null(found.GoogleSubject);
        Assert.Equal("AQAAAA-hash", found.PasswordHash);
        Assert.Equal("Grace", found.AccountName);
        Assert.Equal("grace@example.com", found.Email);
    }

    [Fact]
    public async Task UnknownKeysFindNothing()
    {
        IAccountStore store = await CreateStoreAsync();
        await store.CreateAsync(Account("Known", "known@example.com"), Cancellation);

        Assert.Null(await store.FindByIdAsync(Guid.NewGuid(), Cancellation));
        Assert.Null(await store.FindByEmailAsync("OTHER@EXAMPLE.COM", Cancellation));
        // The lookup key is the normalized address; the spelling the owner entered is not a key.
        Assert.Null(await store.FindByEmailAsync("known@example.com", Cancellation));
        Assert.Null(await store.FindByGoogleSubjectAsync("google-nobody", Cancellation));
    }

    [Fact]
    public async Task ATakenNameAddressOrGoogleIdentityIsRefusedAndNothingIsStored()
    {
        IAccountStore store = await CreateStoreAsync();
        await store.CreateAsync(Account("Taken", "taken@example.com", "google-taken"), Cancellation);

        AccountRecord sameName = Account("TAKEN", "one@example.com", "google-one");
        AccountRecord sameEmail = Account("Two", "Taken@Example.com", "google-two");
        AccountRecord sameGoogle = Account("Three", "three@example.com", "google-taken");

        Assert.Equal(CreateAccountStatus.AccountNameUnavailable, (await store.CreateAsync(sameName, Cancellation)).Status);
        Assert.Equal(CreateAccountStatus.EmailUnavailable, (await store.CreateAsync(sameEmail, Cancellation)).Status);
        Assert.Equal(CreateAccountStatus.GoogleSubjectUnavailable, (await store.CreateAsync(sameGoogle, Cancellation)).Status);

        foreach (AccountRecord refused in new[] { sameName, sameEmail, sameGoogle })
        {
            Assert.Null(await store.FindByIdAsync(refused.Id, Cancellation));
        }
        // A refused account leaves its free keys free.
        Assert.Null(await store.FindByEmailAsync("ONE@EXAMPLE.COM", Cancellation));
        Assert.Null(await store.FindByGoogleSubjectAsync("google-two", Cancellation));
        Assert.Equal(
            CreateAccountStatus.Created,
            (await store.CreateAsync(Account("One", "one@example.com", "google-two"), Cancellation)).Status);
    }

    [Fact]
    public async Task SeveralBrokenRulesAreReportedInOneFixedOrder()
    {
        IAccountStore store = await CreateStoreAsync();
        await store.CreateAsync(Account("Taken", "taken@example.com", "google-taken"), Cancellation);

        // Google identity before name, name before address, whichever the store happens to check first.
        Assert.Equal(
            CreateAccountStatus.GoogleSubjectUnavailable,
            (await store.CreateAsync(Account("Taken", "taken@example.com", "google-taken"), Cancellation)).Status);
        Assert.Equal(
            CreateAccountStatus.AccountNameUnavailable,
            (await store.CreateAsync(Account("Taken", "taken@example.com", "google-free"), Cancellation)).Status);
        Assert.Equal(
            CreateAccountStatus.AccountNameUnavailable,
            (await store.CreateAsync(Account("Taken", "taken@example.com"), Cancellation)).Status);
        Assert.Equal(
            CreateAccountStatus.EmailUnavailable,
            (await store.CreateAsync(Account("Free", "taken@example.com"), Cancellation)).Status);
    }

    [Fact]
    public async Task ManyAccountsMayBeWithoutAGoogleIdentity()
    {
        IAccountStore store = await CreateStoreAsync();

        for (int index = 0; index < 5; index++)
        {
            CreateAccountResult result =
                await store.CreateAsync(Account($"User{index}", $"user{index}@example.com"), Cancellation);
            Assert.Equal(CreateAccountStatus.Created, result.Status);
        }
    }

    [Fact]
    public async Task OfManyRequestsForOneNameExactlyOneIsStored()
    {
        IAccountStore store = await CreateStoreAsync();
        AccountRecord[] candidates = [.. Enumerable.Range(0, 16).Select(index => Account("Race", $"race{index}@example.com"))];

        CreateAccountResult[] results = await Task.WhenAll(
            candidates.Select(candidate => Task.Run(async () => await store.CreateAsync(candidate, Cancellation))));

        CreateAccountResult winner = Assert.Single(results, result => result.Status is CreateAccountStatus.Created);
        Assert.All(
            results.Where(result => !ReferenceEquals(result, winner)),
            result => Assert.Equal(CreateAccountStatus.AccountNameUnavailable, result.Status));
        foreach (AccountRecord candidate in candidates)
        {
            AccountRecord? found = await store.FindByIdAsync(candidate.Id, Cancellation);
            Assert.Equal(candidate.Id == winner.Account!.Id, found is not null);
        }
    }

    [Fact]
    public async Task ASessionIsStoredFoundReplacedAndRevoked()
    {
        IAccountStore store = await CreateStoreAsync();
        AccountRecord first = Account("First", "first@example.com");
        AccountRecord second = Account("Second", "second@example.com");
        await store.CreateAsync(first, Cancellation);
        await store.CreateAsync(second, Cancellation);
        DateTimeOffset created = new(2026, 10, 6, 8, 0, 0, TimeSpan.Zero);
        SessionRecord session = new(Digest(1), first.Id, created, created.AddHours(12));

        Assert.Null(await store.FindSessionAsync(Digest(1), Cancellation));
        await store.StoreSessionAsync(session, Cancellation);

        SessionRecord found = Assert.IsType<SessionRecord>(await store.FindSessionAsync(Digest(1), Cancellation));
        Assert.Equal(session.TokenDigest, found.TokenDigest);
        Assert.Equal(first.Id, found.AccountId);
        Assert.Equal(session.CreatedAt, found.CreatedAt);
        Assert.Equal(session.ExpiresAt, found.ExpiresAt);
        Assert.Null(await store.FindSessionAsync(Digest(2), Cancellation));

        // Storing the same digest again replaces the session.
        await store.StoreSessionAsync(session with { AccountId = second.Id, ExpiresAt = created.AddHours(1) }, Cancellation);
        SessionRecord replaced = Assert.IsType<SessionRecord>(await store.FindSessionAsync(Digest(1), Cancellation));
        Assert.Equal(second.Id, replaced.AccountId);
        Assert.Equal(created.AddHours(1), replaced.ExpiresAt);

        await store.RevokeSessionAsync(Digest(1), Cancellation);
        Assert.Null(await store.FindSessionAsync(Digest(1), Cancellation));
        // Revoking again, or revoking what never existed, is not an error.
        await store.RevokeSessionAsync(Digest(1), Cancellation);
        await store.RevokeSessionAsync(Digest(9), Cancellation);
    }

    [Fact]
    public async Task ASessionOfAnAccountThatIsNotStoredIsRefused()
    {
        IAccountStore store = await CreateStoreAsync();
        DateTimeOffset created = new(2026, 10, 6, 8, 0, 0, TimeSpan.Zero);
        SessionRecord orphan = new(Digest(3), Guid.NewGuid(), created, created.AddHours(1));

        await Assert.ThrowsAnyAsync<Exception>(async () => await store.StoreSessionAsync(orphan, Cancellation));

        Assert.Null(await store.FindSessionAsync(Digest(3), Cancellation));
    }

    [Fact]
    public async Task OnlyExpiredSessionsAreRemoved()
    {
        IAccountStore store = await CreateStoreAsync();
        AccountRecord account = Account("Owner", "owner@example.com");
        await store.CreateAsync(account, Cancellation);
        DateTimeOffset now = new(2026, 10, 6, 12, 0, 0, TimeSpan.Zero);
        await store.StoreSessionAsync(new SessionRecord(Digest(10), account.Id, now.AddHours(-13), now.AddHours(-1)), Cancellation);
        // A session expires at its expiry, not after it.
        await store.StoreSessionAsync(new SessionRecord(Digest(20), account.Id, now.AddHours(-12), now), Cancellation);
        await store.StoreSessionAsync(new SessionRecord(Digest(30), account.Id, now.AddHours(-1), now.AddTicks(10)), Cancellation);
        await store.StoreSessionAsync(new SessionRecord(Digest(40), account.Id, now, now.AddHours(12)), Cancellation);

        Assert.Equal(2, await store.RemoveExpiredSessionsAsync(now, Cancellation));

        Assert.Null(await store.FindSessionAsync(Digest(10), Cancellation));
        Assert.Null(await store.FindSessionAsync(Digest(20), Cancellation));
        Assert.NotNull(await store.FindSessionAsync(Digest(30), Cancellation));
        Assert.NotNull(await store.FindSessionAsync(Digest(40), Cancellation));
        Assert.Equal(0, await store.RemoveExpiredSessionsAsync(now, Cancellation));
        // The account outlives its sessions.
        Assert.NotNull(await store.FindByIdAsync(account.Id, Cancellation));
    }
}

public sealed class InMemoryAccountStoreTests : AccountStoreContractTests
{
    private protected override ValueTask<IAccountStore> CreateStoreAsync() =>
        ValueTask.FromResult<IAccountStore>(new InMemoryAccountStore());
}

public sealed class PostgresAccountStoreTests : AccountStoreContractTests, IAsyncDisposable
{
    private PostgresTestDatabase? database;
    private NpgsqlDataSource? dataSource;

    private protected override async ValueTask<IAccountStore> CreateStoreAsync()
    {
        database = await PostgresTestDatabase.CreateAsync();
        dataSource = database.OpenDataSource();
        await AccountSchema.ApplyAsync(dataSource, TestContext.Current.CancellationToken);
        return new PostgresAccountStore(dataSource);
    }

    public async ValueTask DisposeAsync()
    {
        if (dataSource is not null)
        {
            await dataSource.DisposeAsync();
        }

        if (database is not null)
        {
            await database.DisposeAsync();
        }
    }

    [Fact]
    public async Task WhatOneProcessStoredAnotherProcessFinds()
    {
        IAccountStore first = await CreateStoreAsync();
        AccountRecord account = new(
            Guid.NewGuid(), "Durable", "DURABLE", "durable@example.com", "DURABLE@EXAMPLE.COM", null, "hash",
            new DateTimeOffset(2026, 10, 6, 9, 0, 0, TimeSpan.Zero));
        byte[] digest = [.. Enumerable.Repeat((byte)7, 32)];
        await first.CreateAsync(account, TestContext.Current.CancellationToken);
        await first.StoreSessionAsync(
            new SessionRecord(digest, account.Id, account.CreatedAt, account.CreatedAt.AddHours(12)),
            TestContext.Current.CancellationToken);

        // A second pool of connections stands for the service after a restart: it shares nothing with the first
        // but the database.
        await dataSource!.DisposeAsync();
        dataSource = database!.OpenDataSource();
        PostgresAccountStore second = new(dataSource);

        Assert.Equal(account, await second.FindByIdAsync(account.Id, TestContext.Current.CancellationToken));
        SessionRecord session = Assert.IsType<SessionRecord>(
            await second.FindSessionAsync(digest, TestContext.Current.CancellationToken));
        Assert.Equal(account.Id, session.AccountId);
        Assert.Equal(
            CreateAccountStatus.AccountNameUnavailable,
            (await second.CreateAsync(account with { Id = Guid.NewGuid(), Email = "x@example.com", NormalizedEmail = "X@EXAMPLE.COM" },
                TestContext.Current.CancellationToken)).Status);
    }

    [Fact]
    public async Task TheSchemaIsAppliedOnceHoweverOftenAndHoweverConcurrentlyItIsAsked()
    {
        await using PostgresTestDatabase fresh = await PostgresTestDatabase.CreateAsync();
        await using NpgsqlDataSource source = fresh.OpenDataSource();

        int[] taken = await Task.WhenAll(Enumerable.Range(0, 6).Select(_ =>
            Task.Run(() => AccountSchema.ApplyAsync(source, TestContext.Current.CancellationToken))));

        // Processes that start together wait for one another; one of them takes every step and the rest none.
        Assert.Equal(AccountSchema.CurrentVersion, taken.Sum());
        Assert.Equal(0, await AccountSchema.ApplyAsync(source, TestContext.Current.CancellationToken));
        await using NpgsqlCommand versions = source.CreateCommand("SELECT count(*), max(version) FROM account_schema_versions");
        await using NpgsqlDataReader reader = await versions.ExecuteReaderAsync(TestContext.Current.CancellationToken);
        await reader.ReadAsync(TestContext.Current.CancellationToken);
        Assert.Equal(AccountSchema.CurrentVersion, reader.GetInt64(0));
        Assert.Equal(AccountSchema.CurrentVersion, reader.GetInt32(1));
    }

    [Fact]
    public async Task ADatabaseNewerThanTheProgramIsRefusedAndLeftAsItIs()
    {
        await using PostgresTestDatabase fresh = await PostgresTestDatabase.CreateAsync();
        await using NpgsqlDataSource source = fresh.OpenDataSource();
        await AccountSchema.ApplyAsync(source, TestContext.Current.CancellationToken);
        await using (NpgsqlCommand future = source.CreateCommand("INSERT INTO account_schema_versions (version) VALUES ($1)"))
        {
            future.Parameters.AddWithValue(AccountSchema.CurrentVersion + 1);
            await future.ExecuteNonQueryAsync(TestContext.Current.CancellationToken);
        }

        InvalidOperationException refused = await Assert.ThrowsAsync<InvalidOperationException>(
            () => AccountSchema.ApplyAsync(source, TestContext.Current.CancellationToken));

        Assert.Contains("schema version", refused.Message, StringComparison.Ordinal);
        await using NpgsqlCommand count = source.CreateCommand("SELECT count(*) FROM accounts");
        Assert.Equal(0L, await count.ExecuteScalarAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public void AMomentIsCutToTheMicrosecondInUtc()
    {
        DateTimeOffset local = new DateTimeOffset(2026, 10, 6, 15, 30, 0, TimeSpan.FromHours(3)).AddTicks(1234567);

        DateTimeOffset stored = PostgresAccountStore.ToStoredPrecision(local);

        Assert.Equal(TimeSpan.Zero, stored.Offset);
        Assert.Equal(new DateTimeOffset(2026, 10, 6, 12, 30, 0, TimeSpan.Zero).AddTicks(1234560), stored);
        Assert.Equal(stored, PostgresAccountStore.ToStoredPrecision(stored));
    }
}
