// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Persistence of accounts and sessions.</summary>
/// <remarks>
/// The store owns the uniqueness rules: account name, email address and Google identity are each unique, and a
/// creation that would break one of them is refused atomically. It offers no enumeration of accounts and no way to
/// delete one; the only removal in bulk is that of sessions that have already expired.
/// </remarks>
internal interface IAccountStore
{
    /// <summary>Stores a new account unless its name, email address or Google identity is taken.</summary>
    /// <param name="account">The account to store, with its normalized keys filled in.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The stored account, or the uniqueness rule that refused it.</returns>
    ValueTask<CreateAccountResult> CreateAsync(AccountRecord account, CancellationToken cancellationToken);
    /// <summary>Finds an account by its normalized email address.</summary>
    /// <param name="normalizedEmail">Upper-case email address, as <see cref="EmailAddressPolicy"/> produces it.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The account, or <see langword="null"/> when no account has this address.</returns>
    ValueTask<AccountRecord?> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken);
    /// <summary>Finds the account linked to a Google identity.</summary>
    /// <param name="googleSubject">Subject identifier Google issued for the identity.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The account, or <see langword="null"/> when the identity is not linked.</returns>
    ValueTask<AccountRecord?> FindByGoogleSubjectAsync(string googleSubject, CancellationToken cancellationToken);
    /// <summary>Finds an account by its identifier.</summary>
    /// <param name="id">Identifier of the account.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The account, or <see langword="null"/> when it does not exist.</returns>
    ValueTask<AccountRecord?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    /// <summary>Stores a session, replacing one with the same token digest.</summary>
    /// <param name="session">The session to store.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>A task that completes when the session is stored.</returns>
    ValueTask StoreSessionAsync(SessionRecord session, CancellationToken cancellationToken);
    /// <summary>Finds a session by the digest of its token.</summary>
    /// <param name="tokenDigest">SHA-256 digest of the session token.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The session, or <see langword="null"/> when it does not exist or was revoked.</returns>
    ValueTask<SessionRecord?> FindSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken);
    /// <summary>Removes a session. Revoking an unknown session is not an error.</summary>
    /// <param name="tokenDigest">SHA-256 digest of the session token.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>A task that completes when the session is gone.</returns>
    ValueTask RevokeSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken);
    /// <summary>Removes every session that has expired.</summary>
    /// <remarks>A session has expired when its expiry is not later than <paramref name="now"/>.</remarks>
    /// <param name="now">The current moment, in UTC.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The number of sessions that were removed.</returns>
    ValueTask<int> RemoveExpiredSessionsAsync(DateTimeOffset now, CancellationToken cancellationToken);
}

