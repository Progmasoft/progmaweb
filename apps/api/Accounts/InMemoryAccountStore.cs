// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Accounts;

// This development store models the uniqueness and session semantics required by the future PostgreSQL implementation.
// It deliberately exposes no enumeration or bulk-delete surface to public endpoints.
/// <summary>An <see cref="IAccountStore"/> that keeps everything in the memory of the process.</summary>
/// <remarks>
/// It implements the uniqueness and session rules a durable store must keep, under one lock. Nothing survives a
/// restart of the service: every account and every session is lost when the process stops.
/// </remarks>
internal sealed class InMemoryAccountStore : IAccountStore
{
    /// <summary>Guards every dictionary below; each operation holds it for its whole duration.</summary>
    private readonly Lock gate = new();
    /// <summary>Every account, by identifier.</summary>
    private readonly Dictionary<Guid, AccountRecord> accountsById = [];
    /// <summary>Account identifiers by normalized email address; the uniqueness index of addresses.</summary>
    private readonly Dictionary<string, Guid> accountIdsByEmail = new(StringComparer.Ordinal);
    /// <summary>Account identifiers by Google subject; the uniqueness index of linked identities.</summary>
    private readonly Dictionary<string, Guid> accountIdsByGoogleSubject = new(StringComparer.Ordinal);
    /// <summary>Account identifiers by normalized account name; the uniqueness index of names.</summary>
    private readonly Dictionary<string, Guid> accountIdsByName = new(StringComparer.Ordinal);
    /// <summary>Sessions by the hexadecimal form of their token digest.</summary>
    private readonly Dictionary<string, SessionRecord> sessionsByDigest = new(StringComparer.Ordinal);

    /// <inheritdoc/>
    public ValueTask<CreateAccountResult> CreateAsync(AccountRecord account, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        lock (gate)
        {
            if (account.GoogleSubject is not null && accountIdsByGoogleSubject.ContainsKey(account.GoogleSubject))
            {
                return ValueTask.FromResult(CreateAccountResult.GoogleSubjectUnavailable());
            }

            if (accountIdsByName.ContainsKey(account.NormalizedAccountName))
            {
                return ValueTask.FromResult(CreateAccountResult.AccountNameUnavailable());
            }

            if (accountIdsByEmail.ContainsKey(account.NormalizedEmail))
            {
                return ValueTask.FromResult(CreateAccountResult.EmailUnavailable());
            }

            accountsById.Add(account.Id, account);
            accountIdsByName.Add(account.NormalizedAccountName, account.Id);
            accountIdsByEmail.Add(account.NormalizedEmail, account.Id);
            if (account.GoogleSubject is not null)
            {
                accountIdsByGoogleSubject.Add(account.GoogleSubject, account.Id);
            }
            return ValueTask.FromResult(CreateAccountResult.Created(account));
        }
    }

    /// <inheritdoc/>
    public ValueTask<AccountRecord?> FindByGoogleSubjectAsync(
        string googleSubject,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            return ValueTask.FromResult(
                accountIdsByGoogleSubject.TryGetValue(googleSubject, out Guid id) ? accountsById[id] : null);
        }
    }

    /// <inheritdoc/>
    public ValueTask<AccountRecord?> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            return ValueTask.FromResult(
                accountIdsByEmail.TryGetValue(normalizedEmail, out Guid id) ? accountsById[id] : null);
        }
    }

    /// <inheritdoc/>
    public ValueTask<AccountRecord?> FindByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            accountsById.TryGetValue(id, out AccountRecord? account);
            return ValueTask.FromResult(account);
        }
    }

    /// <inheritdoc/>
    public ValueTask StoreSessionAsync(SessionRecord session, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            sessionsByDigest[Convert.ToHexString(session.TokenDigest)] = session;
            return ValueTask.CompletedTask;
        }
    }

    /// <inheritdoc/>
    public ValueTask<SessionRecord?> FindSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            sessionsByDigest.TryGetValue(Convert.ToHexString(tokenDigest), out SessionRecord? session);
            return ValueTask.FromResult(session);
        }
    }

    /// <inheritdoc/>
    public ValueTask RevokeSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            sessionsByDigest.Remove(Convert.ToHexString(tokenDigest));
            return ValueTask.CompletedTask;
        }
    }
}

