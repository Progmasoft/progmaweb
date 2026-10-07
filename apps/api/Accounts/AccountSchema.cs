// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Npgsql;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>The tables of <see cref="PostgresAccountStore"/> and the steps that bring a database to them.</summary>
/// <remarks>
/// <para>
/// The schema is a list of numbered steps. A database records the steps it has taken in
/// <c>account_schema_versions</c>, and <see cref="ApplyAsync"/> takes the ones that are missing, in order, in one
/// transaction. A step is never edited after it has been released; a change to the tables is a new step.
/// </para>
/// <para>
/// The tables are created in the schema the connection selects, without a schema name in the statements, so the
/// connection string decides where they live.
/// </para>
/// </remarks>
internal static class AccountSchema
{
    /// <summary>Key of the advisory lock that lets one process at a time change the schema.</summary>
    /// <remarks>The value is arbitrary and fixed; it only has to differ from the keys of other applications.</remarks>
    private const long MigrationLockKey = 0x50726F676D6157;

    /// <summary>The steps, in order. The version of a step is its position, counted from one.</summary>
    private static readonly string[] Steps =
    [
        // 1: accounts and sessions.
        //
        // The three uniqueness rules of the store are the unique constraints below. A unique constraint ignores
        // rows whose column is null, which is the rule for google_subject: many password accounts, each without a
        // Google identity. A session is removed with its account, and the index on expires_at is what the removal
        // of expired sessions scans.
        """
        CREATE TABLE accounts (
            id                      uuid        PRIMARY KEY,
            account_name            text        NOT NULL,
            normalized_account_name text        NOT NULL CONSTRAINT accounts_normalized_account_name_key UNIQUE,
            email                   text        NOT NULL,
            normalized_email        text        NOT NULL CONSTRAINT accounts_normalized_email_key UNIQUE,
            google_subject          text        CONSTRAINT accounts_google_subject_key UNIQUE,
            password_hash           text,
            created_at              timestamptz NOT NULL
        );

        CREATE TABLE sessions (
            token_digest bytea       PRIMARY KEY,
            account_id   uuid        NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
            created_at   timestamptz NOT NULL,
            expires_at   timestamptz NOT NULL
        );

        CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);
        CREATE INDEX sessions_account_id_idx ON sessions (account_id);
        """
    ];

    /// <summary>The version a database has after every step.</summary>
    public static int CurrentVersion => Steps.Length;

    /// <summary>Takes the steps a database has not taken yet.</summary>
    /// <remarks>
    /// Processes that start together wait for one another on an advisory lock, so each step is taken once. A
    /// database that is newer than this program is refused: its tables may no longer be what the store expects.
    /// </remarks>
    /// <param name="dataSource">Connections to the database.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The number of steps that were taken; zero when the database was current.</returns>
    /// <exception cref="InvalidOperationException">The database has taken steps this program does not know.</exception>
    public static async Task<int> ApplyAsync(NpgsqlDataSource dataSource, CancellationToken cancellationToken)
    {
        await using NpgsqlConnection connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using NpgsqlTransaction transaction = await connection.BeginTransactionAsync(cancellationToken);

        // The lock is released with the transaction, also when a step fails.
        await ExecuteAsync(connection, transaction, $"SELECT pg_advisory_xact_lock({MigrationLockKey})", cancellationToken);
        await ExecuteAsync(
            connection,
            transaction,
            """
            CREATE TABLE IF NOT EXISTS account_schema_versions (
                version    integer     PRIMARY KEY,
                applied_at timestamptz NOT NULL DEFAULT now()
            )
            """,
            cancellationToken);

        int version;
        await using (NpgsqlCommand read = new(
            "SELECT coalesce(max(version), 0) FROM account_schema_versions", connection, transaction))
        {
            version = (int)(await read.ExecuteScalarAsync(cancellationToken))!;
        }

        if (version > Steps.Length)
        {
            throw new InvalidOperationException(
                $"The account database is at schema version {version}, and this program knows version {Steps.Length}. " +
                "Run the release that created the database, or a newer one.");
        }

        int taken = 0;
        for (int step = version; step < Steps.Length; step++)
        {
            await ExecuteAsync(connection, transaction, Steps[step], cancellationToken);
            await using NpgsqlCommand record = new(
                "INSERT INTO account_schema_versions (version) VALUES ($1)", connection, transaction);
            record.Parameters.AddWithValue(step + 1);
            await record.ExecuteNonQueryAsync(cancellationToken);
            taken++;
        }

        await transaction.CommitAsync(cancellationToken);
        return taken;
    }

    /// <summary>Runs statements that return nothing.</summary>
    /// <param name="connection">The connection to run them on.</param>
    /// <param name="transaction">The transaction they belong to.</param>
    /// <param name="sql">The statements.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>A task that completes when the statements have run.</returns>
    private static async Task ExecuteAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction transaction,
        string sql,
        CancellationToken cancellationToken)
    {
        await using NpgsqlCommand command = new(sql, connection, transaction);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }
}
