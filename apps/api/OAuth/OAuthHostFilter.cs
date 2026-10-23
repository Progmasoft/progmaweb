// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.Extensions.Options;

namespace Progmasoft.OAuth;

/// <summary>Keeps Progmasoft OAuth and the Progmasoft Console on their own hosts, and the account API off them.</summary>
/// <remarks>
/// <para>
/// The account API, the OAuth provider and the console run in one process. OpenIddict answers its endpoints on any
/// host, so this filter, placed before authentication, answers 404 for a path on the wrong host: tokens are only ever
/// issued under the issuer's own name, and applications are only managed in the console.
/// </para>
/// <para>
/// The issuer host serves the discovery documents, the key set and the endpoints clients call directly. The authorize
/// host serves the authorization and end session endpoints, sign-in, consent and the allowed applications. The
/// console host serves the applications and the account of the Progmasoft account session. All three serve
/// <c>/health</c> and nothing of the account API, whose cookies belong to the account site. Nginx routes the hosts
/// the same way; this keeps the rule when a request reaches the process directly.
/// </para>
/// </remarks>
/// <param name="next">The next middleware.</param>
/// <param name="options">The settings that name the hosts.</param>
internal sealed class OAuthHostFilter(RequestDelegate next, IOptions<OAuthOptions> options)
{
    /// <summary>Paths only the authorize host serves; a path is matched with its sub-paths.</summary>
    private static readonly string[] AuthorizePaths =
    [
        "/connect/authorize",
        "/connect/logout",
        "/api/v1/oauth/consent",
        "/api/v1/oauth/allowed",
        "/api/v1/oauth/signin",
        "/api/v1/oauth/signout"
    ];

    /// <summary>Paths only the issuer host serves, the authorize paths under <c>/connect</c> excepted.</summary>
    private static readonly string[] IssuerPaths =
    [
        "/connect",
        "/.well-known/openid-configuration",
        "/.well-known/oauth-authorization-server",
        "/.well-known/jwks"
    ];

    /// <summary>Paths only the console host serves.</summary>
    private static readonly string[] ConsolePaths = ["/api/v1/oauth/applications"];

    /// <summary>
    /// Paths the authorize and console hosts serve. The authorize host answers with its own sign-in, the console
    /// with the Progmasoft account session; the console has no sign-in of its own.
    /// </summary>
    private static readonly string[] SharedPaths = ["/api/v1/oauth/session"];

    /// <summary>Answers 404 for a request on the wrong host, and passes the others on.</summary>
    /// <param name="context">The request.</param>
    /// <returns>A task that completes when the request has been answered.</returns>
    public Task InvokeAsync(HttpContext context)
    {
        PathString path = context.Request.Path;
        string host = context.Request.Host.Host;
        OAuthOptions settings = options.Value;
        bool isAuthorizePath = Matches(path, AuthorizePaths);
        bool isIssuerPath = !isAuthorizePath && Matches(path, IssuerPaths);
        bool isConsolePath = Matches(path, ConsolePaths);
        bool isSharedPath = Matches(path, SharedPaths);
        bool isHealth = path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase);
        bool allowed = Is(host, settings.Host)
            ? isIssuerPath || isHealth
            : Is(host, settings.AuthorizeHost)
                ? isAuthorizePath || isSharedPath || isHealth
                : Is(host, settings.ConsoleHost)
                    ? isConsolePath || isSharedPath || isHealth
                    : !(isAuthorizePath || isIssuerPath || isConsolePath || isSharedPath);
        if (allowed)
        {
            return next(context);
        }

        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return Task.CompletedTask;
    }

    /// <summary>Whether a host name is the given one.</summary>
    private static bool Is(string host, string expected) =>
        string.Equals(host, expected, StringComparison.OrdinalIgnoreCase);

    /// <summary>Whether a path is one of the given paths or below one.</summary>
    private static bool Matches(PathString path, string[] prefixes) =>
        prefixes.Any(prefix => path.StartsWithSegments(prefix, StringComparison.OrdinalIgnoreCase));
}
