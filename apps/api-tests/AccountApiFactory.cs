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
/// <param name="oauthKeys">
/// Whether to give Progmasoft OAuth key files. Production refuses to start without them; other environments make
/// their own keys.
/// </param>
internal sealed class AccountApiFactory(
    bool configureGoogle = true,
    string? accountDatabase = null,
    string environment = "Testing",
    string? accountStore = null,
    bool oauthKeys = true) : WebApplicationFactory<Program>
{
    private readonly string keyDirectory = Path.Combine(Path.GetTempPath(), "progmaweb-oauth-keys-" + Guid.NewGuid().ToString("N"));

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

        // Progmasoft OAuth reads its host while services are registered, like the Google client above. Its own host
        // keeps the host filter honest: the account API answers on localhost, OAuth on oauth.localhost.
        builder.UseSetting("OAuth:Host", OAuthHost);
        builder.UseSetting("OAuth:AuthorizeHost", AuthorizeHost);
        builder.UseSetting("OAuth:ConsoleHost", ConsoleHost);
        builder.UseSetting("AllowedHosts",
            $"localhost;127.0.0.1;progmasoft.com;account.progmasoft.com;www.progmasoft.com;{OAuthHost};{AuthorizeHost};{ConsoleHost}");
        if (oauthKeys && environment == "Production")
        {
            Directory.CreateDirectory(keyDirectory);
            using System.Security.Cryptography.RSA signing = System.Security.Cryptography.RSA.Create(2048);
            string signingPath = Path.Combine(keyDirectory, "signing.pem");
            string encryptionPath = Path.Combine(keyDirectory, "encryption.key");
            File.WriteAllText(signingPath, signing.ExportPkcs8PrivateKeyPem());
            File.WriteAllText(encryptionPath,
                Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)));
            builder.UseSetting("OAuth:SigningKeyPath", signingPath);
            builder.UseSetting("OAuth:EncryptionKeyPath", encryptionPath);
        }
        else
        {
            builder.UseSetting("OAuth:SigningKeyPath", string.Empty);
            builder.UseSetting("OAuth:EncryptionKeyPath", string.Empty);
        }

        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AccountSessions:LifetimeHours"] = "2",
                ["AccountSessions:CookieName"] = "__Host-ProgmasoftSession",
                // A host-only cookie: the console tests send the account session themselves.
                ["AccountSessions:CookieDomain"] = string.Empty
            });
        });
    }

    /// <summary>The host Progmasoft OAuth answers on in the tests.</summary>
    public const string OAuthHost = "oauth.localhost";

    public const string AuthorizeHost = "authorize.localhost";

    public const string ConsoleHost = "console.localhost";

    /// <summary>A client of the OAuth host that keeps its cookies and does not follow redirections.</summary>
    public HttpClient CreateOAuthClient() => CreateClient(
        new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri($"https://{OAuthHost}"),
            HandleCookies = true
        });

    /// <summary>A browser on the authorize host: sign-in, consent and the allowed applications.</summary>
    public HttpClient CreateAuthorizeClient() => CreateClient(
        new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri($"https://{AuthorizeHost}"),
            HandleCookies = true
        });

    /// <summary>
    /// A browser on the Progmasoft Console. Production shares the account session cookie with progmasoft.com; the
    /// test hosts are not under one domain, so a test sends the session cookie of an account itself.
    /// </summary>
    public HttpClient CreateConsoleClient(string? sessionCookie = null)
    {
        HttpClient client = CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri($"https://{ConsoleHost}"),
            HandleCookies = false
        });
        if (sessionCookie is not null)
        {
            client.DefaultRequestHeaders.Add("Cookie", sessionCookie);
        }

        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (Directory.Exists(keyDirectory))
        {
            Directory.Delete(keyDirectory, recursive: true);
        }
    }

    public HttpClient CreateAccountClient(bool handleCookies = true) => CreateClient(
        new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = handleCookies
        });
}
