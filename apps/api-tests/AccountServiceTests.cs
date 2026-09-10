// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class AccountServiceTests
{
    [Fact]
    public async Task GoogleAuthenticationRejectsAnEmailWithoutAProviderSubject()
    {
        InMemoryAccountStore store = new();
        AccountService accounts = new(store, TimeProvider.System);
        SessionService sessions = new(
            store,
            TimeProvider.System,
            Options.Create(new AccountSessionOptions()));

        (AuthenticatedAccount? authentication, GoogleAccountFailure failure) =
            await accounts.AuthenticateGoogleAsync(
                null,
                "google@example.com",
                "GoogleUser",
                sessions,
                TestContext.Current.CancellationToken);

        Assert.Null(authentication);
        Assert.Equal(GoogleAccountFailure.ProviderRejected, failure);
    }

    [Fact]
    public async Task GoogleAuthenticationDoesNotLinkAnUnverifiedPasswordAccountByEmail()
    {
        InMemoryAccountStore store = new();
        AccountService accounts = new(store, TimeProvider.System);
        SessionService sessions = new(
            store,
            TimeProvider.System,
            Options.Create(new AccountSessionOptions()));

        (AuthenticatedAccount? registration, _) = await accounts.RegisterAsync(
            new RegisterAccountRequest(
                "PasswordUser",
                "unverified@example.com",
                "a-long-development-password"),
            sessions,
            TestContext.Current.CancellationToken);
        Assert.NotNull(registration);

        (AuthenticatedAccount? authentication, GoogleAccountFailure failure) =
            await accounts.AuthenticateGoogleAsync(
                "google-subject-victim",
                "unverified@example.com",
                null,
                sessions,
                TestContext.Current.CancellationToken);

        Assert.Null(authentication);
        Assert.Equal(GoogleAccountFailure.ProviderRejected, failure);
    }

    [Fact]
    public async Task GoogleAuthenticationDoesNotLinkAConcurrentPasswordAccountByEmail()
    {
        AccountRecord passwordAccount = new(
            Guid.NewGuid(),
            "PasswordUser",
            "PASSWORDUSER",
            "race@example.com",
            "RACE@EXAMPLE.COM",
            null,
            "password-hash",
            DateTimeOffset.UtcNow);
        ConcurrentPasswordRegistrationStore store = new(passwordAccount);
        AccountService accounts = new(store, TimeProvider.System);
        SessionService sessions = new(
            store,
            TimeProvider.System,
            Options.Create(new AccountSessionOptions()));

        (AuthenticatedAccount? authentication, GoogleAccountFailure failure) =
            await accounts.AuthenticateGoogleAsync(
                "google-subject-race",
                "race@example.com",
                "GoogleUser",
                sessions,
                TestContext.Current.CancellationToken);

        Assert.Null(authentication);
        Assert.Equal(GoogleAccountFailure.ProviderRejected, failure);
        Assert.Equal(0, store.StoredSessionCount);
    }

    [Fact]
    public async Task GoogleAuthenticationReusesAnExistingGoogleOnlyAccount()
    {
        InMemoryAccountStore store = new();
        AccountService accounts = new(store, TimeProvider.System);
        SessionService sessions = new(
            store,
            TimeProvider.System,
            Options.Create(new AccountSessionOptions()));
        (AuthenticatedAccount? first, GoogleAccountFailure firstFailure) =
            await accounts.AuthenticateGoogleAsync(
                "google-subject-stable",
                "google@example.com",
                "GoogleUser",
                sessions,
                TestContext.Current.CancellationToken);

        (AuthenticatedAccount? second, GoogleAccountFailure secondFailure) =
            await accounts.AuthenticateGoogleAsync(
                "google-subject-stable",
                "changed@example.com",
                null,
                sessions,
                TestContext.Current.CancellationToken);

        Assert.NotNull(first);
        Assert.Equal(GoogleAccountFailure.None, firstFailure);
        Assert.NotNull(second);
        Assert.Equal(GoogleAccountFailure.None, secondFailure);
        Assert.Equal(first.Account.Id, second.Account.Id);
    }

    private sealed class ConcurrentPasswordRegistrationStore(AccountRecord passwordAccount) : IAccountStore
    {
        private bool createAttempted;

        public int StoredSessionCount { get; private set; }

        public ValueTask<CreateAccountResult> CreateAsync(
            AccountRecord account,
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            createAttempted = true;
            return ValueTask.FromResult(CreateAccountResult.EmailUnavailable());
        }

        public ValueTask<AccountRecord?> FindByEmailAsync(
            string normalizedEmail,
            CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();
            return ValueTask.FromResult<AccountRecord?>(createAttempted ? passwordAccount : null);
        }

        public ValueTask<AccountRecord?> FindByIdAsync(Guid id, CancellationToken cancellationToken) =>
            ValueTask.FromResult<AccountRecord?>(passwordAccount.Id == id ? passwordAccount : null);

        public ValueTask<AccountRecord?> FindByGoogleSubjectAsync(
            string googleSubject,
            CancellationToken cancellationToken) =>
            ValueTask.FromResult<AccountRecord?>(null);

        public ValueTask StoreSessionAsync(SessionRecord session, CancellationToken cancellationToken)
        {
            StoredSessionCount++;
            return ValueTask.CompletedTask;
        }

        public ValueTask<SessionRecord?> FindSessionAsync(
            byte[] tokenDigest,
            CancellationToken cancellationToken) =>
            ValueTask.FromResult<SessionRecord?>(null);

        public ValueTask RevokeSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken) =>
            ValueTask.CompletedTask;
    }
}
