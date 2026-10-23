// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Npgsql;

namespace Progmasoft.OAuth.Storage;

/// <summary>The tables of <see cref="OAuthDbContext"/> and the steps that bring a database to them.</summary>
/// <remarks>
/// <para>
/// The same numbered steps as the account tables, in a version table of their own: a database records the steps it
/// has taken in <c>oauth_schema_versions</c>, and <see cref="ApplyAsync"/> takes the missing ones in one
/// transaction. A step is never edited after it has been released.
/// </para>
/// <para>
/// Step 1 is the script Entity Framework generates for <see cref="OAuthDbContext"/>, so that the tables are exactly
/// what OpenIddict's stores read and write; a test compares the two. The steps run after the account steps, since
/// an application owner refers to an account.
/// </para>
/// </remarks>
internal static class OAuthSchema
{
    /// <summary>Key of the advisory lock that lets one process at a time change these tables.</summary>
    private const long MigrationLockKey = 0x50726F4F41757468;

    /// <summary>The statements Entity Framework generates for the model, as step 1 holds them.</summary>
    internal const string ModelScript =
        """
        CREATE TABLE oauth_applications (
            "Id" text NOT NULL,
            "ApplicationType" character varying(50),
            "ClientId" character varying(100),
            "ClientSecret" text,
            "ClientType" character varying(50),
            "ConcurrencyToken" character varying(50),
            "ConsentType" character varying(50),
            "DisplayName" text,
            "DisplayNames" text,
            "JsonWebKeySet" text,
            "Permissions" text,
            "PostLogoutRedirectUris" text,
            "Properties" text,
            "RedirectUris" text,
            "Requirements" text,
            "Settings" text,
            CONSTRAINT "PK_oauth_applications" PRIMARY KEY ("Id")
        );

        CREATE TABLE oauth_scopes (
            "Id" text NOT NULL,
            "ConcurrencyToken" character varying(50),
            "Description" text,
            "Descriptions" text,
            "DisplayName" text,
            "DisplayNames" text,
            "Name" character varying(200),
            "Properties" text,
            "Resources" text,
            CONSTRAINT "PK_oauth_scopes" PRIMARY KEY ("Id")
        );

        CREATE TABLE oauth_application_owners (
            "ApplicationId" text NOT NULL,
            "AccountId" uuid NOT NULL,
            "CreatedAt" timestamp with time zone NOT NULL,
            CONSTRAINT "PK_oauth_application_owners" PRIMARY KEY ("ApplicationId"),
            CONSTRAINT "FK_oauth_application_owners_oauth_applications_ApplicationId" FOREIGN KEY ("ApplicationId") REFERENCES oauth_applications ("Id") ON DELETE CASCADE
        );

        CREATE TABLE oauth_authorizations (
            "Id" text NOT NULL,
            "ApplicationId" text,
            "ConcurrencyToken" character varying(50),
            "CreationDate" timestamp with time zone,
            "Properties" text,
            "Scopes" text,
            "Status" character varying(50),
            "Subject" character varying(400),
            "Type" character varying(50),
            CONSTRAINT "PK_oauth_authorizations" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_oauth_authorizations_oauth_applications_ApplicationId" FOREIGN KEY ("ApplicationId") REFERENCES oauth_applications ("Id")
        );

        CREATE TABLE oauth_tokens (
            "Id" text NOT NULL,
            "ApplicationId" text,
            "AuthorizationId" text,
            "ConcurrencyToken" character varying(50),
            "CreationDate" timestamp with time zone,
            "ExpirationDate" timestamp with time zone,
            "Payload" text,
            "Properties" text,
            "RedemptionDate" timestamp with time zone,
            "ReferenceId" character varying(100),
            "Status" character varying(50),
            "Subject" character varying(400),
            "Type" character varying(150),
            CONSTRAINT "PK_oauth_tokens" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_oauth_tokens_oauth_applications_ApplicationId" FOREIGN KEY ("ApplicationId") REFERENCES oauth_applications ("Id"),
            CONSTRAINT "FK_oauth_tokens_oauth_authorizations_AuthorizationId" FOREIGN KEY ("AuthorizationId") REFERENCES oauth_authorizations ("Id")
        );

        CREATE INDEX "IX_oauth_application_owners_AccountId" ON oauth_application_owners ("AccountId");

        CREATE UNIQUE INDEX "IX_oauth_applications_ClientId" ON oauth_applications ("ClientId");

        CREATE INDEX "IX_oauth_authorizations_ApplicationId_Status_Subject_Type" ON oauth_authorizations ("ApplicationId", "Status", "Subject", "Type");

        CREATE UNIQUE INDEX "IX_oauth_scopes_Name" ON oauth_scopes ("Name");

        CREATE INDEX "IX_oauth_tokens_ApplicationId_Status_Subject_Type" ON oauth_tokens ("ApplicationId", "Status", "Subject", "Type");

        CREATE INDEX "IX_oauth_tokens_AuthorizationId" ON oauth_tokens ("AuthorizationId");

        CREATE UNIQUE INDEX "IX_oauth_tokens_ReferenceId" ON oauth_tokens ("ReferenceId");
        """;

    /// <summary>The steps, in order. The version of a step is its position, counted from one.</summary>
    private static readonly string[] Steps =
    [
        // 1: OpenIddict's applications, authorizations, scopes and tokens, and the owners of applications. Deleting
        // an account deletes its ownership rows; the applications themselves are deleted through the portal.
        ModelScript + """

        ALTER TABLE oauth_application_owners
            ADD CONSTRAINT oauth_application_owners_account_fk
            FOREIGN KEY ("AccountId") REFERENCES accounts (id) ON DELETE CASCADE;
        """
    ];

    /// <summary>The version a database has after every step.</summary>
    public static int CurrentVersion => Steps.Length;

    /// <summary>Takes the steps a database has not taken yet.</summary>
    /// <remarks>
    /// Processes that start together wait for one another on an advisory lock, so each step is taken once. A
    /// database that is newer than this program is refused.
    /// </remarks>
    /// <param name="dataSource">Connections to the database.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The number of steps that were taken; zero when the database was current.</returns>
    /// <exception cref="InvalidOperationException">The database has taken steps this program does not know.</exception>
    public static async Task<int> ApplyAsync(NpgsqlDataSource dataSource, CancellationToken cancellationToken)
    {
        await using NpgsqlConnection connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using NpgsqlTransaction transaction = await connection.BeginTransactionAsync(cancellationToken);

        await ExecuteAsync(connection, transaction, $"SELECT pg_advisory_xact_lock({MigrationLockKey})", cancellationToken);
        await ExecuteAsync(
            connection,
            transaction,
            """
            CREATE TABLE IF NOT EXISTS oauth_schema_versions (
                version    integer     PRIMARY KEY,
                applied_at timestamptz NOT NULL DEFAULT now()
            )
            """,
            cancellationToken);

        int version;
        await using (NpgsqlCommand read = new(
            "SELECT coalesce(max(version), 0) FROM oauth_schema_versions", connection, transaction))
        {
            version = (int)(await read.ExecuteScalarAsync(cancellationToken))!;
        }

        if (version > Steps.Length)
        {
            throw new InvalidOperationException(
                $"The OAuth tables are at schema version {version}, and this program knows version {Steps.Length}. " +
                "Run the release that created them, or a newer one.");
        }

        int taken = 0;
        for (int step = version; step < Steps.Length; step++)
        {
            await ExecuteAsync(connection, transaction, Steps[step], cancellationToken);
            await using NpgsqlCommand record = new(
                "INSERT INTO oauth_schema_versions (version) VALUES ($1)", connection, transaction);
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
