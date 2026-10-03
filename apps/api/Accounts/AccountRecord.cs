// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>An account as the store keeps it.</summary>
/// <param name="Id">Stable identifier; sessions refer to the account by it.</param>
/// <param name="AccountName">Account name in its canonical spelling, as shown and used in URLs.</param>
/// <param name="NormalizedAccountName">Upper-case form of the name; the uniqueness key.</param>
/// <param name="Email">Email address as the owner entered it.</param>
/// <param name="NormalizedEmail">Upper-case form of the address; the uniqueness key.</param>
/// <param name="GoogleSubject">
/// Subject identifier of the linked Google identity; <see langword="null"/> for a password account.
/// </param>
/// <param name="PasswordHash">
/// ASP.NET Core Identity password hash; <see langword="null"/> for an account that signs in through Google only.
/// </param>
/// <param name="CreatedAt">Moment the account was created, in UTC.</param>
internal sealed record AccountRecord(
    Guid Id,
    string AccountName,
    string NormalizedAccountName,
    string Email,
    string NormalizedEmail,
    string? GoogleSubject,
    string? PasswordHash,
    DateTimeOffset CreatedAt);

/// <summary>A session as the store keeps it.</summary>
/// <param name="TokenDigest">SHA-256 digest of the session token. The token itself is never stored.</param>
/// <param name="AccountId">Identifier of the account the session belongs to.</param>
/// <param name="CreatedAt">Moment the session was opened, in UTC.</param>
/// <param name="ExpiresAt">Moment the session stops being valid, in UTC.</param>
internal sealed record SessionRecord(
    byte[] TokenDigest,
    Guid AccountId,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

