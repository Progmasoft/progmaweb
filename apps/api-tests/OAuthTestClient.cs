// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Web;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>An account holder in a browser on the OAuth host, and a developer's client application.</summary>
/// <remarks>
/// The pages of the OAuth host are Next.js pages that call the JSON endpoints under <c>/api/v1/oauth</c> and post
/// the consent decision to <c>/connect/authorize</c>; this makes the same requests, with the <c>Origin</c> header a
/// browser sends.
/// </remarks>
internal sealed class OAuthTestClient(AccountApiFactory factory)
{
    public const string RedirectUri = "https://client.example/callback";

    public const string Origin = $"https://{AccountApiFactory.AuthorizeHost}";

    public const string ConsoleOrigin = $"https://{AccountApiFactory.ConsoleHost}";

    /// <summary>The browser on the authorize host, where people sign in and decide.</summary>
    public HttpClient Browser { get; } = factory.CreateAuthorizeClient();

    /// <summary>The same browser on the Progmasoft Console, signed in with the Progmasoft account session.</summary>
    public HttpClient Console { get; private set; } = factory.CreateConsoleClient();

    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    /// <summary>Creates an account through the account API and signs it in to the OAuth host.</summary>
    public async Task<string> RegisterAndSignInAsync(string accountName, string email)
    {
        using HttpClient accounts = factory.CreateAccountClient(handleCookies: false);
        HttpResponseMessage registered = await accounts.PostAsJsonAsync("/api/v1/accounts/register",
            new { accountName, email, password = "correct horse battery staple" }, Cancel);
        Assert.Equal(HttpStatusCode.Created, registered.StatusCode);
        // The console knows the account of the Progmasoft account session; it has no sign-in of its own.
        string session = registered.Headers.GetValues("Set-Cookie")
            .Single(cookie => cookie.StartsWith("__Host-ProgmasoftSession=", StringComparison.Ordinal))
            .Split(';')[0];
        Console = factory.CreateConsoleClient(session);

        HttpResponseMessage signedIn = await SendAsync(HttpMethod.Post, "/api/v1/oauth/signin",
            new { email, password = "correct horse battery staple" });
        Assert.Equal(HttpStatusCode.OK, signedIn.StatusCode);
        return accountName;
    }

    /// <summary>Makes a token in the developer portal and returns its identifier and secret.</summary>
    public async Task<(string ClientId, string? Secret)> RegisterApplicationAsync(
        string scopes = "profile email offline_access viget.packages.read",
        string kind = "web",
        string redirectUris = RedirectUri)
    {
        HttpResponseMessage response = await SendAsync(HttpMethod.Post, "/api/v1/oauth/applications", new
        {
            kind,
            displayName = "Example Client",
            homepage = "https://client.example",
            redirectUris = redirectUris.Split('\n', StringSplitOptions.RemoveEmptyEntries),
            postLogoutRedirectUris = kind is "web" or "spa" ? new List<string> { "https://client.example/signed-out" } : [],
            scopes = scopes.Split(' ', StringSplitOptions.RemoveEmptyEntries)
        });
        JsonElement body = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(response.StatusCode == HttpStatusCode.Created, body.ToString());
        string clientId = body.GetProperty("application").GetProperty("clientId").GetString()!;
        Assert.StartsWith("pmo_", clientId, StringComparison.Ordinal);
        JsonElement secret = body.GetProperty("clientSecret");
        return (clientId, secret.ValueKind == JsonValueKind.Null ? null : secret.GetString());
    }

    /// <summary>Makes a service token, which acts as itself with the client credentials grant.</summary>
    public Task<(string ClientId, string? Secret)> RegisterServiceAsync() =>
        RegisterApplicationAsync(scopes: string.Empty, kind: "service", redirectUris: string.Empty);

    /// <summary>
    /// Sends a request of a page, with a JSON body when one is given. Applications are managed in the console; every
    /// other path belongs to the OAuth host. The origin is the page's own unless another one is given.
    /// </summary>
    public Task<HttpResponseMessage> SendAsync(HttpMethod method, string path, object? body = null,
        string? origin = "", HttpClient? host = null)
    {
        host ??= path.StartsWith("/api/v1/oauth/applications", StringComparison.Ordinal) ? Console : Browser;
        HttpRequestMessage request = new(method, path);
        origin = origin == "" ? (host == Console ? ConsoleOrigin : Origin) : origin;
        if (origin is not null)
        {
            request.Headers.Add("Origin", origin);
        }

        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        return host.SendAsync(request, Cancel);
    }

