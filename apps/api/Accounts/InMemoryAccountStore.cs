// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

namespace Progmasoft.Progmaweb.Api.Accounts;

// This development store models the uniqueness and session semantics required by the future PostgreSQL implementation.
// It deliberately exposes no enumeration or bulk-delete surface to public endpoints.
internal sealed class InMemoryAccountStore : IAccountStore
{
    private readonly Lock gate = new();
    private readonly Dictionary<Guid, AccountRecord> accountsById = [];
    private readonly Dictionary<string, Guid> accountIdsByEmail = new(StringComparer.Ordinal);
    private readonly Dictionary<string, Guid> accountIdsByName = new(StringComparer.Ordinal);
    private readonly Dictionary<string, SessionRecord> sessionsByDigest = new(StringComparer.Ordinal);

    public ValueTask<CreateAccountResult> CreateAsync(AccountRecord account, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        lock (gate)
        {
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
            return ValueTask.FromResult(CreateAccountResult.Created(account));
        }
    }

    public ValueTask<AccountRecord?> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            return ValueTask.FromResult(
                accountIdsByEmail.TryGetValue(normalizedEmail, out Guid id) ? accountsById[id] : null);
        }
    }

    public ValueTask<AccountRecord?> FindByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            accountsById.TryGetValue(id, out AccountRecord? account);
            return ValueTask.FromResult(account);
        }
    }

    public ValueTask StoreSessionAsync(SessionRecord session, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            sessionsByDigest[Convert.ToHexString(session.TokenDigest)] = session;
            return ValueTask.CompletedTask;
        }
    }

    public ValueTask<SessionRecord?> FindSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        lock (gate)
        {
            sessionsByDigest.TryGetValue(Convert.ToHexString(tokenDigest), out SessionRecord? session);
            return ValueTask.FromResult(session);
        }
    }

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

