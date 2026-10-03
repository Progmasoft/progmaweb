// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Security.Cryptography;
using Microsoft.Extensions.Options;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Settings of account sessions, bound from the <c>AccountSessions</c> configuration section.</summary>
internal sealed class AccountSessionOptions
{
    /// <summary>Name of the configuration section.</summary>
    public const string SectionName = "AccountSessions";
    /// <summary>Hours a session stays valid. Values outside 1 to 168 are clamped to that range.</summary>
    public int LifetimeHours { get; init; } = 12;
    /// <summary>Name of the session cookie. The <c>__Host-</c> prefix binds it to this host over HTTPS.</summary>
    public string CookieName { get; init; } = "__Host-ProgmasoftSession";
}

/// <summary>Opens, checks and revokes account sessions.</summary>
/// <remarks>
/// A session is a random 256-bit token that only the browser holds. The store keeps its SHA-256 digest, so a copy
/// of the store does not reveal a usable token.
/// </remarks>
/// <param name="store">Store that keeps the session digests.</param>
/// <param name="timeProvider">Clock used for creation and expiry.</param>
/// <param name="options">Session settings.</param>
internal sealed class SessionService(
    IAccountStore store,
    TimeProvider timeProvider,
    IOptions<AccountSessionOptions> options)
{
    /// <summary>The session settings in effect.</summary>
    private readonly AccountSessionOptions settings = options.Value;

    /// <summary>Opens a session for an account.</summary>
    /// <param name="account">The account that signed in.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The account with the new session token and its expiry.</returns>
    public async ValueTask<AuthenticatedAccount> CreateAsync(AccountRecord account, CancellationToken cancellationToken)
    {
        byte[] tokenBytes = RandomNumberGenerator.GetBytes(32);
        string token = Convert.ToBase64String(tokenBytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
        byte[] digest = SHA256.HashData(System.Text.Encoding.ASCII.GetBytes(token));
        DateTimeOffset createdAt = timeProvider.GetUtcNow();
        DateTimeOffset expiresAt = createdAt.AddHours(Math.Clamp(settings.LifetimeHours, 1, 168));

        await store.StoreSessionAsync(new SessionRecord(digest, account.Id, createdAt, expiresAt), cancellationToken);
        return new AuthenticatedAccount(account, token, expiresAt);
    }

    /// <summary>Resolves a session token to its account.</summary>
    /// <param name="token">The token from the session cookie.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>
    /// The account, or <see langword="null"/> when the token is malformed, unknown or expired. An expired session is
    /// revoked on the way.
    /// </returns>
    public async ValueTask<AccountRecord?> AuthenticateAsync(string? token, CancellationToken cancellationToken)
    {
        if (!TryDigest(token, out byte[] digest))
        {
            return null;
        }

        SessionRecord? session = await store.FindSessionAsync(digest, cancellationToken);
        if (session is null)
        {
            return null;
        }

        if (session.ExpiresAt <= timeProvider.GetUtcNow())
        {
            await store.RevokeSessionAsync(digest, cancellationToken);
            return null;
        }

        return await store.FindByIdAsync(session.AccountId, cancellationToken);
    }

    /// <summary>Ends the session of a token. A malformed or unknown token is ignored.</summary>
    /// <param name="token">The token from the session cookie.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>A task that completes when the session is gone.</returns>
    public async ValueTask RevokeAsync(string? token, CancellationToken cancellationToken)
    {
        if (TryDigest(token, out byte[] digest))
        {
            await store.RevokeSessionAsync(digest, cancellationToken);
        }
    }

    /// <summary>Creates the attributes of the session cookie.</summary>
    /// <param name="expiresAt">Moment the session expires; the cookie expires with it.</param>
    /// <returns>Options for a secure, HTTP-only, same-site cookie on the root path.</returns>
    public static CookieOptions CreateCookieOptions(DateTimeOffset expiresAt) => new()
    {
        Expires = expiresAt,
        HttpOnly = true,
        IsEssential = true,
        Path = "/",
        SameSite = SameSiteMode.Lax,
        Secure = true
    };

    /// <summary>Name of the session cookie.</summary>
    public string CookieName => settings.CookieName;

    /// <summary>Computes the digest of a token that has the shape of a session token.</summary>
    /// <param name="token">The candidate token.</param>
    /// <param name="digest">The SHA-256 digest; empty when the token is refused.</param>
    /// <returns><see langword="true"/> when the token has a plausible length and alphabet.</returns>
    private static bool TryDigest(string? token, out byte[] digest)
    {
        digest = [];
        if (token is null || token.Length is < 40 or > 64 || token.Any(character =>
                !(char.IsAsciiLetterOrDigit(character) || character is '-' or '_')))
        {
            return false;
        }

        digest = SHA256.HashData(System.Text.Encoding.ASCII.GetBytes(token));
        return true;
    }
}
