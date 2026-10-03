// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Json;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>
/// The service without a Google client. It used to answer every request with 500, because the Google scheme was
/// registered with empty credentials and failed its option validation in the authentication middleware.
/// </summary>
public sealed class UnconfiguredGoogleTests
{
    [Theory]
    [InlineData("/api/v1/status", HttpStatusCode.OK)]
    [InlineData("/health", HttpStatusCode.OK)]
    [InlineData("/api/v1/accounts/me", HttpStatusCode.Unauthorized)]
    public async Task OrdinaryRoutesAnswerWithoutGoogle(string path, HttpStatusCode expected)
    {
        await using AccountApiFactory factory = new(configureGoogle: false);
        using HttpClient client = factory.CreateAccountClient();

        HttpResponseMessage response = await client.GetAsync(path, TestContext.Current.CancellationToken);

        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task PasswordAccountsWorkWithoutGoogle()
    {
        await using AccountApiFactory factory = new(configureGoogle: false);
        using HttpClient client = factory.CreateAccountClient();
        const string password = "a sufficiently long passphrase";

        HttpResponseMessage registration = await client.PostAsJsonAsync(
            "/api/v1/accounts/register",
            new RegisterAccountRequest("LocalUser1", "local@example.com", password),
            TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);

        // The registration set the session cookie, so the same client is now signed in.
        HttpResponseMessage me = await client.GetAsync("/api/v1/accounts/me", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);

        HttpResponseMessage logout = await client.PostAsync(
            "/api/v1/accounts/logout", null, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        HttpResponseMessage login = await client.PostAsJsonAsync(
            "/api/v1/accounts/login",
            new LoginAccountRequest("local@example.com", password),
            TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
    }

    [Fact]
    public async Task GoogleStartReportsThatSignInIsUnavailable()
    {
        await using AccountApiFactory factory = new(configureGoogle: false);
        using HttpClient client = factory.CreateAccountClient(handleCookies: false);

        HttpResponseMessage response = await client.GetAsync(
            "/api/v1/accounts/oauth/google/start?accountName=GoogleUser",
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Null(response.Headers.Location);
    }

    [Fact]
    public async Task GoogleCompleteFailsClosedWithoutGoogle()
    {
        await using AccountApiFactory factory = new(configureGoogle: false);
        using HttpClient client = factory.CreateAccountClient(handleCookies: false);

        HttpResponseMessage response = await client.GetAsync(
            "/api/v1/accounts/oauth/google/complete", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        Assert.Equal("/login?google=failed", response.Headers.Location?.OriginalString);
        Assert.False(response.Headers.Contains("Set-Cookie"));
    }

    [Fact]
    public async Task GoogleCallbackIsNotARouteWithoutGoogle()
    {
        await using AccountApiFactory factory = new(configureGoogle: false);
        using HttpClient client = factory.CreateAccountClient(handleCookies: false);

        HttpResponseMessage response = await client.GetAsync(
            "/api/v1/accounts/oauth/google/callback", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
