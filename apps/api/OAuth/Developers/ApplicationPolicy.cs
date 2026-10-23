// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net;

namespace Progmasoft.OAuth.Developers;

/// <summary>What a developer submits to register or change an application.</summary>
/// <param name="DisplayName">The name the consent page shows.</param>
/// <param name="Homepage">The address of the application's site, or empty.</param>
/// <param name="Kind">The type of the application; it decides the secret, the grants and the address rules.</param>
/// <param name="RedirectUris">The addresses the authorization endpoint may send the account holder back to.</param>
/// <param name="PostLogoutRedirectUris">The addresses the end-session endpoint may send the account holder back to.</param>
/// <param name="Scopes">The scopes the application may request.</param>
internal sealed record ApplicationInput(
    string DisplayName,
    string Homepage,
    ApplicationKind Kind,
    IReadOnlyList<string> RedirectUris,
    IReadOnlyList<string> PostLogoutRedirectUris,
    IReadOnlyList<string> Scopes);

/// <summary>The rules an application registration must follow.</summary>
/// <remarks>
/// Redirection addresses are compared exactly by the authorization server, so the rules here only decide which
/// addresses each type may register: web and single-page applications use HTTPS, or an <c>http</c> loopback address
/// during development; desktop applications a loopback address or a private-use scheme, mobile applications a
/// private-use scheme or a claimed HTTPS address, as RFC 8252 describes. A service signs nobody in and registers
/// none. A fragment, user information or a wildcard is never accepted.
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

        if (!input.Kind.SignsPeopleIn())
        {
            // A service acts as itself: nobody is sent to it after signing in, and no account consents to it.
            if (input.RedirectUris.Count != 0 || input.PostLogoutRedirectUris.Count != 0)
            {
                errors["redirectUris"] = "A service signs nobody in and registers no redirection address.";
            }

            if (input.Scopes.Count != 0)
            {
                errors["scopes"] = "A service acts as itself and requests no account scope.";
            }

            return errors;
        }

        if (input.RedirectUris.Count is 0 or > MaximumRedirectUris)
        {
            errors["redirectUris"] = $"Register 1 to {MaximumRedirectUris} redirection addresses, one per line.";
        }
        else if (input.RedirectUris.FirstOrDefault(uri => !IsRedirectionAddress(uri, input.Kind)) is { } wrong)
        {
            errors["redirectUris"] = $"{wrong} cannot be registered. {AddressRule(input.Kind)}";
        }

        if (input.PostLogoutRedirectUris.Count > MaximumRedirectUris)
        {
            errors["postLogoutRedirectUris"] = $"Register at most {MaximumRedirectUris} addresses.";
        }
        else if (input.PostLogoutRedirectUris.FirstOrDefault(uri => !IsRedirectionAddress(uri, input.Kind)) is
                 { } wrongLogout)
        {
            errors["postLogoutRedirectUris"] = $"{wrongLogout} cannot be registered. {AddressRule(input.Kind)}";
        }

        if (input.Scopes.Any(scope => OAuthScopes.Find(scope) is null))
        {
            errors["scopes"] = "Choose scopes from the list.";
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

    /// <summary>The rule for redirection addresses, as the refusal message states it.</summary>
    private static string AddressRule(ApplicationKind kind) => kind switch
    {
        ApplicationKind.Desktop =>
            "Use http:// with a loopback address, or a private-use scheme such as com.example.app:/callback.",
        ApplicationKind.Mobile =>
            "Use a private-use scheme such as com.example.app:/callback, or an https:// address the app claims.",
        _ => "Use https://, or http:// with a loopback address for development."
    };

    /// <summary>Whether text is an absolute <c>https://</c> address without fragment or user information.</summary>
    private static bool IsHttpsAddress(string text) =>
        text.Length <= MaximumUriLength
        && Uri.TryCreate(text, UriKind.Absolute, out Uri? uri)
        && uri.Scheme == Uri.UriSchemeHttps
        && IsClean(uri);

    /// <summary>Whether an address may be registered for redirection by an application of a type.</summary>
    /// <param name="text">The address.</param>
    /// <param name="kind">The type of the application.</param>
    /// <returns><see langword="true"/> when the address follows the rules above.</returns>
    internal static bool IsRedirectionAddress(string text, ApplicationKind kind)
    {
        if (text.Length > MaximumUriLength || text.Contains('*', StringComparison.Ordinal)
            || !Uri.TryCreate(text, UriKind.Absolute, out Uri? uri) || !IsClean(uri))
        {
            return false;
        }

        bool https = uri.Scheme == Uri.UriSchemeHttps;
        // RFC 8252 section 7.3: loopback, never a host name that DNS could point elsewhere, except localhost
        // during development.
        bool loopback = uri.Scheme == Uri.UriSchemeHttp
                        && (uri.Host == "localhost"
                            || (IPAddress.TryParse(uri.Host.Trim('[', ']'), out IPAddress? address)
                                && IPAddress.IsLoopback(address)));
        // RFC 8252 section 7.1: a private-use scheme names the application in reverse DNS order, so it contains a
        // dot; javascript:, data: and the like are refused by that rule as well as by the explicit list.
        string[] refused = ["javascript", "data", "file", "vbscript", "about", "blob"];
        bool privateUse = !https && uri.Scheme != Uri.UriSchemeHttp
                          && uri.Scheme.Contains('.', StringComparison.Ordinal) && !refused.Contains(uri.Scheme);
        return kind switch
        {
            ApplicationKind.Web or ApplicationKind.SinglePage => https || loopback,
            ApplicationKind.Desktop => loopback || privateUse,
            // RFC 8252 section 7.2: a claimed https:// address (Universal Links, App Links) or a private-use scheme.
            ApplicationKind.Mobile => https || privateUse,
            _ => false
        };
    }

    /// <summary>Whether an address has neither a fragment nor user information.</summary>
    private static bool IsClean(Uri uri) => uri.Fragment.Length == 0 && uri.UserInfo.Length == 0;
}
