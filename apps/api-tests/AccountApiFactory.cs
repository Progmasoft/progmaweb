// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>Starts the account API in memory for a test.</summary>
/// <param name="configureGoogle">
/// Whether the Google client is configured. Without it the service has to run and refuse only Google sign-in.
/// </param>
/// <param name="accountDatabase">
/// Connection string of the PostgreSQL database that keeps the accounts; <see langword="null"/> keeps them in memory.
/// </param>
/// <param name="environment">Name of the hosting environment.</param>
/// <param name="accountStore">Value of <c>Accounts:Store</c>; <see langword="null"/> leaves it unset.</param>
internal sealed class AccountApiFactory(
    bool configureGoogle = true,
    string? accountDatabase = null,
    string environment = "Testing",
    string? accountStore = null) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment(environment);

        // The program chooses the store while it registers services, so these are host settings as well. An empty
        // value overrides a database the environment of the test run names.
        builder.UseSetting("ConnectionStrings:Accounts", accountDatabase ?? string.Empty);
        builder.UseSetting("Accounts:Store", accountStore ?? string.Empty);

        // The program decides while it registers services whether the Google scheme exists, so these two values
        // have to be host settings: configuration sources added below are applied only when the host is built,
        // after that decision. An empty value also overrides credentials the environment of the test run carries.
        builder.UseSetting(
            "Authentication:Google:ClientId",
            configureGoogle ? "test-client.apps.googleusercontent.com" : string.Empty);
        builder.UseSetting("Authentication:Google:ClientSecret", configureGoogle ? "test-secret" : string.Empty);

        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AccountSessions:LifetimeHours"] = "2",
                ["AccountSessions:CookieName"] = "__Host-ProgmasoftSession"
            });
        });
    }

    public HttpClient CreateAccountClient(bool handleCookies = true) => CreateClient(
        new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = handleCookies
        });
}
