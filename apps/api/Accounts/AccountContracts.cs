// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Accounts;

public sealed record RegisterAccountRequest(string? AccountName, string? Email, string? Password);

public sealed record LoginAccountRequest(string? Email, string? Password);

public sealed record AccountResponse(string AccountName, string Email, DateTimeOffset CreatedAt);

internal sealed record AuthenticatedAccount(AccountRecord Account, string SessionToken, DateTimeOffset ExpiresAt);

internal enum CreateAccountStatus
{
    Created,
    AccountNameUnavailable,
    EmailUnavailable,
    GoogleSubjectUnavailable
}

internal sealed record CreateAccountResult(CreateAccountStatus Status, AccountRecord? Account)
{
    public static CreateAccountResult Created(AccountRecord account) => new(CreateAccountStatus.Created, account);
    public static CreateAccountResult AccountNameUnavailable() => new(CreateAccountStatus.AccountNameUnavailable, null);
    public static CreateAccountResult EmailUnavailable() => new(CreateAccountStatus.EmailUnavailable, null);
    public static CreateAccountResult GoogleSubjectUnavailable() =>
        new(CreateAccountStatus.GoogleSubjectUnavailable, null);
}

