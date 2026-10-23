// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Progmasoft.OAuth.Developers;
using Progmasoft.OAuth.Storage;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class OAuthPolicyTests
{
    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Theory]
    [InlineData("https://client.example/callback", "web", true)]
    [InlineData("http://127.0.0.1:8400/callback", "web", true)]
    [InlineData("http://[::1]:8400/callback", "web", true)]
    [InlineData("http://localhost:3000/callback", "web", true)]
    [InlineData("http://client.example/callback", "web", false)]
    [InlineData("https://client.example/callback#fragment", "web", false)]
    [InlineData("https://user:password@client.example/callback", "web", false)]
    [InlineData("https://*.client.example/callback", "web", false)]
    [InlineData("com.example.app:/callback", "web", false)]
    [InlineData("/relative/callback", "web", false)]
    [InlineData("https://app.example/callback", "spa", true)]
    [InlineData("http://localhost:5173/callback", "spa", true)]
    [InlineData("com.example.app:/callback", "spa", false)]
    [InlineData("http://127.0.0.1:8400/callback", "desktop", true)]
    [InlineData("com.example.app:/callback", "desktop", true)]
    [InlineData("https://client.example/callback", "desktop", false)]
    [InlineData("myapp:/callback", "desktop", false)]
    [InlineData("javascript:alert(1)", "desktop", false)]
    [InlineData("data:text/html,x", "mobile", false)]
    [InlineData("com.example.app:/callback", "mobile", true)]
    [InlineData("https://app.example/open", "mobile", true)]
    [InlineData("http://127.0.0.1:8400/callback", "mobile", false)]
    [InlineData("https://client.example/callback", "service", false)]
    public void RedirectionAddressesFollowRfc8252ForEachType(string address, string kind, bool accepted) =>
        Assert.Equal(accepted, ApplicationPolicy.IsRedirectionAddress(address, ApplicationKinds.Parse(kind)!.Value));

    [Fact]
    public void ARegistrationIsCheckedFieldByField()
    {
        Dictionary<string, string> errors = ApplicationPolicy.Validate(new ApplicationInput(
            "x", "http://plain.example", ApplicationKind.Desktop, [], [], ["profile", "not-a-scope"]));
        Assert.Equal(["displayName", "homepage", "redirectUris", "scopes"], errors.Keys.Order(StringComparer.Ordinal));
        Assert.Empty(ApplicationPolicy.Validate(new ApplicationInput(
            "Example", string.Empty, ApplicationKind.Web, ["https://client.example/callback"], [], ["profile"])));
    }

    [Fact]
    public void AServiceRegistersNeitherAddressesNorAccountScopes()
    {
        Assert.Empty(ApplicationPolicy.Validate(new ApplicationInput(
            "Build robot", string.Empty, ApplicationKind.Service, [], [], [])));
        Dictionary<string, string> errors = ApplicationPolicy.Validate(new ApplicationInput(
            "Build robot", string.Empty, ApplicationKind.Service, ["https://client.example/callback"], [], ["profile"]));
        Assert.Equal(["redirectUris", "scopes"], errors.Keys.Order(StringComparer.Ordinal));
    }

    [Fact]
    public void EveryTypeHasANameThatParsesBack()
    {
        Assert.Equal(["web", "spa", "desktop", "mobile", "service"], ApplicationKinds.All.Select(kind => kind.Slug()));
        foreach (ApplicationKind kind in ApplicationKinds.All)
        {
            Assert.Equal(kind, ApplicationKinds.Parse(kind.Slug()));
        }

        Assert.Null(ApplicationKinds.Parse("confidential"));
        Assert.Equal([ApplicationKind.SinglePage, ApplicationKind.Desktop, ApplicationKind.Mobile],
            ApplicationKinds.All.Where(kind => kind.IsPublic()));
    }

    [Fact]
    public async Task TheDiscoveryDocumentOffersOnlyOAuth21Flows()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateOAuthClient();
        JsonElement document = await client.GetFromJsonAsync<JsonElement>("/.well-known/openid-configuration", Cancel);

        Assert.Equal($"https://{AccountApiFactory.OAuthHost}/", document.GetProperty("issuer").GetString());
        // People visit the authorize host; clients call the issuer.
        Assert.Equal($"https://{AccountApiFactory.AuthorizeHost}/connect/authorize",
            document.GetProperty("authorization_endpoint").GetString());
        Assert.Equal($"https://{AccountApiFactory.AuthorizeHost}/connect/logout",
            document.GetProperty("end_session_endpoint").GetString());
        Assert.Equal($"https://{AccountApiFactory.OAuthHost}/connect/token",
            document.GetProperty("token_endpoint").GetString());
        string grants = document.GetProperty("grant_types_supported").ToString();
        Assert.Contains("authorization_code", grants, StringComparison.Ordinal);
        Assert.Contains("refresh_token", grants, StringComparison.Ordinal);
        Assert.DoesNotContain("implicit", grants, StringComparison.Ordinal);
        Assert.DoesNotContain("password", grants, StringComparison.Ordinal);
        Assert.Equal(["code"], document.GetProperty("response_types_supported").EnumerateArray()
            .Select(value => value.GetString()));
        Assert.Equal(["S256"], document.GetProperty("code_challenge_methods_supported").EnumerateArray()
            .Select(value => value.GetString()));
        string scopes = document.GetProperty("scopes_supported").ToString();
        foreach (string scope in new[]
                 {
                     "openid", "profile", "email", "offline_access", "viget.packages.read", "viget.packages.publish",
                     "viget.packages.yank"
                 })
        {
            Assert.Contains($"\"{scope}\"", scopes, StringComparison.Ordinal);
        }
    }

    [Fact]
    public async Task OAuthAnswersOnlyOnItsHostAndTheAccountApiNotThere()
    {
        await using AccountApiFactory factory = new();
        using HttpClient accounts = factory.CreateAccountClient();
        using HttpClient oauth = factory.CreateOAuthClient();

        Assert.Equal(HttpStatusCode.NotFound,
            (await accounts.GetAsync("/.well-known/openid-configuration", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await accounts.GetAsync("/api/v1/oauth/session", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/api/v1/accounts/me", Cancel)).StatusCode);
        // The pages of the OAuth host belong to the Next.js site; the API answers none of them.
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/signin", Cancel)).StatusCode);

        // People sign in and decide on the authorize host; clients call the issuer.
        using HttpClient authorize = factory.CreateAuthorizeClient();
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/connect/authorize", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/connect/logout", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/api/v1/oauth/session", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/api/v1/oauth/allowed", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await authorize.GetAsync("/.well-known/openid-configuration", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await authorize.PostAsync("/connect/token", null, Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await authorize.GetAsync("/connect/userinfo", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await authorize.GetAsync("/api/v1/oauth/applications", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await authorize.GetAsync("/api/v1/oauth/session", Cancel)).StatusCode);

        // Applications are managed in the Progmasoft Console only, and the console issues no tokens.
        using HttpClient console = factory.CreateConsoleClient();
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/api/v1/oauth/applications", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await accounts.GetAsync("/api/v1/oauth/applications", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await console.GetAsync("/api/v1/oauth/applications", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await console.GetAsync("/api/v1/oauth/session", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await console.GetAsync("/.well-known/openid-configuration", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await console.GetAsync("/api/v1/oauth/allowed", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await console.PostAsync("/connect/token", null, Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await console.GetAsync("/api/v1/accounts/me", Cancel)).StatusCode);
        // The console has no sign-in of its own.
        Assert.Equal(HttpStatusCode.NotFound, (await console.PostAsync("/api/v1/oauth/signin", null, Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await accounts.PostAsync("/connect/token", null, Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await oauth.GetAsync("/api/v1/status", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await oauth.GetAsync("/health", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await accounts.GetAsync("/api/v1/status", Cancel)).StatusCode);
    }

    [Fact]
    public async Task AuthorizationRequestsWithoutPkceOrWithAnotherFlowAreRefused()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        await browser.RegisterAndSignInAsync("PolicyHolder1", "policy1@example.com");
        (string clientId, _) = await browser.RegisterApplicationAsync("profile");

        // OpenIddict refuses some requests before it trusts the redirection address; those are answered here with
        // 400 instead of being sent back to the client. Either way, no code is issued.
        static async Task AssertRefusedAsync(HttpResponseMessage response, string error)
        {
            string answer = response.Headers.Location?.ToString()
                            ?? await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
            Assert.True(response.StatusCode is HttpStatusCode.Redirect or HttpStatusCode.Found
                            or HttpStatusCode.BadRequest, answer);
            Assert.DoesNotContain("code=", answer, StringComparison.Ordinal);
            if (response.Headers.Location is { } location)
            {
                Assert.Equal(error, OAuthTestClient.Query(location, "error"));
            }
        }

        await AssertRefusedAsync(await browser.Browser.GetAsync(
            OAuthTestClient.AuthorizePath(clientId, "openid", null), Cancel), "invalid_request");
        await AssertRefusedAsync(await browser.Browser.GetAsync(OAuthTestClient.AuthorizePath(clientId,
            "openid", OAuthTestClient.Pkce().Challenge, responseType: "token"), Cancel), "unsupported_response_type");
        await AssertRefusedAsync(await browser.Browser.GetAsync(OAuthTestClient.AuthorizePath(clientId,
            "openid viget.packages.publish", OAuthTestClient.Pkce().Challenge), Cancel), "invalid_scope");

        // An address that was not registered never receives a redirection.
        HttpResponseMessage unknownAddress = await browser.Browser.GetAsync(OAuthTestClient.AuthorizePath(clientId,
            "openid", OAuthTestClient.Pkce().Challenge, "https://attacker.example/callback"), Cancel);
        Assert.Equal(HttpStatusCode.BadRequest, unknownAddress.StatusCode);
        Assert.Null(unknownAddress.Headers.Location);
    }

    [Fact]
    public async Task AnAccountThatIsNotSignedInIsSentToTheSignInPageAndBack()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient developer = new(factory);
        await developer.RegisterAndSignInAsync("PolicyHolder2", "policy2@example.com");
        (string clientId, _) = await developer.RegisterApplicationAsync("profile");

        using HttpClient anonymous = factory.CreateAuthorizeClient();
        string path = OAuthTestClient.AuthorizePath(clientId, "openid", OAuthTestClient.Pkce().Challenge, prompt: "login");
        HttpResponseMessage response = await anonymous.GetAsync(path, Cancel);
        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        string location = response.Headers.Location!.ToString();
        Assert.Contains("/signin?ReturnUrl=", location, StringComparison.Ordinal);
        Assert.Contains("connect%2Fauthorize", location, StringComparison.Ordinal);
        Assert.DoesNotContain("prompt", Uri.UnescapeDataString(location), StringComparison.Ordinal);

        HttpResponseMessage none = await anonymous.GetAsync(OAuthTestClient.AuthorizePath(clientId, "openid",
            OAuthTestClient.Pkce().Challenge, prompt: "none"), Cancel);
        Assert.Equal("login_required", OAuthTestClient.Query(none.Headers.Location!, "error"));
    }

    [Fact]
    public async Task SignInGivesOneMessageForEveryFailureAndOnlyFromThisSite()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        HttpResponseMessage failed = await browser.SendAsync(HttpMethod.Post, "/api/v1/oauth/signin",
            new { email = "nobody@example.com", password = "wrong password here" });
        Assert.Equal(HttpStatusCode.Unauthorized, failed.StatusCode);
        Assert.Contains("The email address or the password is not right.",
            await failed.Content.ReadAsStringAsync(Cancel), StringComparison.Ordinal);

        HttpResponseMessage forged = await browser.SendAsync(HttpMethod.Post, "/api/v1/oauth/signin",
            new { email = "a@example.com", password = "x" }, origin: "https://attacker.example");
        Assert.Equal(HttpStatusCode.Forbidden, forged.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await browser.SendAsync(HttpMethod.Get, "/api/v1/oauth/session")).StatusCode);

        await browser.RegisterAndSignInAsync("PolicyHolder3", "policy3@example.com");
        JsonElement session = await browser.Browser.GetFromJsonAsync<JsonElement>("/api/v1/oauth/session", Cancel);
        Assert.Equal("PolicyHolder3", session.GetProperty("accountName").GetString());
        Assert.Equal(HttpStatusCode.NoContent,
            (await browser.SendAsync(HttpMethod.Post, "/api/v1/oauth/signout")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await browser.SendAsync(HttpMethod.Get, "/api/v1/oauth/session")).StatusCode);
    }

    [Fact]
    public async Task ThePortalRefusesBadAddressesAndHidesOtherAccountsApplications()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient owner = new(factory);
        await owner.RegisterAndSignInAsync("PolicyOwner1", "owner1@example.com");
        (string clientId, _) = await owner.RegisterApplicationAsync("profile");

        HttpResponseMessage refused = await owner.SendAsync(HttpMethod.Post, "/api/v1/oauth/applications", new
        {
            kind = "web",
            displayName = "Plain HTTP",
            redirectUris = new List<string> { "http://plain.example/callback" }
        });
        Assert.Equal(HttpStatusCode.BadRequest, refused.StatusCode);
        Assert.Contains("cannot be registered", await refused.Content.ReadAsStringAsync(Cancel),
            StringComparison.Ordinal);
        HttpResponseMessage noKind = await owner.SendAsync(HttpMethod.Post, "/api/v1/oauth/applications", new
        {
            kind = "confidential",
            displayName = "Old form",
            redirectUris = new[] { OAuthTestClient.RedirectUri }
        });
        Assert.Equal(HttpStatusCode.BadRequest, noKind.StatusCode);
        HttpResponseMessage foreign = await owner.SendAsync(HttpMethod.Post, "/api/v1/oauth/applications", new
        {
            kind = "web",
            displayName = "From elsewhere",
            redirectUris = new[] { OAuthTestClient.RedirectUri }
        }, origin: "https://attacker.example");
        Assert.Equal(HttpStatusCode.Forbidden, foreign.StatusCode);

        OAuthTestClient stranger = new(factory);
        await stranger.RegisterAndSignInAsync("PolicyStranger1", "stranger1@example.com");
        Assert.Equal(HttpStatusCode.NotFound,
            (await stranger.SendAsync(HttpMethod.Get, $"/api/v1/oauth/applications/{clientId}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await stranger.SendAsync(HttpMethod.Delete, $"/api/v1/oauth/applications/{clientId}")).StatusCode);
        JsonElement listed = await owner.Console.GetFromJsonAsync<JsonElement>("/api/v1/oauth/applications", Cancel);
        JsonElement only = Assert.Single(listed.GetProperty("applications").EnumerateArray());
        Assert.Equal("web", only.GetProperty("kind").GetString());
        Assert.Equal(10, listed.GetProperty("maximum").GetInt32());

        HttpResponseMessage saved = await owner.SendAsync(HttpMethod.Put, $"/api/v1/oauth/applications/{clientId}", new
        {
            kind = "desktop",
            displayName = "Renamed Client",
            redirectUris = new[] { OAuthTestClient.RedirectUri },
            scopes = new List<string> { "profile", "email" }
        });
        JsonElement view = await saved.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(saved.StatusCode == HttpStatusCode.OK, view.ToString());
        Assert.Equal("Renamed Client", view.GetProperty("displayName").GetString());
        // The type is chosen once, when the token is made.
        Assert.Equal("web", view.GetProperty("kind").GetString());
        Assert.Equal(["profile", "email"], view.GetProperty("scopes").EnumerateArray().Select(scope => scope.GetString()));

        Assert.Equal(HttpStatusCode.NoContent,
            (await owner.SendAsync(HttpMethod.Delete, $"/api/v1/oauth/applications/{clientId}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await owner.SendAsync(HttpMethod.Get, $"/api/v1/oauth/applications/{clientId}")).StatusCode);
    }

    [Fact]
    public async Task EachTypeGetsItsSecretAndGrants()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient owner = new(factory);
        await owner.RegisterAndSignInAsync("PolicyOwner3", "owner3@example.com");
        (_, string? web) = await owner.RegisterApplicationAsync("profile");
        (_, string? spa) = await owner.RegisterApplicationAsync("profile", kind: "spa",
            redirectUris: "https://app.example/callback");
        (_, string? mobile) = await owner.RegisterApplicationAsync("profile", kind: "mobile",
            redirectUris: "com.example.app:/callback");
        (string serviceId, string? service) = await owner.RegisterServiceAsync();
        Assert.NotNull(web);
        Assert.Null(spa);
        Assert.Null(mobile);
        Assert.NotNull(service);

        // A service never reaches the sign-in or consent page.
        HttpResponseMessage authorize = await owner.Browser.GetAsync(OAuthTestClient.AuthorizePath(serviceId, "openid",
            OAuthTestClient.Pkce().Challenge), Cancel);
        Assert.Equal(HttpStatusCode.BadRequest, authorize.StatusCode);
        // A web application does not use the client credentials grant; that is what a service token is for.
        (string webId, string? webSecret) = await owner.RegisterApplicationAsync("profile");
        (HttpStatusCode status, JsonElement error) = await owner.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials", ["client_id"] = webId, ["client_secret"] = webSecret!
        });
        Assert.Equal(HttpStatusCode.BadRequest, status);
        Assert.Equal("unauthorized_client", error.GetProperty("error").GetString());
    }

    [Fact]
    public async Task RotatingTheSecretRetiresTheOldOne()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient owner = new(factory);
        await owner.RegisterAndSignInAsync("PolicyOwner2", "owner2@example.com");
        (string clientId, string? secret) = await owner.RegisterServiceAsync();

        HttpResponseMessage rotated = await owner.SendAsync(HttpMethod.Post,
            $"/api/v1/oauth/applications/{clientId}/secret");
        JsonElement credentials = await rotated.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        string newSecret = credentials.GetProperty("clientSecret").GetString()!;
        Assert.NotEqual(secret, newSecret);

        (HttpStatusCode old, _) = await owner.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials", ["client_id"] = clientId, ["client_secret"] = secret!
        });
        (HttpStatusCode current, _) = await owner.TokenAsync(new Dictionary<string, string>
        {
            ["grant_type"] = "client_credentials", ["client_id"] = clientId, ["client_secret"] = newSecret
        });
        Assert.Equal(HttpStatusCode.Unauthorized, old);
        Assert.Equal(HttpStatusCode.OK, current);
    }

    [Fact]
    public async Task TheTokenEndpointAnswersOnlyTheOriginsOfSinglePageApplications()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient owner = new(factory);
        await owner.RegisterAndSignInAsync("PolicyOwner4", "owner4@example.com");
        await owner.RegisterApplicationAsync("profile", kind: "spa", redirectUris: "https://app.example/callback");
        // A web application on another origin does not open that origin to the browser.
        await owner.RegisterApplicationAsync("profile", redirectUris: "https://server.example/callback");
        using HttpClient client = factory.CreateOAuthClient();

        async Task<HttpResponseMessage> PreflightAsync(string path, string origin)
        {
            HttpRequestMessage request = new(HttpMethod.Options, path);
            request.Headers.Add("Origin", origin);
            request.Headers.Add("Access-Control-Request-Method", "POST");
            return await client.SendAsync(request, Cancel);
        }

        HttpResponseMessage allowed = await PreflightAsync("/connect/token", "https://app.example");
        Assert.Equal(HttpStatusCode.NoContent, allowed.StatusCode);
        Assert.Equal("https://app.example", allowed.Headers.GetValues("Access-Control-Allow-Origin").Single());
        Assert.False(allowed.Headers.Contains("Access-Control-Allow-Credentials"));
        foreach (string origin in new[]
                 {
                     "https://server.example", "https://attacker.example", "https://app.example.attacker.example",
                     "https://app.example/callback", "null"
                 })
        {
            HttpResponseMessage refused = await PreflightAsync("/connect/token", origin);
            Assert.False(refused.Headers.Contains("Access-Control-Allow-Origin"), origin);
        }

        HttpRequestMessage discovery = new(HttpMethod.Get, "/.well-known/openid-configuration");
        discovery.Headers.Add("Origin", "https://anyone.example");
        HttpResponseMessage document = await client.SendAsync(discovery, Cancel);
        Assert.Equal("*", document.Headers.GetValues("Access-Control-Allow-Origin").Single());
    }

    [Fact]
    public void ProductionSharesTheAccountSessionWithTheConsoleUnderProgmasoftCom()
    {
        // The console has no sign-in of its own: it reads the account session, so production shares that cookie with
        // progmasoft.com. A cookie with a domain cannot keep the __Host- prefix; it takes __Secure-.
        using JsonDocument settings = JsonDocument.Parse(File.ReadAllText(
            Path.Combine(AppContext.BaseDirectory, "appsettings.json")));
        JsonElement sessions = settings.RootElement.GetProperty("AccountSessions");
        Assert.Equal("__Secure-ProgmasoftSession", sessions.GetProperty("CookieName").GetString());
        Assert.Equal("progmasoft.com", sessions.GetProperty("CookieDomain").GetString());

        Progmasoft.Progmaweb.Api.Accounts.SessionService service = new(null!, TimeProvider.System,
            Microsoft.Extensions.Options.Options.Create(new Progmasoft.Progmaweb.Api.Accounts.AccountSessionOptions
            {
                CookieName = "__Secure-ProgmasoftSession",
                CookieDomain = "progmasoft.com"
            }));
        Microsoft.AspNetCore.Http.CookieOptions cookie = service.CreateCookieOptions(DateTimeOffset.UnixEpoch);
        Assert.Equal("progmasoft.com", cookie.Domain);
        Assert.True(cookie.Secure);
        Assert.True(cookie.HttpOnly);
        Assert.Equal(Microsoft.AspNetCore.Http.SameSiteMode.Lax, cookie.SameSite);
    }

    [Fact]
    public void TheSchemaStepIsWhatEntityFrameworkGeneratesForTheModel()
    {
        DbContextOptions<OAuthDbContext> options = new DbContextOptionsBuilder<OAuthDbContext>()
            .UseNpgsql("Host=unused").UseOpenIddict().Options;
        using OAuthDbContext context = new(options);
        static string Normalize(string sql) => string.Join('\n', sql.Replace("\r\n", "\n").Split('\n')
            .Select(line => line.Trim()).Where(line => line.Length != 0));
        Assert.Equal(Normalize(context.Database.GenerateCreateScript()), Normalize(OAuthSchema.ModelScript));
    }
}
