// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Progmasoft.OAuth.Developers;
using Progmasoft.OAuth.Storage;
using Progmasoft.Progmaweb.Api.Accounts;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth;

/// <summary>Registers Progmasoft OAuth: its tables, the OpenIddict server, its sign-in cookie and its pages.</summary>
internal static class OAuthRegistration
{
    /// <summary>The cookie scheme of an account signed in to Progmasoft OAuth.</summary>
    /// <remarks>
    /// It is separate from the session of the account site: signing in here opens no account-site session, and the
    /// cookie is a <c>__Host-</c> cookie of the OAuth host only.
    /// </remarks>
    public const string CookieScheme = "ProgmasoftOAuth";

    /// <summary>How long a sign-in to Progmasoft OAuth lasts.</summary>
    public static readonly TimeSpan SignInLifetime = TimeSpan.FromHours(8);

    /// <summary>Adds the services of Progmasoft OAuth.</summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configuration">The configuration of the service.</param>
    /// <param name="accountStore">Where the accounts are kept; the OAuth tables are kept in the same place.</param>
    /// <param name="isProduction">Whether the service runs in production, where the token keys are required.</param>
    /// <returns>The settings, as the pipeline needs them.</returns>
    public static OAuthOptions AddProgmasoftOAuth(
        this IServiceCollection services,
        IConfiguration configuration,
        AccountStoreKind accountStore,
        bool isProduction)
    {
        IConfigurationSection section = configuration.GetSection(OAuthOptions.SectionName);
        OAuthOptions settings = section.Get<OAuthOptions>() ?? new OAuthOptions();
        services.Configure<OAuthOptions>(section);

        // With the memory account store the OAuth tables live in an in-memory SQLite database, one per process, which
        // a kept-open connection holds alive and every context opens again by name. SQLite, unlike Entity
        // Framework's in-memory provider, runs the bulk updates OpenIddict uses to revoke a reused refresh token's
        // chain, so development and the tests exercise the same revocation as production.
        string memoryDatabase =
            $"Data Source=progmasoft-oauth-{Guid.NewGuid():N};Mode=Memory;Cache=Shared";
        services.AddDbContext<OAuthDbContext>(options =>
        {
            if (accountStore is AccountStoreKind.PostgreSql)
            {
                options.UseNpgsql(configuration.GetConnectionString(AccountStoreRegistration.ConnectionStringName));
            }
            else
            {
                options.UseSqlite(memoryDatabase);
            }

            options.UseOpenIddict();
        });
        if (accountStore is AccountStoreKind.PostgreSql)
        {
            // Registered after the account schema, which it refers to.
            services.AddHostedService<OAuthSchemaInitializer>();
        }
        else
        {
            services.AddSingleton(new MemoryOAuthDatabase(memoryDatabase));
            services.AddHostedService<MemoryOAuthDatabaseInitializer>();
        }

        services.AddOpenIddict()
            .AddCore(core => core.UseEntityFrameworkCore().UseDbContext<OAuthDbContext>())
            .AddServer(server =>
            {
                server.SetIssuer(settings.Issuer);
                server.SetAuthorizationEndpointUris("connect/authorize")
                    .SetTokenEndpointUris("connect/token")
                    .SetUserInfoEndpointUris("connect/userinfo")
                    .SetEndSessionEndpointUris("connect/logout")
                    .SetRevocationEndpointUris("connect/revoke")
                    .SetIntrospectionEndpointUris("connect/introspect");

                // OAuth 2.1: the authorization code with PKCE for every client, refresh tokens, and client
                // credentials for services. The implicit and password grants are not offered at all.
                server.AllowAuthorizationCodeFlow()
                    .AllowRefreshTokenFlow()
                    .AllowClientCredentialsFlow();
                server.RequireProofKeyForCodeExchange();
                // OAuth 2.1 allows only the S256 challenge; "plain" would put the verifier itself in the browser.
                server.Configure(options => options.CodeChallengeMethods.Remove(CodeChallengeMethods.Plain));

                server.RegisterScopes(
                    [Scopes.OpenId, .. OAuthScopes.All.Select(scope => scope.Name)]);
                server.RegisterClaims(
                    Claims.Subject, Claims.Name, Claims.PreferredUsername, Claims.Email, Claims.EmailVerified);

                server.SetAuthorizationCodeLifetime(TimeSpan.FromMinutes(2))
                    .SetAccessTokenLifetime(TimeSpan.FromMinutes(15))
                    .SetIdentityTokenLifetime(TimeSpan.FromMinutes(15))
                    .SetRefreshTokenLifetime(TimeSpan.FromDays(30))
                    // OAuth 2.1 refresh token rotation: a refresh token that was used once is refused, and its reuse
                    // revokes the whole chain. OpenIddict tolerates reuse for 30 seconds unless told otherwise.
                    .SetRefreshTokenReuseLeeway(TimeSpan.Zero);

                AddKeys(server, settings, isProduction);

                server.UseAspNetCore()
                    .EnableAuthorizationEndpointPassthrough()
                    .EnableTokenEndpointPassthrough()
                    .EnableUserInfoEndpointPassthrough()
                    .EnableEndSessionEndpointPassthrough()
                    .EnableStatusCodePagesIntegration();
            })
            .AddValidation(validation =>
            {
                validation.UseLocalServer();
                validation.UseAspNetCore();
            });

        services.AddAuthentication()
            .AddCookie(CookieScheme, options =>
            {
                options.Cookie.Name = "__Host-ProgmasoftOAuth";
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
                // Lax, so that the redirect back from the sign-in page to the authorization endpoint carries it.
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.ExpireTimeSpan = SignInLifetime;
                options.SlidingExpiration = false;
                options.LoginPath = "/signin";
                options.LogoutPath = "/signout";
                options.AccessDeniedPath = "/signin";
            });
        services.AddAntiforgery(options =>
        {
            options.Cookie.Name = "__Host-ProgmasoftOAuthForm";
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.FormFieldName = "form-token";
        });
        services.AddScoped<ApplicationRegistry>();
        return settings;
    }

