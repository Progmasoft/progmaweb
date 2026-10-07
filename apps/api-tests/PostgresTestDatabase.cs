// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Npgsql;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>A schema of its own in the PostgreSQL database of the test run, removed when the test ends.</summary>
/// <remarks>
/// <para>
/// The tests that need PostgreSQL read its connection string from the environment variable
/// <see cref="VariableName"/>. The user it names must be allowed to create schemas in its database. Without the
/// variable those tests are skipped, and <see cref="PostgresConfigurationTests"/> fails the run where skipping
/// them would hide a gap: in continuous integration.
/// </para>
/// <para>
/// Each test works in a schema with a random name, selected through the search path of its connection string, so
/// tests neither see nor wait for one another and nothing is left behind.
/// </para>
/// </remarks>
internal sealed class PostgresTestDatabase : IAsyncDisposable
{
    /// <summary>Environment variable that holds the connection string of the test database.</summary>
    public const string VariableName = "PROGMAWEB_TEST_POSTGRES";

    private readonly string administrativeConnectionString;
    private readonly string schema;

    private PostgresTestDatabase(string administrativeConnectionString, string schema)
    {
        this.administrativeConnectionString = administrativeConnectionString;
        this.schema = schema;
        ConnectionString = new NpgsqlConnectionStringBuilder(administrativeConnectionString) { SearchPath = schema }
            .ConnectionString;
    }

    /// <summary>The connection string of the test database, or <see langword="null"/> when none is configured.</summary>
    public static string? ConfiguredConnectionString
    {
        get
        {
            string? value = Environment.GetEnvironmentVariable(VariableName);
            return string.IsNullOrWhiteSpace(value) ? null : value;
        }
    }

    /// <summary>A connection string whose statements run in the schema of this test.</summary>
    public string ConnectionString { get; }

    /// <summary>Creates the schema of a test; skips the test when no database is configured.</summary>
    public static async Task<PostgresTestDatabase> CreateAsync()
    {
        string? configured = ConfiguredConnectionString;
        Assert.SkipUnless(configured is not null, $"{VariableName} names no PostgreSQL database.");

        string schema = "test_" + Guid.NewGuid().ToString("N");
        await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(configured!);
        await using NpgsqlCommand command = dataSource.CreateCommand($"CREATE SCHEMA {schema}");
        await command.ExecuteNonQueryAsync(TestContext.Current.CancellationToken);
        return new PostgresTestDatabase(configured!, schema);
    }

    /// <summary>Opens connections to the schema of this test. The caller disposes the data source.</summary>
    public NpgsqlDataSource OpenDataSource() => NpgsqlDataSource.Create(ConnectionString);

    public async ValueTask DisposeAsync()
    {
        // Pooled connections of disposed data sources are closed, so nothing holds the schema.
        await using NpgsqlDataSource dataSource = NpgsqlDataSource.Create(administrativeConnectionString);
        await using NpgsqlCommand command = dataSource.CreateCommand($"DROP SCHEMA IF EXISTS {schema} CASCADE");
        await command.ExecuteNonQueryAsync(CancellationToken.None);
    }
}

public sealed class PostgresConfigurationTests
{
    [Fact]
    public void ContinuousIntegrationRunsTheDatabaseTests()
    {
        // GitHub Actions sets CI. A run there without the database would report the PostgreSQL tests as skipped and
        // the run as passed, which is how an untested store would be merged.
        if (string.Equals(Environment.GetEnvironmentVariable("CI"), "true", StringComparison.OrdinalIgnoreCase))
        {
            Assert.NotNull(PostgresTestDatabase.ConfiguredConnectionString);
        }
    }
}
