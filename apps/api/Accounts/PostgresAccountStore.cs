// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Npgsql;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>An <see cref="IAccountStore"/> that keeps accounts and sessions in PostgreSQL.</summary>
/// <remarks>
/// <para>
/// The uniqueness rules are unique indexes of the <c>accounts</c> table, so two requests that race for one name,
/// address or Google identity are decided by the database: one row is stored and the other request is refused. A
/// session row refers to its account, and the database refuses a session of an account that does not exist.
/// </para>
/// <para>
/// PostgreSQL keeps a timestamp to the microsecond. A moment is cut to that precision before it is stored, and the
/// store returns what it stored, so a value read later equals the value returned when it was written.
/// </para>
/// </remarks>
/// <param name="dataSource">Connections to the database that holds the tables of <see cref="AccountSchema"/>.</param>
internal sealed class PostgresAccountStore(NpgsqlDataSource dataSource) : IAccountStore
{
    /// <summary>How often a creation is tried again when it was refused and no rule that refuses it is found.</summary>
    private const int CreateAttempts = 3;

    /// <summary>The columns of an account, in the order <see cref="ReadAccount"/> reads them.</summary>
    private const string AccountColumns =
        "id, account_name, normalized_account_name, email, normalized_email, google_subject, password_hash, created_at";

    /// <inheritdoc/>
    public async ValueTask<CreateAccountResult> CreateAsync(AccountRecord account, CancellationToken cancellationToken)
    {
        AccountRecord stored = account with { CreatedAt = ToStoredPrecision(account.CreatedAt) };

        for (int attempt = 0; attempt < CreateAttempts; attempt++)
        {
            // A row that breaks a unique index is skipped instead of raising an error, so that a taken name is an
            // ordinary answer and the transaction log holds no failed statement for it.
            await using (NpgsqlCommand insert = dataSource.CreateCommand(
                $"INSERT INTO accounts ({AccountColumns}) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING"))
            {
                insert.Parameters.AddWithValue(stored.Id);
                insert.Parameters.AddWithValue(stored.AccountName);
                insert.Parameters.AddWithValue(stored.NormalizedAccountName);
                insert.Parameters.AddWithValue(stored.Email);
                insert.Parameters.AddWithValue(stored.NormalizedEmail);
                insert.Parameters.AddWithValue(NullableText(stored.GoogleSubject));
                insert.Parameters.AddWithValue(NullableText(stored.PasswordHash));
                insert.Parameters.AddWithValue(stored.CreatedAt);
                if (await insert.ExecuteNonQueryAsync(cancellationToken) == 1)
                {
                    return CreateAccountResult.Created(stored);
                }
            }

            // The rules are reported in one fixed order, the order of the in-memory store, whichever index the
            // database happened to check first.
            await using NpgsqlCommand taken = dataSource.CreateCommand(
                """
                SELECT EXISTS (SELECT 1 FROM accounts WHERE google_subject = $1),
                       EXISTS (SELECT 1 FROM accounts WHERE normalized_account_name = $2),
                       EXISTS (SELECT 1 FROM accounts WHERE normalized_email = $3)
                """);
            taken.Parameters.AddWithValue(NullableText(stored.GoogleSubject));
            taken.Parameters.AddWithValue(stored.NormalizedAccountName);
            taken.Parameters.AddWithValue(stored.NormalizedEmail);
            await using NpgsqlDataReader reader = await taken.ExecuteReaderAsync(cancellationToken);
            await reader.ReadAsync(cancellationToken);
            if (reader.GetBoolean(0))
            {
                return CreateAccountResult.GoogleSubjectUnavailable();
            }

            if (reader.GetBoolean(1))
            {
                return CreateAccountResult.AccountNameUnavailable();
            }

            if (reader.GetBoolean(2))
            {
                return CreateAccountResult.EmailUnavailable();
            }
        }

        // Accounts are never deleted, so a refused row always has a row that refuses it. Reaching this line means
        // the identifier itself was taken, which a random identifier does not do.
        throw new InvalidOperationException("The account store refused an account without a rule that explains it.");
    }

