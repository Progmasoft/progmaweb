// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Npgsql;

namespace Progmasoft.Progmaweb.Api.ViGet;

/// <summary>The tables of <see cref="PostgresTazelPluginCatalog"/> and the steps that bring a database to them.</summary>
/// <remarks>
/// The same numbered steps as the account tables, in a version table of their own, <c>viget_schema_versions</c>.
/// A step is never edited after it has been released.
/// </remarks>
internal static class ViGetSchema
{
    /// <summary>Key of the advisory lock that lets one process at a time change these tables.</summary>
    private const long MigrationLockKey = 0x5669476574;

    private static readonly string[] Steps =
    [
        // 1: Tazel plugins and their versions.
        //
        // A plugin is named by its publisher and its name as they are spelled; the unique index on their upper
        // case keeps two plugins from differing only in letter case. A version is never removed, only yanked.
        """
        CREATE TABLE viget_tazel_plugins (
            publisher   text        NOT NULL,
            name        text        NOT NULL,
            description text,
            authors     text[]      NOT NULL,
            license     text,
            homepage    text,
            repository  text,
            updated_at  timestamptz NOT NULL,
            PRIMARY KEY (publisher, name)
        );

        CREATE UNIQUE INDEX viget_tazel_plugins_folded_key ON viget_tazel_plugins (upper(publisher), upper(name));

        CREATE TABLE viget_tazel_plugin_versions (
            publisher    text        NOT NULL,
            name         text        NOT NULL,
            version      text        NOT NULL,
            sha256       text        NOT NULL,
            api_version  integer     NOT NULL,
            size         bigint      NOT NULL,
            published_at timestamptz NOT NULL,
            yanked       boolean     NOT NULL DEFAULT false,
            PRIMARY KEY (publisher, name, version),
            FOREIGN KEY (publisher, name) REFERENCES viget_tazel_plugins (publisher, name)
        );
        """
    ];

    /// <summary>The version a database has after every step.</summary>
    public static int CurrentVersion => Steps.Length;

