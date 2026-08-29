// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

using Microsoft.AspNetCore.Identity;

namespace Progmasoft.Progmaweb.Api.Accounts;

internal sealed class AccountService(
    IAccountStore store,
    TimeProvider timeProvider)
{
    private readonly PasswordHasher<AccountRecord> passwordHasher = new();

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

    public async ValueTask<AuthenticatedAccount?> LoginAsync(
        LoginAccountRequest request,
        SessionService sessions,
        CancellationToken cancellationToken)
    {
        if (!EmailAddressPolicy.TryNormalize(request.Email, out _, out string normalizedEmail, out _) ||
            request.Password is null)
        {
            return null;
        }

        AccountRecord? account = await store.FindByEmailAsync(normalizedEmail, cancellationToken);
        if (account is null)
        {
            // A fixed dummy record keeps the missing-account path on the same password-hashing primitive.
            AccountRecord dummyBase = new(Guid.Empty, "Missing00", "MISSING00", "missing@example.invalid",
                "MISSING@EXAMPLE.INVALID", string.Empty, DateTimeOffset.UnixEpoch);
            AccountRecord dummy = dummyBase with
            {
                PasswordHash = passwordHasher.HashPassword(dummyBase, "not-the-provided-password")
            };
            _ = passwordHasher.VerifyHashedPassword(dummy, dummy.PasswordHash, request.Password);
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
