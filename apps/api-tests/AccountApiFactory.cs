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
internal sealed class AccountApiFactory(bool configureGoogle = true) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

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
