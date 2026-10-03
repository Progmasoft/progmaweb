// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.AspNetCore.Identity;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Registration and sign-in rules of the account service.</summary>
/// <param name="store">Store that keeps accounts.</param>
/// <param name="timeProvider">Clock used for creation times.</param>
internal sealed class AccountService(
    IAccountStore store,
    TimeProvider timeProvider)
{
    /// <summary>An account that never exists; the subject of the dummy verification.</summary>
    private static readonly AccountRecord DummyAccount = new(
        Guid.Empty,
        "Missing00",
        "MISSING00",
        "missing@example.invalid",
        "MISSING@EXAMPLE.INVALID",
        null,
        string.Empty,
        DateTimeOffset.UnixEpoch);
    /// <summary>
    /// A hash that no submitted password matches. Verifying against it makes a sign-in with an unknown address cost
    /// as much as one with a wrong password.
    /// </summary>
    private static readonly string DummyPasswordHash =
        new PasswordHasher<AccountRecord>().HashPassword(DummyAccount, "not-the-provided-password");

    /// <summary>Hashes and verifies passwords with the ASP.NET Core Identity algorithm.</summary>
    private readonly PasswordHasher<AccountRecord> passwordHasher = new();

    /// <summary>Creates a password account and opens a session for it.</summary>
    /// <param name="request">The registration body.</param>
    /// <param name="sessions">Session service.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>
    /// The signed-in account and no errors, or no account and the messages of each refused field, keyed by
    /// <c>accountName</c>, <c>email</c> and <c>password</c>.
    /// </returns>
    public async ValueTask<(AuthenticatedAccount? Authentication, Dictionary<string, string[]> Errors)> RegisterAsync(
        RegisterAccountRequest request,
        SessionService sessions,
        CancellationToken cancellationToken)
    {
        Dictionary<string, string[]> errors = ValidateRegistration(request, out string accountName,
            out string email, out string normalizedEmail);
        if (errors.Count != 0)
        {
            return (null, errors);
        }

        AccountRecord provisional = new(
            Guid.NewGuid(),
            accountName,
            AccountNamePolicy.NormalizeForLookup(accountName),
            email,
            normalizedEmail,
            null,
            string.Empty,
            timeProvider.GetUtcNow());

        string passwordHash = passwordHasher.HashPassword(provisional, request.Password!);
        AccountRecord account = provisional with { PasswordHash = passwordHash };
        CreateAccountResult result = await store.CreateAsync(account, cancellationToken);

        if (result.Status is CreateAccountStatus.AccountNameUnavailable)
        {
            return (null, new Dictionary<string, string[]> { ["accountName"] = ["That account name is unavailable."] });
        }

        if (result.Status is CreateAccountStatus.EmailUnavailable)
        {
            return (null, new Dictionary<string, string[]> { ["email"] = ["That email address is already registered."] });
        }

        AuthenticatedAccount authentication = await sessions.CreateAsync(account, cancellationToken);
        return (authentication, errors);
    }

    /// <summary>Signs in with email address and password.</summary>
    /// <remarks>
    /// An unknown address costs one password verification against a private dummy hash, so the response time does not
    /// reveal whether an address is registered.
    /// </remarks>
    /// <param name="request">The login body.</param>
    /// <param name="sessions">Session service.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The signed-in account, or <see langword="null"/> when the credentials are refused.</returns>
    public async ValueTask<AuthenticatedAccount?> LoginAsync(
        LoginAccountRequest request,
        SessionService sessions,
        CancellationToken cancellationToken)
    {
        if (!EmailAddressPolicy.TryNormalize(request.Email, out _, out string normalizedEmail, out _) ||
            request.Password is null || request.Password.Length > PasswordPolicy.MaximumLength)
        {
            return null;
        }

        AccountRecord? account = await store.FindByEmailAsync(normalizedEmail, cancellationToken);
        if (account is null || account.PasswordHash is null)
        {
            // Reuse one private hash so an unknown email follows one expensive verification, like a bad password.
            _ = passwordHasher.VerifyHashedPassword(DummyAccount, DummyPasswordHash, request.Password);
            return null;
        }

        PasswordVerificationResult verification =
            passwordHasher.VerifyHashedPassword(account, account.PasswordHash, request.Password);
        if (verification is PasswordVerificationResult.Failed)
        {
            return null;
        }

        return await sessions.CreateAsync(account, cancellationToken);
    }

    /// <summary>Signs in with a Google identity, creating the account on first use.</summary>
    /// <remarks>
    /// An identity that is already linked signs in to its account. A new identity creates an account under the
    /// requested name. A new identity whose email address belongs to an existing account is refused: password
    /// registrations do not verify the address, so linking by address could hand an account to someone else.
    /// </remarks>
    /// <param name="providerSubject">Subject identifier Google issued for the identity.</param>
    /// <param name="providerEmail">Email address Google reported for the identity.</param>
    /// <param name="requestedAccountName">Account name to create for a new identity; may be <see langword="null"/>.</param>
    /// <param name="sessions">Session service.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The signed-in account, or no account and the reason.</returns>
    public async ValueTask<(AuthenticatedAccount? Authentication, GoogleAccountFailure Failure)>
        AuthenticateGoogleAsync(
            string? providerSubject,
            string? providerEmail,
            string? requestedAccountName,
            SessionService sessions,
            CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(providerSubject) ||
            !EmailAddressPolicy.TryNormalize(providerEmail, out string email, out string normalizedEmail, out _))
        {
            return (null, GoogleAccountFailure.ProviderRejected);
        }

        AccountRecord? knownGoogleAccount =
            await store.FindByGoogleSubjectAsync(providerSubject, cancellationToken);
        if (knownGoogleAccount is not null)
        {
            return (await sessions.CreateAsync(knownGoogleAccount, cancellationToken), GoogleAccountFailure.None);
        }

        AccountRecord? existing = await store.FindByEmailAsync(normalizedEmail, cancellationToken);
        if (existing is not null)
        {
            // Password registrations do not verify ownership of the supplied email address yet. Automatically
            // linking a verified Google identity by email would therefore let two unrelated people share an
            // account (and any already-issued sessions) when one of them registered the other's address.
            return (null, GoogleAccountFailure.ProviderRejected);
        }

        if (requestedAccountName is null)
        {
            return (null, GoogleAccountFailure.AccountNameRequired);
        }

        if (!AccountNamePolicy.TryNormalize(requestedAccountName, out string accountName, out _))
        {
            return (null, GoogleAccountFailure.InvalidAccountName);
        }

        AccountRecord account = new(
            Guid.NewGuid(),
            accountName,
            AccountNamePolicy.NormalizeForLookup(accountName),
            email,
            normalizedEmail,
            providerSubject,
            null,
            timeProvider.GetUtcNow());
        CreateAccountResult result = await store.CreateAsync(account, cancellationToken);

        if (result.Status is CreateAccountStatus.AccountNameUnavailable)
        {
            return (null, GoogleAccountFailure.AccountNameUnavailable);
        }

        if (result.Status is CreateAccountStatus.EmailUnavailable)
        {
            // Any different identity can win the email race, including an unverified password registration.
            return (null, GoogleAccountFailure.ProviderRejected);
        }

        if (result.Status is CreateAccountStatus.GoogleSubjectUnavailable)
        {
            AccountRecord? concurrent = await store.FindByGoogleSubjectAsync(providerSubject, cancellationToken);
            return concurrent is null
                ? (null, GoogleAccountFailure.ProviderRejected)
                : (await sessions.CreateAsync(concurrent, cancellationToken), GoogleAccountFailure.None);
        }

        return (await sessions.CreateAsync(account, cancellationToken), GoogleAccountFailure.None);
    }

    /// <summary>Validates every field of a registration and collects the messages of the refused ones.</summary>
    /// <param name="request">The registration body.</param>
    /// <param name="accountName">The canonical account name.</param>
    /// <param name="email">The email address as entered, trimmed.</param>
    /// <param name="normalizedEmail">The email address in its lookup form.</param>
    /// <returns>Messages keyed by field name; empty when the registration is valid.</returns>
    private static Dictionary<string, string[]> ValidateRegistration(
        RegisterAccountRequest request,
        out string accountName,
        out string email,
        out string normalizedEmail)
    {
        Dictionary<string, string[]> errors = [];

        if (!AccountNamePolicy.TryNormalize(request.AccountName, out accountName, out string accountNameError))
        {
            errors["accountName"] = [accountNameError];
        }

        if (!EmailAddressPolicy.TryNormalize(request.Email, out email, out normalizedEmail, out string emailError))
        {
            errors["email"] = [emailError];
        }

        if (!PasswordPolicy.TryValidate(request.Password, out string passwordError))
        {
            errors["password"] = [passwordError];
        }

        return errors;
    }
}

/// <summary>Reason a sign-in with Google did not produce a session.</summary>
internal enum GoogleAccountFailure
{
    /// <summary>The sign-in succeeded.</summary>
    None,
    /// <summary>
    /// The identity cannot be used: Google reported no usable subject or address, or the address belongs to another
    /// account.
    /// </summary>
    ProviderRejected,
    /// <summary>The identity is new and no account name was supplied.</summary>
    AccountNameRequired,
    /// <summary>The supplied account name breaks <see cref="AccountNamePolicy"/>.</summary>
    InvalidAccountName,
    /// <summary>The supplied account name is taken.</summary>
    AccountNameUnavailable
}
