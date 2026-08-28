namespace Progmasoft.Progmaweb.Api.Accounts;

internal interface IAccountStore
{
    ValueTask<CreateAccountResult> CreateAsync(AccountRecord account, CancellationToken cancellationToken);
    ValueTask<AccountRecord?> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken);
    ValueTask<AccountRecord?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    ValueTask StoreSessionAsync(SessionRecord session, CancellationToken cancellationToken);
    ValueTask<SessionRecord?> FindSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken);
    ValueTask RevokeSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken);
}

