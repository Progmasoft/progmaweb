// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Which <see cref="IAccountStore"/> a configuration selects.</summary>
internal enum AccountStoreKind
{
    /// <summary><see cref="InMemoryAccountStore"/>: nothing survives a restart.</summary>
    Memory,
    /// <summary><see cref="PostgresAccountStore"/>: accounts and sessions survive a restart.</summary>
    PostgreSql
}

/// <summary>Chooses the account store from the configuration and registers what belongs to it.</summary>
/// <remarks>
/// <para>
/// <c>ConnectionStrings:Accounts</c> names the PostgreSQL database. <c>Accounts:Store</c> may name the store
/// outright, as <c>PostgreSQL</c> or <c>Memory</c>. Without it, a connection string selects PostgreSQL.
/// </para>
/// <para>
/// A production service that is given neither does not start. Keeping accounts in memory there has to be asked for
/// with <c>Accounts:Store=Memory</c>, because a service that quietly forgets every account at each restart is the
/// failure this store exists to prevent. Outside production the default without a connection string is memory.
/// </para>
/// </remarks>
internal static class AccountStoreRegistration
{
    /// <summary>Writes the warning of <see cref="WarnThatAccountsAreInMemory"/>.</summary>
    private static readonly Action<ILogger, Exception?> InMemoryWarning = LoggerMessage.Define(
        LogLevel.Warning,
        new EventId(1, "AccountsInMemory"),
        "Accounts are kept in memory: every account and session is lost when this service stops.");

    /// <summary>Name of the connection string of the account database.</summary>
    public const string ConnectionStringName = "Accounts";

    /// <summary>Configuration key that names the store outright.</summary>
    public const string StoreKey = "Accounts:Store";

    /// <summary>Decides which store a configuration selects.</summary>
    /// <param name="configuration">The configuration of the service.</param>
    /// <param name="isProduction">Whether the service runs in the production environment.</param>
    /// <returns>The selected store.</returns>
    /// <exception cref="InvalidOperationException">
    /// The store is named with an unknown word, PostgreSQL is named without a connection string, memory is named
    /// with one, or a production service is given neither.
    /// </exception>
    public static AccountStoreKind Select(IConfiguration configuration, bool isProduction)
    {
        string? named = configuration[StoreKey];
        bool hasConnectionString = !string.IsNullOrWhiteSpace(configuration.GetConnectionString(ConnectionStringName));

        if (string.IsNullOrWhiteSpace(named))
        {
            if (hasConnectionString)
            {
                return AccountStoreKind.PostgreSql;
            }

            return isProduction
                ? throw new InvalidOperationException(
                    $"No account database is configured. Set ConnectionStrings:{ConnectionStringName} to the " +
                    $"PostgreSQL database of the accounts, or set {StoreKey}=Memory to accept that every account " +
                    "and session is lost when the service restarts.")
                : AccountStoreKind.Memory;
        }

        if (string.Equals(named, "PostgreSQL", StringComparison.OrdinalIgnoreCase))
        {
            return hasConnectionString
                ? AccountStoreKind.PostgreSql
                : throw new InvalidOperationException(
                    $"{StoreKey} is PostgreSQL, and ConnectionStrings:{ConnectionStringName} is not set.");
        }

        if (string.Equals(named, "Memory", StringComparison.OrdinalIgnoreCase))
        {
            // Both together would leave a configured database unused without anyone noticing.
            return hasConnectionString
                ? throw new InvalidOperationException(
                    $"{StoreKey} is Memory, and ConnectionStrings:{ConnectionStringName} is set. Remove one of them.")
                : AccountStoreKind.Memory;
        }

        throw new InvalidOperationException($"{StoreKey} is '{named}'. It must be PostgreSQL or Memory.");
    }

    /// <summary>Registers the selected store, and for PostgreSQL its schema step, health check and connections.</summary>
    /// <param name="services">The services of the application.</param>
    /// <param name="configuration">The configuration of the service.</param>
    /// <param name="isProduction">Whether the service runs in the production environment.</param>
    /// <returns>The selected store, so that the caller can report it.</returns>
    public static AccountStoreKind AddAccountStore(
        this IServiceCollection services,
        IConfiguration configuration,
        bool isProduction)
    {
        AccountStoreKind kind = Select(configuration, isProduction);
        IHealthChecksBuilder health = services.AddHealthChecks();
        if (kind is AccountStoreKind.Memory)
        {
            services.AddSingleton<IAccountStore, InMemoryAccountStore>();
        }
        else
        {
            string connectionString = configuration.GetConnectionString(ConnectionStringName)!;
            // The data source owns the connection pool; the container disposes it when the service stops.
            services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));
            services.AddSingleton<IAccountStore, PostgresAccountStore>();
            // Registered before the session cleanup, so the tables exist before anything reads them.
            services.AddHostedService<AccountSchemaInitializer>();
            health.AddCheck<AccountDatabaseHealthCheck>("account-database");
        }

        services.AddHostedService<ExpiredSessionCleanup>();
        return kind;
    }

    /// <summary>Writes to the log that this service forgets its accounts when it stops.</summary>
    /// <param name="logger">The log of the service.</param>
    public static void WarnThatAccountsAreInMemory(ILogger logger) => InMemoryWarning(logger, null);
}