    /// <inheritdoc/>
    public ValueTask<AccountRecord?> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken) =>
        FindAccountAsync("normalized_email", normalizedEmail, cancellationToken);

    /// <inheritdoc/>
    public ValueTask<AccountRecord?> FindByGoogleSubjectAsync(
        string googleSubject,
        CancellationToken cancellationToken) =>
        FindAccountAsync("google_subject", googleSubject, cancellationToken);

    /// <inheritdoc/>
    public ValueTask<AccountRecord?> FindByIdAsync(Guid id, CancellationToken cancellationToken) =>
        FindAccountAsync("id", id, cancellationToken);

    /// <inheritdoc/>
    public async ValueTask StoreSessionAsync(SessionRecord session, CancellationToken cancellationToken)
    {
        await using NpgsqlCommand command = dataSource.CreateCommand(
            """
            INSERT INTO sessions (token_digest, account_id, created_at, expires_at) VALUES ($1, $2, $3, $4)
            ON CONFLICT (token_digest) DO UPDATE
                SET account_id = EXCLUDED.account_id, created_at = EXCLUDED.created_at, expires_at = EXCLUDED.expires_at
            """);
        command.Parameters.AddWithValue(session.TokenDigest);
        command.Parameters.AddWithValue(session.AccountId);
        command.Parameters.AddWithValue(ToStoredPrecision(session.CreatedAt));
        command.Parameters.AddWithValue(ToStoredPrecision(session.ExpiresAt));
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async ValueTask<SessionRecord?> FindSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken)
    {
        await using NpgsqlCommand command = dataSource.CreateCommand(
            "SELECT token_digest, account_id, created_at, expires_at FROM sessions WHERE token_digest = $1");
        command.Parameters.AddWithValue(tokenDigest);
        await using NpgsqlDataReader reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        return new SessionRecord(
            reader.GetFieldValue<byte[]>(0),
            reader.GetGuid(1),
            reader.GetFieldValue<DateTimeOffset>(2),
            reader.GetFieldValue<DateTimeOffset>(3));
    }

    /// <inheritdoc/>
    public async ValueTask RevokeSessionAsync(byte[] tokenDigest, CancellationToken cancellationToken)
    {
        await using NpgsqlCommand command = dataSource.CreateCommand("DELETE FROM sessions WHERE token_digest = $1");
        command.Parameters.AddWithValue(tokenDigest);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async ValueTask<int> RemoveExpiredSessionsAsync(DateTimeOffset now, CancellationToken cancellationToken)
    {
        await using NpgsqlCommand command = dataSource.CreateCommand("DELETE FROM sessions WHERE expires_at <= $1");
        command.Parameters.AddWithValue(now.ToUniversalTime());
        return await command.ExecuteNonQueryAsync(cancellationToken);
    }

    /// <summary>Finds the one account whose column has a value.</summary>
    /// <typeparam name="TKey">Type of the value.</typeparam>
    /// <param name="column">Name of a column with a unique index. It is written into the statement.</param>
    /// <param name="value">The value to look for.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The account, or <see langword="null"/> when no account has the value.</returns>
    private async ValueTask<AccountRecord?> FindAccountAsync<TKey>(
        string column,
        TKey value,
        CancellationToken cancellationToken)
        where TKey : notnull
    {
        await using NpgsqlCommand command = dataSource.CreateCommand(
            $"SELECT {AccountColumns} FROM accounts WHERE {column} = $1");
        command.Parameters.AddWithValue(value);
        await using NpgsqlDataReader reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? ReadAccount(reader) : null;
    }

    /// <summary>Reads the account of the current row; the columns are <see cref="AccountColumns"/>.</summary>
    /// <param name="reader">A reader positioned on a row.</param>
    /// <returns>The account of the row.</returns>
    private static AccountRecord ReadAccount(NpgsqlDataReader reader) => new(
        reader.GetGuid(0),
        reader.GetString(1),
        reader.GetString(2),
        reader.GetString(3),
        reader.GetString(4),
        reader.IsDBNull(5) ? null : reader.GetString(5),
        reader.IsDBNull(6) ? null : reader.GetString(6),
        reader.GetFieldValue<DateTimeOffset>(7));

    /// <summary>Converts an optional text to a parameter value.</summary>
    /// <param name="value">The text, or <see langword="null"/>.</param>
    /// <returns>The text, or the database null.</returns>
    private static object NullableText(string? value) => value is null ? DBNull.Value : value;

    /// <summary>Cuts a moment to the microsecond PostgreSQL keeps, in UTC.</summary>
    /// <param name="moment">The moment to store.</param>
    /// <returns>The moment as the database will return it.</returns>
    internal static DateTimeOffset ToStoredPrecision(DateTimeOffset moment)
    {
        DateTimeOffset utc = moment.ToUniversalTime();
        return utc.AddTicks(-(utc.Ticks % (TimeSpan.TicksPerMillisecond / 1000)));
    }
}
