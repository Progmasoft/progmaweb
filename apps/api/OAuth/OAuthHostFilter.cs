// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.Extensions.Options;

namespace Progmasoft.OAuth;

/// <summary>Keeps Progmasoft OAuth on its own host, and the account API off it.</summary>
/// <remarks>
/// <para>
/// The account API and the OAuth provider run in one process. OpenIddict answers its endpoints on any host, so this
/// filter, placed before authentication, answers 404 for an OAuth path on another host: tokens are only ever issued
/// under the issuer's own name. On the OAuth host it answers 404 for everything but the OAuth paths and
/// <c>/health</c>, so that the account API, whose cookies belong to the account site, is not reachable there.
/// </para>
/// <para>Nginx routes the hosts the same way; this keeps the rule when a request reaches the process directly.</para>
/// </remarks>
/// <param name="next">The next middleware.</param>
/// <param name="options">The settings that name the OAuth host.</param>
internal sealed class OAuthHostFilter(RequestDelegate next, IOptions<OAuthOptions> options)
{
    /// <summary>Paths that only the OAuth host serves; a path is matched with its sub-paths.</summary>
    private static readonly string[] OAuthPaths =
    [
        "/connect",
        "/.well-known/openid-configuration",
        "/.well-known/oauth-authorization-server",
        "/.well-known/jwks",
        "/signin",
        "/signout",
        "/developers",
        "/account/applications"
    ];

    /// <summary>Answers 404 for a request on the wrong host, and passes the others on.</summary>
    /// <param name="context">The request.</param>
    /// <returns>A task that completes when the request has been answered.</returns>
    public Task InvokeAsync(HttpContext context)
    {
        PathString path = context.Request.Path;
        bool onOAuthHost = string.Equals(context.Request.Host.Host, options.Value.Host, StringComparison.OrdinalIgnoreCase);
        bool isOAuthPath = OAuthPaths.Any(prefix => path.StartsWithSegments(prefix, StringComparison.OrdinalIgnoreCase));
        bool allowed = onOAuthHost
            ? isOAuthPath || path == "/" || path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase)
            : !isOAuthPath;
        if (allowed)
        {
            return next(context);
        }

        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return Task.CompletedTask;
    }
}
