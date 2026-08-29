// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

namespace Progmasoft.Progmaweb.Api.Accounts;

internal sealed record AccountRecord(
    Guid Id,
    string AccountName,
    string NormalizedAccountName,
    string Email,
    string NormalizedEmail,
    string PasswordHash,
    DateTimeOffset CreatedAt);

internal sealed record SessionRecord(
    byte[] TokenDigest,
    Guid AccountId,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