    /// <summary>Adds the keys that sign and encrypt tokens.</summary>
    /// <remarks>
    /// Production reads both keys from files outside the release, so that tokens survive a restart and a new
    /// release. Every other environment makes keys that live as long as the process.
    /// </remarks>
    /// <param name="server">The OpenIddict server builder.</param>
    /// <param name="settings">The settings that name the key files.</param>
    /// <param name="isProduction">Whether the service runs in production.</param>
    /// <exception cref="InvalidOperationException">A key file is missing in production.</exception>
    private static void AddKeys(OpenIddictServerBuilder server, OAuthOptions settings, bool isProduction)
    {
        if (string.IsNullOrWhiteSpace(settings.SigningKeyPath) || string.IsNullOrWhiteSpace(settings.EncryptionKeyPath))
        {
            if (isProduction)
            {
                throw new InvalidOperationException(
                    $"{OAuthOptions.SectionName}:{nameof(OAuthOptions.SigningKeyPath)} and " +
                    $"{OAuthOptions.SectionName}:{nameof(OAuthOptions.EncryptionKeyPath)} must name the token key " +
                    "files in production.");
            }

            server.AddEphemeralSigningKey().AddEphemeralEncryptionKey();
            return;
        }

        RSA signing = RSA.Create();
        signing.ImportFromPem(File.ReadAllText(settings.SigningKeyPath));
        // A key identifier derived from the public key lets clients pick the key of a token from the key set.
        byte[] publicKey = signing.ExportSubjectPublicKeyInfo();
        server.AddSigningKey(new RsaSecurityKey(signing)
        {
            KeyId = Base64UrlEncoder.Encode(SHA256.HashData(publicKey)[..16])
        });

        byte[] encryption = Convert.FromBase64String(File.ReadAllText(settings.EncryptionKeyPath).Trim());
        if (encryption.Length != 32)
        {
            throw new InvalidOperationException("The OAuth encryption key must be 256 bits, written as base64.");
        }

        server.AddEncryptionKey(new SymmetricSecurityKey(encryption));
    }
}

/// <summary>Brings the OAuth tables to the current schema before the service accepts requests.</summary>
/// <param name="dataSource">Connections to the database of the accounts.</param>
/// <param name="logger">Receives what was done.</param>
internal sealed class OAuthSchemaInitializer(
    NpgsqlDataSource dataSource,
    ILogger<OAuthSchemaInitializer> logger) : IHostedService
{
    /// <summary>Writes the schema version and the number of steps taken at this start.</summary>
    private static readonly Action<ILogger, int, int, Exception?> SchemaReport = LoggerMessage.Define<int, int>(
        LogLevel.Information,
        new EventId(20, "OAuthSchema"),
        "The OAuth tables are at schema version {Version}; {Taken} step(s) were taken at this start.");

    /// <inheritdoc/>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        int taken = await OAuthSchema.ApplyAsync(dataSource, cancellationToken);
        SchemaReport(logger, OAuthSchema.CurrentVersion, taken, null);
    }

    /// <inheritdoc/>
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

/// <summary>Keeps the in-memory SQLite database of the OAuth tables alive for the lifetime of the process.</summary>
/// <remarks>A shared in-memory SQLite database exists as long as one connection to it is open.</remarks>
internal sealed class MemoryOAuthDatabase : IDisposable
{
    private readonly SqliteConnection keeper;

    /// <summary>Opens the connection that holds the database.</summary>
    /// <param name="connectionString">The connection string of the shared in-memory database.</param>
    public MemoryOAuthDatabase(string connectionString)
    {
        keeper = new SqliteConnection(connectionString);
        keeper.Open();
    }

    /// <inheritdoc/>
    public void Dispose() => keeper.Dispose();
}

/// <summary>Creates the OAuth tables in the in-memory database before the service accepts requests.</summary>
/// <param name="database">The connection that keeps the database alive.</param>
/// <param name="services">Creates the scope of the context.</param>
internal sealed class MemoryOAuthDatabaseInitializer(MemoryOAuthDatabase database, IServiceProvider services)
    : IHostedService
{
    /// <inheritdoc/>
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        GC.KeepAlive(database);
        await using AsyncServiceScope scope = services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<OAuthDbContext>().Database.EnsureCreatedAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