    /// <summary>Takes the steps a database has not taken yet, in one transaction.</summary>
    /// <returns>The number of steps that were taken.</returns>
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
            CREATE TABLE IF NOT EXISTS viget_schema_versions (
                version    integer     PRIMARY KEY,
                applied_at timestamptz NOT NULL DEFAULT now()
            )
            """,
            cancellationToken);

        int version;
        await using (NpgsqlCommand read = new(
            "SELECT coalesce(max(version), 0) FROM viget_schema_versions", connection, transaction))
        {
            version = (int)(await read.ExecuteScalarAsync(cancellationToken))!;
        }

        if (version > Steps.Length)
        {
            throw new InvalidOperationException(
                $"The ViGet tables are at schema version {version}, and this program knows version {Steps.Length}.");
        }

        int taken = 0;
        for (int step = version; step < Steps.Length; step++)
        {
            await ExecuteAsync(connection, transaction, Steps[step], cancellationToken);
            await using NpgsqlCommand record = new(
                "INSERT INTO viget_schema_versions (version) VALUES ($1)", connection, transaction);
            record.Parameters.AddWithValue(step + 1);
            await record.ExecuteNonQueryAsync(cancellationToken);
            taken++;
        }

        await transaction.CommitAsync(cancellationToken);
        return taken;
    }

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

/// <summary>The Tazel plugins of ViGet in PostgreSQL, beside the accounts.</summary>
/// <param name="dataSource">Connections to the database of the accounts.</param>
internal sealed class PostgresTazelPluginCatalog(NpgsqlDataSource dataSource) : ITazelPluginCatalog
{
    private const string PluginColumns = "publisher, name, description, authors, license, homepage, repository";

    /// <inheritdoc/>
    public async ValueTask<IReadOnlyList<TazelPlugin>> ListAsync(CancellationToken cancellationToken)
    {
        await using NpgsqlConnection connection = await dataSource.OpenConnectionAsync(cancellationToken);
        List<TazelPlugin> plugins = [];
        await using (NpgsqlCommand command = new(
            $"SELECT {PluginColumns} FROM viget_tazel_plugins ORDER BY publisher, name", connection))
        await using (NpgsqlDataReader reader = await command.ExecuteReaderAsync(cancellationToken))
        {
            while (await reader.ReadAsync(cancellationToken))
            {
                plugins.Add(ReadPlugin(reader, []));
            }
        }

        List<TazelPlugin> withVersions = [];
        foreach (TazelPlugin plugin in plugins)
        {
            withVersions.Add(plugin with
            {
                Versions = await VersionsAsync(connection, null, plugin.Publisher, plugin.Name, cancellationToken)
            });
        }

        return withVersions;
    }

    /// <inheritdoc/>
    public async ValueTask<TazelPlugin?> FindAsync(string publisher, string name, CancellationToken cancellationToken)
    {
        await using NpgsqlConnection connection = await dataSource.OpenConnectionAsync(cancellationToken);
        TazelPlugin? plugin;
        await using (NpgsqlCommand command = new(
            $"SELECT {PluginColumns} FROM viget_tazel_plugins WHERE publisher = $1 AND name = $2", connection))
        {
            command.Parameters.AddWithValue(publisher);
            command.Parameters.AddWithValue(name);
            await using NpgsqlDataReader reader = await command.ExecuteReaderAsync(cancellationToken);
            plugin = await reader.ReadAsync(cancellationToken) ? ReadPlugin(reader, []) : null;
        }

        return plugin is null
            ? null
            : plugin with { Versions = await VersionsAsync(connection, null, publisher, name, cancellationToken) };
    }

    /// <inheritdoc/>
    public async ValueTask<AddVersionResult> AddVersionAsync(
        TazelPluginDescriptor descriptor,
        string sha256,
        long size,
        DateTimeOffset publishedAt,
        CancellationToken cancellationToken)
    {
        await using NpgsqlConnection connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using NpgsqlTransaction transaction = await connection.BeginTransactionAsync(cancellationToken);
        await using (NpgsqlCommand taken = new(
            """
            SELECT count(*) FROM viget_tazel_plugins
            WHERE upper(publisher) = upper($1) AND upper(name) = upper($2) AND (publisher <> $1 OR name <> $2)
            """,
            connection,
            transaction))
        {
            taken.Parameters.AddWithValue(descriptor.Publisher);
            taken.Parameters.AddWithValue(descriptor.Name);
            if ((long)(await taken.ExecuteScalarAsync(cancellationToken))! > 0)
            {
                return AddVersionResult.NameTaken;
            }
        }

        await using (NpgsqlCommand plugin = new(
            $"""
            INSERT INTO viget_tazel_plugins ({PluginColumns}, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (publisher, name) DO UPDATE SET
                description = excluded.description,
                authors = excluded.authors,
                license = excluded.license,
                homepage = excluded.homepage,
                repository = excluded.repository,
                updated_at = excluded.updated_at
            """,
            connection,
            transaction))
        {
            plugin.Parameters.AddWithValue(descriptor.Publisher);
            plugin.Parameters.AddWithValue(descriptor.Name);
            plugin.Parameters.AddWithValue((object?)descriptor.Description ?? DBNull.Value);
            plugin.Parameters.AddWithValue(descriptor.Authors.ToArray());
            plugin.Parameters.AddWithValue((object?)descriptor.License ?? DBNull.Value);
            plugin.Parameters.AddWithValue((object?)descriptor.Homepage ?? DBNull.Value);
            plugin.Parameters.AddWithValue((object?)descriptor.Repository ?? DBNull.Value);
            plugin.Parameters.AddWithValue(publishedAt);
            await plugin.ExecuteNonQueryAsync(cancellationToken);
        }

        await using (NpgsqlCommand version = new(
            """
            INSERT INTO viget_tazel_plugin_versions (publisher, name, version, sha256, api_version, size, published_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (publisher, name, version) DO NOTHING
            """,
            connection,
            transaction))
        {
            version.Parameters.AddWithValue(descriptor.Publisher);
            version.Parameters.AddWithValue(descriptor.Name);
            version.Parameters.AddWithValue(descriptor.Version);
            version.Parameters.AddWithValue(sha256);
            version.Parameters.AddWithValue(descriptor.ApiVersion);
            version.Parameters.AddWithValue(size);
            version.Parameters.AddWithValue(publishedAt);
            if (await version.ExecuteNonQueryAsync(cancellationToken) == 0)
            {
                // The plugin row is left as it was: the transaction is rolled back with the refusal.
                return AddVersionResult.VersionExists;
            }
        }

        await transaction.CommitAsync(cancellationToken);
        return AddVersionResult.Added;
    }

    /// <inheritdoc/>
    public async ValueTask<bool> SetYankedAsync(
        string publisher,
        string name,
        string version,
        bool yanked,
        CancellationToken cancellationToken)
    {
        await using NpgsqlConnection connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using NpgsqlCommand command = new(
            """
            UPDATE viget_tazel_plugin_versions SET yanked = $4
            WHERE publisher = $1 AND name = $2 AND version = $3
            """,
            connection);
        command.Parameters.AddWithValue(publisher);
        command.Parameters.AddWithValue(name);
        command.Parameters.AddWithValue(version);
        command.Parameters.AddWithValue(yanked);
        return await command.ExecuteNonQueryAsync(cancellationToken) == 1;
    }

    private static TazelPlugin ReadPlugin(NpgsqlDataReader reader, IReadOnlyList<TazelPluginVersion> versions) => new(
        reader.GetString(0),
        reader.GetString(1),
        reader.IsDBNull(2) ? null : reader.GetString(2),
        reader.GetFieldValue<string[]>(3),
        reader.IsDBNull(4) ? null : reader.GetString(4),
        reader.IsDBNull(5) ? null : reader.GetString(5),
        reader.IsDBNull(6) ? null : reader.GetString(6),
        versions);

    private static async Task<IReadOnlyList<TazelPluginVersion>> VersionsAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction? transaction,
        string publisher,
        string name,
        CancellationToken cancellationToken)
    {
        await using NpgsqlCommand command = new(
            """
            SELECT version, sha256, api_version, size, published_at, yanked FROM viget_tazel_plugin_versions
            WHERE publisher = $1 AND name = $2 ORDER BY published_at DESC, version DESC
            """,
            connection,
            transaction);
        command.Parameters.AddWithValue(publisher);
        command.Parameters.AddWithValue(name);
        await using NpgsqlDataReader reader = await command.ExecuteReaderAsync(cancellationToken);
        List<TazelPluginVersion> versions = [];
        while (await reader.ReadAsync(cancellationToken))
        {
            versions.Add(new TazelPluginVersion(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetInt32(2),
                reader.GetInt64(3),
                reader.GetFieldValue<DateTimeOffset>(4),
                reader.GetBoolean(5)));
        }

        return versions;
    }
}
