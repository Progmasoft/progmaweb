using System.Security.Cryptography;
using Microsoft.Extensions.Options;

namespace Progmasoft.Progmaweb.Api.Accounts;

internal sealed class AccountSessionOptions
{
    public const string SectionName = "AccountSessions";
    public int LifetimeHours { get; init; } = 12;
    public string CookieName { get; init; } = "__Host-ProgmasoftSession";
}

internal sealed class SessionService(
    IAccountStore store,
    TimeProvider timeProvider,
    IOptions<AccountSessionOptions> options)
{
    private readonly AccountSessionOptions settings = options.Value;

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

    public async ValueTask RevokeAsync(string? token, CancellationToken cancellationToken)
    {
        if (TryDigest(token, out byte[] digest))
        {
            await store.RevokeSessionAsync(digest, cancellationToken);
        }
    }

    public static CookieOptions CreateCookieOptions(DateTimeOffset expiresAt) => new()
    {
        Expires = expiresAt,
        HttpOnly = true,
        IsEssential = true,
        Path = "/",
        SameSite = SameSiteMode.Lax,
        Secure = true
    };

    public string CookieName => settings.CookieName;

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
