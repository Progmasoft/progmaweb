// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Npgsql;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.ViGet;

/// <summary>Registers ViGet: its catalog beside the accounts, and the publishing of plugins.</summary>
internal static class ViGetRegistration
{
    /// <summary>Adds the services of ViGet.</summary>
    /// <param name="services">The services of the API.</param>
    /// <param name="configuration">The configuration, whose section <c>ViGet</c> holds <see cref="ViGetOptions"/>.</param>
    /// <param name="accountStore">Where the accounts are kept; the catalog is kept in the same place.</param>
    public static void AddViGet(
        this IServiceCollection services,
        IConfiguration configuration,
        AccountStoreKind accountStore)
    {
        services.Configure<ViGetOptions>(configuration.GetSection(ViGetOptions.SectionName));
        if (accountStore is AccountStoreKind.PostgreSql)
        {
            services.AddSingleton<ITazelPluginCatalog, PostgresTazelPluginCatalog>();
            services.AddHostedService<ViGetSchemaInitializer>();
        }
        else
        {
            services.AddSingleton<ITazelPluginCatalog, InMemoryTazelPluginCatalog>();
        }

        services.AddSingleton<TazelPluginPublishing>();
    }
}

/// <summary>Brings the ViGet tables to the current schema before the service accepts requests.</summary>
/// <param name="dataSource">Connections to the database of the accounts.</param>
/// <param name="logger">Receives what was done.</param>
internal sealed class ViGetSchemaInitializer(
    NpgsqlDataSource dataSource,
    ILogger<ViGetSchemaInitializer> logger) : IHostedService
{
    private static readonly Action<ILogger, int, int, Exception?> SchemaReport = LoggerMessage.Define<int, int>(
        LogLevel.Information,
        new EventId(1, "ViGetSchema"),
        "The ViGet tables are at schema version {Version}; {Taken} step(s) were taken at this start.");

    /// <inheritdoc/>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        int taken = await ViGetSchema.ApplyAsync(dataSource, cancellationToken);
        SchemaReport(logger, ViGetSchema.CurrentVersion, taken, null);
    }

    /// <inheritdoc/>
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