/// <summary>Brings the account database to the current schema before the service accepts requests.</summary>
/// <remarks>
/// A database that cannot be reached, or that is newer than the program, stops the start of the service. A service
/// that started without its tables would answer every account request with an error instead.
/// </remarks>
/// <param name="dataSource">Connections to the account database.</param>
/// <param name="logger">Receives what was done.</param>
internal sealed class AccountSchemaInitializer(
    NpgsqlDataSource dataSource,
    ILogger<AccountSchemaInitializer> logger) : IHostedService
{
    /// <summary>Writes the schema version and the number of steps taken at this start.</summary>
    private static readonly Action<ILogger, int, int, Exception?> SchemaReport = LoggerMessage.Define<int, int>(
        LogLevel.Information,
        new EventId(2, "AccountSchema"),
        "The account database is at schema version {Version}; {Taken} step(s) were taken at this start.");

    /// <inheritdoc/>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        int taken = await AccountSchema.ApplyAsync(dataSource, cancellationToken);
        SchemaReport(logger, AccountSchema.CurrentVersion, taken, null);
    }

    /// <inheritdoc/>
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

/// <summary>Reports whether the account database answers.</summary>
/// <param name="dataSource">Connections to the account database.</param>
internal sealed class AccountDatabaseHealthCheck(NpgsqlDataSource dataSource) : IHealthCheck
{
    /// <inheritdoc/>
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using NpgsqlCommand command = dataSource.CreateCommand("SELECT 1");
            await command.ExecuteScalarAsync(cancellationToken);
            return HealthCheckResult.Healthy();
        }
        catch (Exception exception) when (exception is NpgsqlException or TimeoutException or IOException)
        {
            // The description is written to the log of the service, never to the response of /health.
            return HealthCheckResult.Unhealthy("The account database does not answer.", exception);
        }
    }
}

/// <summary>Removes sessions that have expired, once at the start and then once an hour.</summary>
/// <remarks>
/// An expired session is already refused when its token is presented, and removed then. A token that is never
/// presented again would otherwise keep its row for ever; this removes those. A removal that fails is logged and
/// tried again at the next hour, because the service works without it.
/// </remarks>
/// <param name="store">The store whose sessions are removed.</param>
/// <param name="timeProvider">Clock that decides what has expired and paces the removals.</param>
/// <param name="logger">Receives what was done.</param>
internal sealed class ExpiredSessionCleanup(
    IAccountStore store,
    TimeProvider timeProvider,
    ILogger<ExpiredSessionCleanup> logger) : BackgroundService
{
    /// <summary>Writes how many expired sessions a removal took.</summary>
    private static readonly Action<ILogger, int, Exception?> RemovedReport = LoggerMessage.Define<int>(
        LogLevel.Information,
        new EventId(3, "ExpiredSessionsRemoved"),
        "Removed {Count} expired session(s).");

    /// <summary>Writes that a removal failed, with its cause.</summary>
    private static readonly Action<ILogger, Exception?> FailureReport = LoggerMessage.Define(
        LogLevel.Warning,
        new EventId(4, "ExpiredSessionsNotRemoved"),
        "Expired sessions could not be removed; the next hour tries again.");

    /// <summary>Time between two removals.</summary>
    internal static readonly TimeSpan Interval = TimeSpan.FromHours(1);

    /// <inheritdoc/>
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using PeriodicTimer timer = new(Interval, timeProvider);
        do
        {
            await RemoveOnceAsync(stoppingToken);
        }
        while (await WaitAsync(timer, stoppingToken));
    }

    /// <summary>Removes what has expired by now.</summary>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>A task that completes when the removal has run or has failed.</returns>
    internal async Task RemoveOnceAsync(CancellationToken cancellationToken)
    {
        try
        {
            int removed = await store.RemoveExpiredSessionsAsync(timeProvider.GetUtcNow(), cancellationToken);
            if (removed != 0)
            {
                RemovedReport(logger, removed, null);
            }
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            FailureReport(logger, exception);
        }
    }

    /// <summary>Waits for the next tick; stopping the service ends the wait without an error.</summary>
    /// <param name="timer">The timer that paces the removals.</param>
    /// <param name="stoppingToken">Signals that the service stops.</param>
    /// <returns><see langword="true"/> at a tick, <see langword="false"/> when the service stops.</returns>
    private static async Task<bool> WaitAsync(PeriodicTimer timer, CancellationToken stoppingToken)
    {
        try
        {
            return await timer.WaitForNextTickAsync(stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }
}
