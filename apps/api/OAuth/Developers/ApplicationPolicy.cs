// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;

namespace Progmasoft.OAuth.Developers;

/// <summary>What a developer submits to register or change an application.</summary>
/// <param name="DisplayName">The name the consent page shows.</param>
/// <param name="Homepage">The address of the application's site, or empty.</param>
/// <param name="IsPublic">
/// Whether the application cannot keep a secret: a browser or native application. Such a client has no secret and
/// may not use the client credentials grant.
/// </param>
/// <param name="RedirectUris">The addresses the authorization endpoint may send the account holder back to.</param>
/// <param name="PostLogoutRedirectUris">The addresses the end-session endpoint may send the account holder back to.</param>
/// <param name="Scopes">The scopes the application may request.</param>
/// <param name="AllowClientCredentials">Whether the application may act as itself with the client credentials grant.</param>
internal sealed record ApplicationInput(
    string DisplayName,
    string Homepage,
    bool IsPublic,
    IReadOnlyList<string> RedirectUris,
    IReadOnlyList<string> PostLogoutRedirectUris,
    IReadOnlyList<string> Scopes,
    bool AllowClientCredentials);

/// <summary>The rules an application registration must follow.</summary>
/// <remarks>
/// Redirection addresses are compared exactly by the authorization server, so the rules here only decide which
/// addresses may be registered: HTTPS, an <c>http</c> loopback address for software on the developer's own
/// machine, or, for public clients, a private-use scheme of a native application as RFC 8252 describes. A
/// fragment, user information or a wildcard is never accepted.
/// </remarks>
internal static class ApplicationPolicy
{
    /// <summary>The most redirection addresses one application may register, of each kind.</summary>
    public const int MaximumRedirectUris = 10;

    /// <summary>The longest display name.</summary>
    public const int MaximumDisplayNameLength = 64;

    /// <summary>The longest address.</summary>
    public const int MaximumUriLength = 2000;

    /// <summary>Checks a submission.</summary>
    /// <param name="input">The submission.</param>
    /// <returns>The messages of each refused field, keyed by field name; empty when the submission is valid.</returns>
    public static Dictionary<string, string> Validate(ApplicationInput input)
    {
        Dictionary<string, string> errors = [];
        string name = input.DisplayName.Trim();
        if (name.Length is < 3 or > MaximumDisplayNameLength || name.Any(char.IsControl))
        {
            errors["displayName"] =
                $"Use 3 to {MaximumDisplayNameLength} characters, without control characters.";
        }

        if (input.Homepage.Length != 0 && !IsHttpsAddress(input.Homepage))
        {
            errors["homepage"] = "The homepage must be an https:// address.";
        }

        if (input.RedirectUris.Count is 0 or > MaximumRedirectUris)
        {
            errors["redirectUris"] = $"Register 1 to {MaximumRedirectUris} redirection addresses, one per line.";
        }
        else if (input.RedirectUris.FirstOrDefault(uri => !IsRedirectionAddress(uri, input.IsPublic)) is { } wrong)
        {
            errors["redirectUris"] = $"{wrong} cannot be registered. {AddressRule(input.IsPublic)}";
        }

        if (input.PostLogoutRedirectUris.Count > MaximumRedirectUris)
        {
            errors["postLogoutRedirectUris"] = $"Register at most {MaximumRedirectUris} addresses.";
        }
        else if (input.PostLogoutRedirectUris.FirstOrDefault(uri => !IsRedirectionAddress(uri, input.IsPublic)) is
                 { } wrongLogout)
        {
            errors["postLogoutRedirectUris"] = $"{wrongLogout} cannot be registered. {AddressRule(input.IsPublic)}";
        }

        if (input.Scopes.Any(scope => OAuthScopes.Find(scope) is null))
        {
            errors["scopes"] = "Choose scopes from the list.";
        }

        if (input.IsPublic && input.AllowClientCredentials)
        {
            errors["allowClientCredentials"] =
                "A public client has no secret and cannot use the client credentials grant.";
        }

        return errors;
    }

    /// <summary>Splits a text area into its non-empty lines.</summary>
    /// <param name="text">The submitted text.</param>
    /// <returns>Each line once, trimmed, in the submitted order.</returns>
    public static IReadOnlyList<string> Lines(string? text) => (text ?? string.Empty)
        .Split('\n')
        .Select(line => line.Trim())
        .Where(line => line.Length != 0)
        .Distinct(StringComparer.Ordinal)
        .ToList();

    private static string AddressRule(bool isPublic) => isPublic
        ? "Use https://, http:// with a loopback address, or a private-use scheme such as com.example.app:/callback."
        : "Use https://, or http:// with a loopback address for development.";

    private static bool IsHttpsAddress(string text) =>
        text.Length <= MaximumUriLength
        && Uri.TryCreate(text, UriKind.Absolute, out Uri? uri)
        && uri.Scheme == Uri.UriSchemeHttps
        && IsClean(uri);

    /// <summary>Whether an address may be registered for redirection.</summary>
    /// <param name="text">The address.</param>
    /// <param name="isPublic">Whether the application is a public client.</param>
    /// <returns><see langword="true"/> when the address follows the rules above.</returns>
    internal static bool IsRedirectionAddress(string text, bool isPublic)
    {
        if (text.Length > MaximumUriLength || text.Contains('*', StringComparison.Ordinal)
            || !Uri.TryCreate(text, UriKind.Absolute, out Uri? uri) || !IsClean(uri))
        {
            return false;
        }

        if (uri.Scheme == Uri.UriSchemeHttps)
        {
            return true;
        }

        if (uri.Scheme == Uri.UriSchemeHttp)
        {
            // RFC 8252 section 7.3: loopback, never a host name that DNS could point elsewhere, except localhost
            // during development.
            return uri.Host == "localhost" || (IPAddress.TryParse(uri.Host.Trim('[', ']'), out IPAddress? address)
                                               && IPAddress.IsLoopback(address));
        }

        // RFC 8252 section 7.1: a private-use scheme names the application in reverse DNS order, so it contains a
        // dot; javascript:, data: and the like are refused by that rule as well as by the explicit list.
        string[] refused = ["javascript", "data", "file", "vbscript", "about", "blob"];
        return isPublic && uri.Scheme.Contains('.', StringComparison.Ordinal) && !refused.Contains(uri.Scheme);
    }

    private static bool IsClean(Uri uri) => uri.Fragment.Length == 0 && uri.UserInfo.Length == 0;
}
