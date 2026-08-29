// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

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

