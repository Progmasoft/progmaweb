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

