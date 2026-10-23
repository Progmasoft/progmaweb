// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Web;

namespace Progmasoft.Progmaweb.Api.Tests;

/// <summary>An account holder in a browser on the OAuth host, and a developer's client application.</summary>
/// <remarks>The pages are plain HTML forms; this fills them the way a browser would.</remarks>
internal sealed partial class OAuthTestClient(AccountApiFactory factory)
{
    public const string RedirectUri = "https://client.example/callback";

    public HttpClient Browser { get; } = factory.CreateOAuthClient();

    private static CancellationToken Cancel => TestContext.Current.CancellationToken;

    /// <summary>Creates an account through the account API and signs it in to the OAuth host.</summary>
    public async Task<string> RegisterAndSignInAsync(string accountName, string email)
    {
        using HttpClient accounts = factory.CreateAccountClient(handleCookies: false);
        HttpResponseMessage registered = await accounts.PostAsJsonAsync("/api/v1/accounts/register",
            new { accountName, email, password = "correct horse battery staple" }, Cancel);
        Assert.Equal(HttpStatusCode.Created, registered.StatusCode);

        HttpResponseMessage signedIn = await SubmitAsync("/signin", "/signin", new Dictionary<string, string>
        {
            ["email"] = email,
            ["password"] = "correct horse battery staple",
            ["returnUrl"] = "/"
        });
        Assert.Equal(HttpStatusCode.Redirect, signedIn.StatusCode);
        return accountName;
    }

    /// <summary>Registers an application in the developer portal and returns its identifier and secret.</summary>
    public async Task<(string ClientId, string? Secret)> RegisterApplicationAsync(
        string scopes = "profile email offline_access viget.packages.read",
        bool isPublic = false,
        bool clientCredentials = false,
        string redirectUris = RedirectUri)
    {
        List<KeyValuePair<string, string>> fields =
        [
            new("displayName", "Example Client"),
            new("homepage", "https://client.example"),
            new("clientType", isPublic ? "public" : "confidential"),
            new("redirectUris", redirectUris),
            new("postLogoutRedirectUris", "https://client.example/signed-out")
        ];
        fields.AddRange(scopes.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(scope => new KeyValuePair<string, string>("scope", scope)));
        if (clientCredentials)
        {
            fields.Add(new("allowClientCredentials", "on"));
        }

        HttpResponseMessage response = await SubmitAsync("/developers/new", "/developers/new", fields);
        string html = await response.Content.ReadAsStringAsync(Cancel);
        Assert.True(response.StatusCode == HttpStatusCode.OK, html);
        MatchCollection codes = CodePattern().Matches(html);
        string clientId = codes[0].Groups[1].Value;
        Assert.StartsWith("pmo_", clientId, StringComparison.Ordinal);
        return (clientId, isPublic ? null : HttpUtility.HtmlDecode(codes[1].Groups[1].Value));
    }

    /// <summary>Loads a page with a form, then posts the form with the given fields and its token.</summary>
    public async Task<HttpResponseMessage> SubmitAsync(
        string page,
        string action,
        IEnumerable<KeyValuePair<string, string>> fields)
    {
        string html = await (await Browser.GetAsync(page, Cancel)).Content.ReadAsStringAsync(Cancel);
        return await Browser.PostAsync(action, new FormUrlEncodedContent(
            fields.Append(new("form-token", FormToken(html)))), Cancel);
    }

    /// <summary>The token of the first form of a page.</summary>
    public static string FormToken(string html) =>
        HttpUtility.HtmlDecode(TokenPattern().Match(html).Groups[1].Value);

    /// <summary>Every hidden field of the first form of a page, the token included.</summary>
    public static List<KeyValuePair<string, string>> HiddenFields(string html) => HiddenPattern().Matches(html)
        .Select(match => new KeyValuePair<string, string>(
            HttpUtility.HtmlDecode(match.Groups[1].Value), HttpUtility.HtmlDecode(match.Groups[2].Value)))
        .ToList();

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

    /// <summary>Asks for an authorization and allows it on the consent page; returns the redirection.</summary>
    public async Task<Uri> AuthorizeAsync(string clientId, string scope, string challenge, string decision = "allow")
    {
        HttpResponseMessage consent = await Browser.GetAsync(AuthorizePath(clientId, scope, challenge), Cancel);
        if (consent.StatusCode == HttpStatusCode.Redirect)
        {
            return consent.Headers.Location!;
        }

        string html = await consent.Content.ReadAsStringAsync(Cancel);
        Assert.True(consent.StatusCode == HttpStatusCode.OK, html);
        List<KeyValuePair<string, string>> fields = HiddenFields(html);
        fields.Add(new("decision", decision));
        HttpResponseMessage decided = await Browser.PostAsync("/connect/authorize", new FormUrlEncodedContent(fields), Cancel);
        Assert.Equal(HttpStatusCode.Redirect, decided.StatusCode);
        return decided.Headers.Location!;
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

    [GeneratedRegex("name=\"form-token\" value=\"([^\"]*)\"")]
    private static partial Regex TokenPattern();

    [GeneratedRegex("<input type=\"hidden\" name=\"([^\"]*)\" value=\"([^\"]*)\">")]
    private static partial Regex HiddenPattern();

    [GeneratedRegex("<code>([^<]*)</code>")]
    private static partial Regex CodePattern();
}
