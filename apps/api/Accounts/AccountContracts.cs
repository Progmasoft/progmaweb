// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Body of <c>POST /api/v1/accounts/register</c>.</summary>
/// <remarks>
/// Every field is optional on the wire so that a missing value is reported as a validation error of that field
/// instead of a malformed request.
/// </remarks>
/// <param name="AccountName">Requested account name; see <see cref="AccountNamePolicy"/>.</param>
/// <param name="Email">Email address of the account; see <see cref="EmailAddressPolicy"/>.</param>
/// <param name="Password">Password in plain text; see <see cref="PasswordPolicy"/>. It is hashed before it is stored.</param>
public sealed record RegisterAccountRequest(string? AccountName, string? Email, string? Password);

/// <summary>Body of <c>POST /api/v1/accounts/login</c>.</summary>
/// <param name="Email">Email address the account was registered with.</param>
/// <param name="Password">Password in plain text.</param>
public sealed record LoginAccountRequest(string? Email, string? Password);

/// <summary>Public view of an account, returned by the register, login and <c>/me</c> endpoints.</summary>
/// <param name="AccountName">Account name in its canonical spelling.</param>
/// <param name="Email">Email address as the owner entered it.</param>
/// <param name="CreatedAt">Moment the account was created, in UTC.</param>
public sealed record AccountResponse(string AccountName, string Email, DateTimeOffset CreatedAt);

/// <summary>An account together with the session that was just opened for it.</summary>
/// <param name="Account">The signed-in account.</param>
/// <param name="SessionToken">
/// Session token for the cookie. It exists only here and in the browser; the store keeps its digest.
/// </param>
/// <param name="ExpiresAt">Moment the session stops being valid, in UTC.</param>
internal sealed record AuthenticatedAccount(AccountRecord Account, string SessionToken, DateTimeOffset ExpiresAt);

/// <summary>Outcome of asking the store to create an account.</summary>
internal enum CreateAccountStatus
{
    /// <summary>The account was stored.</summary>
    Created,
    /// <summary>Another account already has this name, compared without case.</summary>
    AccountNameUnavailable,
    /// <summary>Another account already has this email address, compared without case.</summary>
    EmailUnavailable,
    /// <summary>Another account is already linked to this Google identity.</summary>
    GoogleSubjectUnavailable
}

/// <summary>Result of <see cref="IAccountStore.CreateAsync"/>.</summary>
/// <param name="Status">Whether the account was stored, and if not, which uniqueness rule refused it.</param>
/// <param name="Account">The stored account; <see langword="null"/> unless <paramref name="Status"/> is created.</param>
internal sealed record CreateAccountResult(CreateAccountStatus Status, AccountRecord? Account)
{
    /// <summary>Creates the result of a stored account.</summary>
    /// <param name="account">The account that was stored.</param>
    /// <returns>A result with the created status and the account.</returns>
    public static CreateAccountResult Created(AccountRecord account) => new(CreateAccountStatus.Created, account);
    /// <summary>Creates the result of a refused account name.</summary>
    /// <returns>A result without an account.</returns>
    public static CreateAccountResult AccountNameUnavailable() => new(CreateAccountStatus.AccountNameUnavailable, null);
    /// <summary>Creates the result of a refused email address.</summary>
    /// <returns>A result without an account.</returns>
    public static CreateAccountResult EmailUnavailable() => new(CreateAccountStatus.EmailUnavailable, null);
    /// <summary>Creates the result of a refused Google identity.</summary>
    /// <returns>A result without an account.</returns>
    public static CreateAccountResult GoogleSubjectUnavailable() =>
        new(CreateAccountStatus.GoogleSubjectUnavailable, null);
}

