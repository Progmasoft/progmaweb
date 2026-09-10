// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class AccountEndpointTests
{
    [Fact]
    public async Task GoogleStartUsesTheConfiguredCallbackAndPreservesAccountNameInState()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient(handleCookies: false);

        HttpResponseMessage response = await client.GetAsync(
            "/api/v1/accounts/oauth/google/start?accountName=GoogleUser",
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        Uri location = Assert.IsType<Uri>(response.Headers.Location);
        Assert.Equal("accounts.google.com", location.Host);
        Assert.Contains("redirect_uri=https%3A%2F%2Flocalhost%2Fapi%2Fv1%2Faccounts%2Foauth%2Fgoogle%2Fcallback",
            location.Query, StringComparison.Ordinal);
        Assert.Contains("state=", location.Query, StringComparison.Ordinal);
    }

    [Fact]
    public async Task GoogleStartRejectsInvalidAccountNameBeforeLeavingTheSite()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient(handleCookies: false);

        HttpResponseMessage response = await client.GetAsync(
            "/api/v1/accounts/oauth/google/start?accountName=lowercase",
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        Assert.Equal("/register?google=invalid-account-name", response.Headers.Location?.OriginalString);
    }

    [Fact]
    public async Task GoogleCompleteDoesNotIssueASessionForAnExistingPasswordAccountWithTheSameEmail()
    {
        await using AccountApiFactory factory = new();
        using HttpClient registrationClient = factory.CreateAccountClient();
        HttpResponseMessage registration =
            await RegisterAsync(registrationClient, "PasswordUser", "victim@example.com");
        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);

        IOptionsMonitor<CookieAuthenticationOptions> cookieOptions =
            factory.Services.GetRequiredService<IOptionsMonitor<CookieAuthenticationOptions>>();
        CookieAuthenticationOptions externalOptions = cookieOptions.Get(AccountEndpoints.ExternalCookieScheme);
        ClaimsPrincipal googlePrincipal = new(new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, "google-subject-victim"),
                new Claim(ClaimTypes.Email, "victim@example.com")
            ],
            "Google"));
        AuthenticationTicket googleTicket = new(
            googlePrincipal,
            new AuthenticationProperties(),
            AccountEndpoints.ExternalCookieScheme);
        string protectedTicket = externalOptions.TicketDataFormat.Protect(googleTicket);

        using HttpClient googleClient = factory.CreateAccountClient(handleCookies: false);
        using HttpRequestMessage request = new(HttpMethod.Get, "/api/v1/accounts/oauth/google/complete");
        request.Headers.Add("Cookie", $"{externalOptions.Cookie.Name}={protectedTicket}");
        HttpResponseMessage response =
            await googleClient.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        Assert.Equal("/login?google=failed", response.Headers.Location?.OriginalString);
        Assert.DoesNotContain(
            response.Headers.GetValues("Set-Cookie"),
            value => value.StartsWith("__Host-ProgmasoftSession=", StringComparison.Ordinal));
    }

    [Fact]
    public async Task RegisterCreatesSessionAndMeReturnsAccount()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage registration = await client.PostAsJsonAsync("/api/v1/accounts/register", new
        {
            accountName = "PrimaryUser",
            email = "leitwolf1112@gmail.com",
            password = "a-long-development-password"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);
        Assert.True(registration.Headers.TryGetValues("Set-Cookie", out IEnumerable<string>? cookies));
        string sessionCookie = Assert.Single(cookies);
        Assert.Contains("__Host-ProgmasoftSession=", sessionCookie, StringComparison.Ordinal);
        Assert.Contains("secure", sessionCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("httponly", sessionCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", sessionCookie, StringComparison.OrdinalIgnoreCase);

        HttpResponseMessage me =
            await client.GetAsync("/api/v1/accounts/me", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        using JsonDocument body =
            JsonDocument.Parse(await me.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal("PrimaryUser", body.RootElement.GetProperty("accountName").GetString());
        Assert.Equal("leitwolf1112@gmail.com", body.RootElement.GetProperty("email").GetString());
    }

    [Fact]
    public async Task LogoutRevokesCurrentSession()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage registration = await client.PostAsJsonAsync("/api/v1/accounts/register", new
        {
            accountName = "LogoutUser",
            email = "logout@example.com",
            password = "a-long-development-password"
        }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);

        Assert.Equal(HttpStatusCode.NoContent,
            (await client.PostAsync("/api/v1/accounts/logout", null, TestContext.Current.CancellationToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.GetAsync("/api/v1/accounts/me", TestContext.Current.CancellationToken)).StatusCode);
    }

    [Theory]
    [InlineData("lowercase")]
    [InlineData("Short7")]
    [InlineData("Contains-Dash")]
    [InlineData("ĞecersizAd")]
    [InlineData("Progmasoft")]
    [InlineData("Leitwolf")]
    public async Task RegisterRejectsInvalidOrReservedAccountName(string accountName)
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage response = await client.PostAsJsonAsync("/api/v1/accounts/register", new
        {
            accountName,
            email = $"{Guid.NewGuid():N}@example.com",
            password = "a-long-development-password"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        string body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("accountName", body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task EmailUniquenessIsCaseInsensitive()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage first = await RegisterAsync(client, "SampleUser", "Person@Example.com");
        HttpResponseMessage second = await RegisterAsync(client, "DifferentUser", "person@example.COM");

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
        Assert.Contains("email", await second.Content.ReadAsStringAsync(TestContext.Current.CancellationToken),
            StringComparison.Ordinal);
    }

    [Fact]
    public async Task AccountNameUniquenessIsCaseInsensitiveWhileDisplayCaseIsPreserved()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage first = await RegisterAsync(client, "SampleUser", "first-name@example.com");
        HttpResponseMessage second = await RegisterAsync(client, "SampleUSER", "second-name@example.com");

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
        Assert.Contains("accountName", await second.Content.ReadAsStringAsync(TestContext.Current.CancellationToken),
            StringComparison.Ordinal);
    }

    [Fact]
    public async Task DuplicateAccountNameIsRejectedWithoutChangingCase()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage first = await RegisterAsync(client, "UniqueName", "first@example.com");
        HttpResponseMessage second = await RegisterAsync(client, "UniqueName", "second@example.com");

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
        Assert.Contains("accountName", await second.Content.ReadAsStringAsync(TestContext.Current.CancellationToken),
            StringComparison.Ordinal);
    }

    [Fact]
    public async Task LoginUsesGenericFailureForUnknownEmailAndWrongPassword()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient();
        await RegisterAsync(client, "LoginUser", "login@example.com");
        await client.PostAsync("/api/v1/accounts/logout", null, TestContext.Current.CancellationToken);

        HttpResponseMessage missing = await client.PostAsJsonAsync("/api/v1/accounts/login", new
        {
            email = "missing@example.com",
            password = "a-long-development-password"
        }, TestContext.Current.CancellationToken);
        HttpResponseMessage wrong = await client.PostAsJsonAsync("/api/v1/accounts/login", new
        {
            email = "login@example.com",
            password = "a-long-but-incorrect-password"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, missing.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        using JsonDocument missingBody =
            JsonDocument.Parse(await missing.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        using JsonDocument wrongBody =
            JsonDocument.Parse(await wrong.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal(missingBody.RootElement.GetProperty("title").GetString(),
            wrongBody.RootElement.GetProperty("title").GetString());
        Assert.Equal(missingBody.RootElement.GetProperty("detail").GetString(),
            wrongBody.RootElement.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task StatusResponseAdvertisesProgmawebVersion()
    {
        await using AccountApiFactory factory = new();
        using HttpClient client = factory.CreateAccountClient(handleCookies: false);

        using JsonDocument body =
            JsonDocument.Parse(await client.GetStringAsync("/api/v1/status", TestContext.Current.CancellationToken));

        Assert.Equal("progmaweb-account", body.RootElement.GetProperty("service").GetString());
        Assert.Equal("online", body.RootElement.GetProperty("status").GetString());
        Assert.Equal("1.0.0", body.RootElement.GetProperty("version").GetString());
    }

    private static Task<HttpResponseMessage> RegisterAsync(HttpClient client, string accountName, string email) =>
        client.PostAsJsonAsync("/api/v1/accounts/register", new
        {
            accountName,
            email,
            password = "a-long-development-password"
        }, TestContext.Current.CancellationToken);
}
