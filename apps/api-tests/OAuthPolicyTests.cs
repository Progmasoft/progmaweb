// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Progmasoft.OAuth.Developers;
using Progmasoft.OAuth.Pages;
using Progmasoft.OAuth.Storage;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class OAuthPolicyTests
{
    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Theory]
    [InlineData("https://client.example/callback", false, true)]
    [InlineData("http://127.0.0.1:8400/callback", false, true)]
    [InlineData("http://[::1]:8400/callback", false, true)]
    [InlineData("http://localhost:3000/callback", false, true)]
    [InlineData("http://client.example/callback", false, false)]
    [InlineData("https://client.example/callback#fragment", false, false)]
    [InlineData("https://user:password@client.example/callback", false, false)]
    [InlineData("https://*.client.example/callback", false, false)]
    [InlineData("com.example.app:/callback", true, true)]
    [InlineData("com.example.app:/callback", false, false)]
    [InlineData("javascript:alert(1)", true, false)]
    [InlineData("data:text/html,x", true, false)]
    [InlineData("myapp:/callback", true, false)]
    [InlineData("/relative/callback", false, false)]
    public void RedirectionAddressesFollowRfc8252(string address, bool isPublic, bool accepted) =>
        Assert.Equal(accepted, ApplicationPolicy.IsRedirectionAddress(address, isPublic));

    [Fact]
    public void ARegistrationIsCheckedFieldByField()
    {
        Dictionary<string, string> errors = ApplicationPolicy.Validate(new ApplicationInput(
            "x", "http://plain.example", true, [], [], ["profile", "not-a-scope"], true));
        Assert.Equal(["allowClientCredentials", "displayName", "homepage", "redirectUris", "scopes"],
            errors.Keys.Order(StringComparer.Ordinal));
        Assert.Empty(ApplicationPolicy.Validate(new ApplicationInput(
            "Example", string.Empty, false, ["https://client.example/callback"], [], ["profile"], true)));
    }

    [Fact]
    public async Task TheDiscoveryDocumentOffersOnlyOAuth21Flows()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateOAuthClient();
        JsonElement document = await client.GetFromJsonAsync<JsonElement>("/.well-known/openid-configuration", Cancel);

        Assert.Equal($"https://{AccountApiFactory.OAuthHost}/", document.GetProperty("issuer").GetString());
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
        Assert.Equal(HttpStatusCode.NotFound, (await accounts.GetAsync("/signin", Cancel)).StatusCode);
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

        using HttpClient anonymous = factory.CreateOAuthClient();
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
    public async Task TheSignInPageGivesOneMessageForEveryFailureAndKeepsReturnAddressesLocal()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient browser = new(factory);
        HttpResponseMessage failed = await browser.SubmitAsync("/signin", "/signin", new Dictionary<string, string>
        {
            ["email"] = "nobody@example.com",
            ["password"] = "wrong password here",
            ["returnUrl"] = "https://attacker.example/"
        });
        Assert.Equal(HttpStatusCode.Unauthorized, failed.StatusCode);
        string html = await failed.Content.ReadAsStringAsync(Cancel);
        Assert.Contains("The email address or the password is not right.", html, StringComparison.Ordinal);
        Assert.Contains("name=\"returnUrl\" value=\"/\"", html, StringComparison.Ordinal);

        HttpResponseMessage forged = await browser.Browser.PostAsync("/signin", new FormUrlEncodedContent(
            new Dictionary<string, string> { ["email"] = "a@example.com", ["password"] = "x" }), Cancel);
        Assert.Equal(HttpStatusCode.BadRequest, forged.StatusCode);

        Assert.Equal("/", OAuthAccount.LocalReturnUrl("//attacker.example"));
        Assert.Equal("/", OAuthAccount.LocalReturnUrl("/\\attacker.example"));
        Assert.Equal("/developers", OAuthAccount.LocalReturnUrl("/developers"));
    }

    [Fact]
    public async Task ThePortalRefusesBadAddressesAndHidesOtherAccountsApplications()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient owner = new(factory);
        await owner.RegisterAndSignInAsync("PolicyOwner1", "owner1@example.com");
        (string clientId, _) = await owner.RegisterApplicationAsync("profile");

        HttpResponseMessage refused = await owner.SubmitAsync("/developers/new", "/developers/new",
            new Dictionary<string, string>
            {
                ["displayName"] = "Plain HTTP",
                ["clientType"] = "confidential",
                ["redirectUris"] = "http://plain.example/callback"
            });
        Assert.Equal(HttpStatusCode.BadRequest, refused.StatusCode);
        Assert.Contains("cannot be registered", await refused.Content.ReadAsStringAsync(Cancel),
            StringComparison.Ordinal);

        OAuthTestClient stranger = new(factory);
        await stranger.RegisterAndSignInAsync("PolicyStranger1", "stranger1@example.com");
        Assert.Equal(HttpStatusCode.NotFound,
            (await stranger.Browser.GetAsync($"/developers/{clientId}", Cancel)).StatusCode);
        HttpResponseMessage deleted = await stranger.SubmitAsync("/", $"/developers/{clientId}/delete", []);
        Assert.Equal(HttpStatusCode.NotFound, deleted.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await owner.Browser.GetAsync($"/developers/{clientId}", Cancel)).StatusCode);

        HttpResponseMessage ownDelete = await owner.SubmitAsync($"/developers/{clientId}",
            $"/developers/{clientId}/delete", []);
        Assert.Equal(HttpStatusCode.Redirect, ownDelete.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await owner.Browser.GetAsync($"/developers/{clientId}", Cancel)).StatusCode);
    }

    [Fact]
    public async Task RotatingTheSecretRetiresTheOldOne()
    {
        await using AccountApiFactory factory = new();
        OAuthTestClient owner = new(factory);
        await owner.RegisterAndSignInAsync("PolicyOwner2", "owner2@example.com");
        (string clientId, string? secret) = await owner.RegisterApplicationAsync("profile", clientCredentials: true);

        HttpResponseMessage rotated = await owner.SubmitAsync($"/developers/{clientId}",
            $"/developers/{clientId}/secret", []);
        string html = await rotated.Content.ReadAsStringAsync(Cancel);
        string newSecret = System.Web.HttpUtility.HtmlDecode(
            System.Text.RegularExpressions.Regex.Matches(html, "<code>([^<]*)</code>")[1].Groups[1].Value);
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
    public async Task PagesAllowTheirStylesheetByDigestAndNoScript()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateOAuthClient();
        HttpResponseMessage response = await client.GetAsync("/signin", Cancel);
        string policy = string.Join(";", response.Headers.GetValues("Content-Security-Policy"));
        string digest = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(HtmlPage.Stylesheet)));
        Assert.Contains($"style-src 'sha256-{digest}'", policy, StringComparison.Ordinal);
        Assert.Contains("default-src 'none'", policy, StringComparison.Ordinal);
        Assert.Contains("frame-ancestors 'none'", policy, StringComparison.Ordinal);
        Assert.DoesNotContain("script-src", policy, StringComparison.Ordinal);
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