    /// <summary>A PKCE verifier and its S256 challenge.</summary>
    public static (string Verifier, string Challenge) Pkce()
    {
        string verifier = Base64Url(RandomNumberGenerator.GetBytes(32));
        return (verifier, Base64Url(SHA256.HashData(Encoding.ASCII.GetBytes(verifier))));
    }

    /// <summary>The query of an authorization request.</summary>
    public static string AuthorizePath(string clientId, string scope, string? challenge, string redirectUri = RedirectUri,
        string responseType = "code", string? prompt = null)
    {
        Dictionary<string, string?> query = new()
        {
            ["response_type"] = responseType,
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["scope"] = scope,
            ["state"] = "state-123",
            ["nonce"] = "nonce-456",
            ["code_challenge"] = challenge,
            ["code_challenge_method"] = challenge is null ? null : "S256",
            ["prompt"] = prompt
        };
        return "/connect/authorize?" + string.Join('&', query.Where(pair => pair.Value is not null)
            .Select(pair => $"{pair.Key}={Uri.EscapeDataString(pair.Value!)}"));
    }

    /// <summary>
    /// Asks for an authorization and decides on the consent page; returns where the browser is sent at the end.
    /// </summary>
    public async Task<Uri> AuthorizeAsync(string clientId, string scope, string challenge, string decision = "allow",
        string redirectUri = RedirectUri)
    {
        HttpResponseMessage response = await Browser.GetAsync(
            AuthorizePath(clientId, scope, challenge, redirectUri), Cancel);
        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        Uri location = response.Headers.Location!;
        if (!IsConsentPage(location))
        {
            return location;
        }

        HttpResponseMessage described = await Browser.GetAsync("/api/v1/oauth/consent" + location.OriginalString[
            "/consent".Length..], Cancel);
        Assert.True(described.StatusCode == HttpStatusCode.OK, await described.Content.ReadAsStringAsync(Cancel));
        HttpResponseMessage decided = await DecideAsync(location, decision);
        Assert.Equal(HttpStatusCode.Redirect, decided.StatusCode);
        return decided.Headers.Location!;
    }

    /// <summary>Whether an address is the consent page of the OAuth host.</summary>
    public static bool IsConsentPage(Uri location) =>
        !location.IsAbsoluteUri && location.OriginalString.StartsWith("/consent?", StringComparison.Ordinal);

    /// <summary>Posts the decision of the consent page back to the authorization endpoint, as its form does.</summary>
    public Task<HttpResponseMessage> DecideAsync(Uri consentPage, string decision, string? origin = Origin)
    {
        var query = HttpUtility.ParseQueryString(consentPage.OriginalString["/consent".Length..]);
        List<KeyValuePair<string, string>> fields =
            query.AllKeys.Select(key => new KeyValuePair<string, string>(key!, query[key]!)).ToList();
        fields.Add(new("decision", decision));
        HttpRequestMessage request = new(HttpMethod.Post, "/connect/authorize")
        {
            Content = new FormUrlEncodedContent(fields)
        };
        if (origin is not null)
        {
            request.Headers.Add("Origin", origin);
        }

        return Browser.SendAsync(request, Cancel);
    }

    /// <summary>Posts to the token endpoint as a client would, from outside the browser.</summary>
    public async Task<(HttpStatusCode Status, JsonElement Body)> TokenAsync(Dictionary<string, string> fields)
    {
        using HttpClient client = factory.CreateOAuthClient();
        HttpResponseMessage response = await client.PostAsync("/connect/token", new FormUrlEncodedContent(fields), Cancel);
        return (response.StatusCode, await response.Content.ReadFromJsonAsync<JsonElement>(Cancel));
    }

    /// <summary>The payload of a JSON web token, without checking its signature.</summary>
    public static JsonElement Payload(string jwt)
    {
        string part = jwt.Split('.')[1].Replace('-', '+').Replace('_', '/');
        part = part.PadRight(part.Length + (4 - part.Length % 4) % 4, '=');
        return JsonDocument.Parse(Convert.FromBase64String(part)).RootElement.Clone();
    }

    /// <summary>A query parameter of an address.</summary>
    public static string? Query(Uri uri, string name) => HttpUtility.ParseQueryString(uri.Query)[name];

    private static string Base64Url(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
