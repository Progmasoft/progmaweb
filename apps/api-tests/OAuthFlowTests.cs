// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class OAuthFlowTests
{
    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Fact]
    public async Task AuthorizationCodeWithPkceIssuesTokensThatCarryOnlyTheGrantedClaims()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder1", "holder@example.com");
        (string clientId, string? secret) = await browser.RegisterApplicationAsync();
        (string verifier, string challenge) = OAuthTestClient.Pkce();

        Uri redirect = await browser.AuthorizeAsync(clientId, "openid profile email offline_access viget.packages.read",
            challenge);
        Assert.StartsWith(OAuthTestClient.RedirectUri, redirect.ToString(), StringComparison.Ordinal);
        Assert.Equal("state-123", OAuthTestClient.Query(redirect, "state"));
        string code = OAuthTestClient.Query(redirect, "code")!;

        (HttpStatusCode status, JsonElement tokens) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = code,
            ["redirect_uri"] = OAuthTestClient.RedirectUri,
            ["code_verifier"] = verifier,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });
        Assert.True(status == HttpStatusCode.OK, tokens.ToString());

        JsonElement identity = OAuthTestClient.Payload(tokens.GetProperty("id_token").GetString()!);
        Assert.Equal($"https://{AccountApiFactory.OAuthHost}/", identity.GetProperty("iss").GetString());
        Assert.Equal(clientId, identity.GetProperty("aud").GetString());
        Assert.Equal("OAuthHolder1", identity.GetProperty("preferred_username").GetString());
        Assert.Equal("holder@example.com", identity.GetProperty("email").GetString());
        Assert.False(identity.GetProperty("email_verified").GetBoolean());
        Assert.Equal("nonce-456", identity.GetProperty("nonce").GetString());

        using HttpClient client = factory.CreateOAuthClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.GetProperty("access_token").GetString());
        JsonElement user = await client.GetFromJsonAsync<JsonElement>("/connect/userinfo", Cancel);
        Assert.Equal(identity.GetProperty("sub").GetString(), user.GetProperty("sub").GetString());
        Assert.Equal("OAuthHolder1", user.GetProperty("name").GetString());
        Assert.Equal("holder@example.com", user.GetProperty("email").GetString());

        // The code is single use.
        (HttpStatusCode reused, _) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = code,
            ["redirect_uri"] = OAuthTestClient.RedirectUri,
            ["code_verifier"] = verifier,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });
        Assert.Equal(HttpStatusCode.BadRequest, reused);
    }

    [Fact]
    public async Task ScopesThatWereNotGrantedAreNotInTheTokens()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder2", "holder2@example.com");
        (string clientId, string? secret) = await browser.RegisterApplicationAsync();
        (string verifier, string challenge) = OAuthTestClient.Pkce();

        Uri redirect = await browser.AuthorizeAsync(clientId, "openid", challenge);
        (_, JsonElement tokens) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = OAuthTestClient.Query(redirect, "code")!,
            ["redirect_uri"] = OAuthTestClient.RedirectUri,
            ["code_verifier"] = verifier,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });
        JsonElement identity = OAuthTestClient.Payload(tokens.GetProperty("id_token").GetString()!);
        Assert.False(identity.TryGetProperty("email", out _));
        Assert.False(identity.TryGetProperty("preferred_username", out _));
        Assert.False(tokens.TryGetProperty("refresh_token", out _));
    }

    [Fact]
    public async Task RefreshTokensRotateAndAReusedOneIsRefused()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder3", "holder3@example.com");
        (string clientId, string? secret) = await browser.RegisterApplicationAsync();
        (string verifier, string challenge) = OAuthTestClient.Pkce();
        Uri redirect = await browser.AuthorizeAsync(clientId, "openid offline_access", challenge);
        (_, JsonElement first) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = OAuthTestClient.Query(redirect, "code")!,
            ["redirect_uri"] = OAuthTestClient.RedirectUri,
            ["code_verifier"] = verifier,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });
        string refresh = first.GetProperty("refresh_token").GetString()!;

        Dictionary<string, string> refreshRequest = new()
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = refresh,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        };
        (HttpStatusCode renewed, JsonElement second) = await browser.TokenAsync(refreshRequest);
        Assert.Equal(HttpStatusCode.OK, renewed);
        Assert.NotEqual(refresh, second.GetProperty("refresh_token").GetString());

        (HttpStatusCode reused, JsonElement error) = await browser.TokenAsync(refreshRequest);
        Assert.Equal(HttpStatusCode.BadRequest, reused);
        Assert.Equal("invalid_grant", error.GetProperty("error").GetString());
    }

    [Fact]
    public async Task AnAllowedApplicationSkipsTheConsentAndWithdrawingEndsItsTokens()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder4", "holder4@example.com");
        (string clientId, string? secret) = await browser.RegisterApplicationAsync();
        (string verifier, string challenge) = OAuthTestClient.Pkce();
        Uri redirect = await browser.AuthorizeAsync(clientId, "openid offline_access", challenge);
        (_, JsonElement tokens) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = OAuthTestClient.Query(redirect, "code")!,
            ["redirect_uri"] = OAuthTestClient.RedirectUri,
            ["code_verifier"] = verifier,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });

        HttpResponseMessage again = await browser.Browser.GetAsync(
            OAuthTestClient.AuthorizePath(clientId, "openid offline_access", OAuthTestClient.Pkce().Challenge), Cancel);
        Assert.Equal(HttpStatusCode.Redirect, again.StatusCode);
        Assert.NotNull(OAuthTestClient.Query(again.Headers.Location!, "code"));

        string allowed = await browser.Browser.GetStringAsync("/account/applications", Cancel);
        Assert.Contains("Example Client", allowed, StringComparison.Ordinal);
        string action = System.Text.RegularExpressions.Regex.Match(allowed,
            "action=\"(/account/applications/[^\"]+/revoke)\"").Groups[1].Value;
        HttpResponseMessage withdrawn = await browser.SubmitAsync("/account/applications", action, []);
        Assert.Equal(HttpStatusCode.Redirect, withdrawn.StatusCode);

        (HttpStatusCode refreshed, _) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = tokens.GetProperty("refresh_token").GetString()!,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });
        Assert.Equal(HttpStatusCode.BadRequest, refreshed);
    }

    [Fact]
    public async Task DenyingTheConsentReturnsAccessDenied()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder5", "holder5@example.com");
        (string clientId, _) = await browser.RegisterApplicationAsync();

        Uri redirect = await browser.AuthorizeAsync(clientId, "openid email", OAuthTestClient.Pkce().Challenge, "deny");
        Assert.Equal("access_denied", OAuthTestClient.Query(redirect, "error"));
        Assert.Null(OAuthTestClient.Query(redirect, "code"));
    }

    [Fact]
    public async Task TheConsentPageListsEachRequestedGrant()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder6", "holder6@example.com");
        (string clientId, _) = await browser.RegisterApplicationAsync(
            "profile email viget.packages.read viget.packages.publish viget.packages.yank");

        HttpResponseMessage page = await browser.Browser.GetAsync(OAuthTestClient.AuthorizePath(clientId,
            "openid profile email viget.packages.read viget.packages.publish viget.packages.yank",
            OAuthTestClient.Pkce().Challenge), Cancel);
        string html = await page.Content.ReadAsStringAsync(Cancel);
        Assert.Contains("Read your Progmasoft account name.", html, StringComparison.Ordinal);
        Assert.Contains("Read the email address you sign in and registered with.", html, StringComparison.Ordinal);
        Assert.Contains("Read the packages you have published on ViGet.", html, StringComparison.Ordinal);
        Assert.Contains("Publish packages to ViGet under your account.", html, StringComparison.Ordinal);
        Assert.Contains("Yank packages you have published on ViGet.", html, StringComparison.Ordinal);
        Assert.Contains("registered by <strong>OAuthHolder6</strong>", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task ViGetScopesGiveAccessTokensForViGet()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder7", "holder7@example.com");
        (string clientId, string? secret) = await browser.RegisterApplicationAsync("viget.packages.publish");
        (string verifier, string challenge) = OAuthTestClient.Pkce();
        Uri redirect = await browser.AuthorizeAsync(clientId, "openid viget.packages.publish", challenge);
        (HttpStatusCode status, JsonElement tokens) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = OAuthTestClient.Query(redirect, "code")!,
            ["redirect_uri"] = OAuthTestClient.RedirectUri,
            ["code_verifier"] = verifier,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });
        Assert.Equal(HttpStatusCode.OK, status);
        Assert.Equal("openid viget.packages.publish", tokens.GetProperty("scope").GetString());

        // The access token is encrypted for the resource servers; introspection shows its audience.
        using HttpClient client = factory.CreateOAuthClient();
        HttpResponseMessage response = await client.PostAsync("/connect/introspect", new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["token"] = tokens.GetProperty("access_token").GetString()!,
                ["client_id"] = clientId,
                ["client_secret"] = secret!
            }), Cancel);
        JsonElement introspection = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(introspection.GetProperty("active").GetBoolean(), introspection.ToString());
        Assert.Contains("viget", introspection.GetProperty("aud").ToString(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task APublicClientUsesPkceWithoutASecret()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder8", "holder8@example.com");
        (string clientId, string? secret) = await browser.RegisterApplicationAsync("profile", isPublic: true,
            redirectUris: "com.example.app:/callback");
        Assert.Null(secret);
        (string verifier, string challenge) = OAuthTestClient.Pkce();

        HttpResponseMessage page = await browser.Browser.GetAsync(OAuthTestClient.AuthorizePath(clientId,
            "openid profile", challenge, "com.example.app:/callback"), Cancel);
        string html = await page.Content.ReadAsStringAsync(Cancel);
        List<KeyValuePair<string, string>> fields = OAuthTestClient.HiddenFields(html);
        fields.Add(new("decision", "allow"));
        HttpResponseMessage decided = await browser.Browser.PostAsync("/connect/authorize",
            new FormUrlEncodedContent(fields), Cancel);
        Uri redirect = decided.Headers.Location!;
        Assert.Equal("com.example.app", redirect.Scheme);

        (HttpStatusCode status, _) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = OAuthTestClient.Query(redirect, "code")!,
            ["redirect_uri"] = "com.example.app:/callback",
            ["code_verifier"] = verifier,
            ["client_id"] = clientId
        });
        Assert.Equal(HttpStatusCode.OK, status);
    }

    [Fact]
    public async Task OnPostgreSqlTheTablesAreCreatedAndAReusedRefreshTokenRevokesItsChain()
    {
        await using PostgresTestDatabase database = await PostgresTestDatabase.CreateAsync();
        await using AccountApiFactory factory = new(accountDatabase: database.ConnectionString);
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("PostgresHolder1", "postgres1@example.com");
        (string clientId, string? secret) = await browser.RegisterApplicationAsync();
        (string verifier, string challenge) = OAuthTestClient.Pkce();
        Uri redirect = await browser.AuthorizeAsync(clientId, "openid profile offline_access", challenge);
        (_, JsonElement first) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = OAuthTestClient.Query(redirect, "code")!,
            ["redirect_uri"] = OAuthTestClient.RedirectUri,
            ["code_verifier"] = verifier,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });
        Dictionary<string, string> Refresh(string token) => new()
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = token,
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        };

        (HttpStatusCode renewed, JsonElement second) =
            await browser.TokenAsync(Refresh(first.GetProperty("refresh_token").GetString()!));
        Assert.Equal(HttpStatusCode.OK, renewed);

        // Reusing the first refresh token is taken for theft: the token issued from it stops working as well.
        (HttpStatusCode reused, _) = await browser.TokenAsync(Refresh(first.GetProperty("refresh_token").GetString()!));
        (HttpStatusCode chained, _) = await browser.TokenAsync(Refresh(second.GetProperty("refresh_token").GetString()!));
        Assert.Equal(HttpStatusCode.BadRequest, reused);
        Assert.Equal(HttpStatusCode.BadRequest, chained);

        await using Npgsql.NpgsqlDataSource dataSource = database.OpenDataSource();
        await using Npgsql.NpgsqlCommand version =
            dataSource.CreateCommand("SELECT max(version) FROM oauth_schema_versions");
        Assert.Equal(Progmasoft.OAuth.Storage.OAuthSchema.CurrentVersion,
            (int)(await version.ExecuteScalarAsync(Cancel))!);
    }

    [Fact]
    public async Task ClientCredentialsActAsTheApplicationAndTakeNoAccountScope()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("OAuthHolder9", "holder9@example.com");
        (string clientId, string? secret) = await browser.RegisterApplicationAsync("profile", clientCredentials: true);

        (HttpStatusCode status, JsonElement token) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials",
            ["client_id"] = clientId,
            ["client_secret"] = secret!
        });
        Assert.True(status == HttpStatusCode.OK, token.ToString());

        (HttpStatusCode scoped, JsonElement error) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials",
            ["client_id"] = clientId,
            ["client_secret"] = secret!,
            ["scope"] = "profile"
        });
        Assert.Equal(HttpStatusCode.BadRequest, scoped);
        Assert.Equal("invalid_scope", error.GetProperty("error").GetString());

        (HttpStatusCode wrongSecret, _) = await browser.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials",
            ["client_id"] = clientId,
            ["client_secret"] = "not-the-secret"
        });
        Assert.Equal(HttpStatusCode.Unauthorized, wrongSecret);
    }
}
