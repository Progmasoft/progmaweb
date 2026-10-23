// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using OpenIddict.EntityFrameworkCore.Models;
using Progmasoft.OAuth.Developers;
using Progmasoft.OAuth.Storage;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Api;

/// <summary>Lets single-page applications call the token endpoints from the browser.</summary>
/// <remarks>
/// <para>
/// A single-page application has no server, so it exchanges its code and refreshes its tokens from the browser, on
/// another origin. The token, revocation and user information endpoints answer an origin only when a single-page
/// application registered a redirection address on it; every other origin gets no CORS header and the browser keeps
/// the response from the page.
/// </para>
/// <para>
/// The discovery documents and the signing keys are public and answer every origin. No response allows credentials:
/// the endpoints authenticate with PKCE and bearer tokens, never with a cookie.
/// </para>
/// </remarks>
/// <param name="next">The next middleware.</param>
internal sealed class OAuthCors(RequestDelegate next)
{
    /// <summary>The endpoints a single-page application calls from the browser.</summary>
    private static readonly string[] TokenPaths = ["/connect/token", "/connect/revoke", "/connect/userinfo"];

    /// <summary>The public documents of the server.</summary>
    private static readonly string[] PublicPaths =
        ["/.well-known/openid-configuration", "/.well-known/oauth-authorization-server", "/.well-known/jwks"];

    /// <summary>Adds the CORS headers a request may have, and answers its preflight.</summary>
    /// <param name="context">The request.</param>
    /// <param name="database">The OAuth tables.</param>
    /// <returns>A task that completes when the request has been answered.</returns>
    public async Task InvokeAsync(HttpContext context, OAuthDbContext database)
    {
        string? origin = context.Request.Headers.Origin;
        PathString path = context.Request.Path;
        bool isPublic = PublicPaths.Any(entry => path.Equals(entry, StringComparison.OrdinalIgnoreCase));
        bool isToken = TokenPaths.Any(entry => path.Equals(entry, StringComparison.OrdinalIgnoreCase));
        if (string.IsNullOrEmpty(origin) || !(isPublic || isToken))
        {
            await next(context);
            return;
        }

        IHeaderDictionary headers = context.Response.Headers;
        headers.Vary = "Origin";
        bool allowed = isPublic || await IsSinglePageOriginAsync(database, origin, context.RequestAborted);
        if (allowed)
        {
            headers.AccessControlAllowOrigin = isPublic ? "*" : origin;
        }

        if (HttpMethods.IsOptions(context.Request.Method)
            && context.Request.Headers.ContainsKey("Access-Control-Request-Method"))
        {
            if (allowed)
            {
                headers.AccessControlAllowMethods = "GET, POST";
                headers.AccessControlAllowHeaders = "Authorization, Content-Type";
                headers.AccessControlMaxAge = "600";
            }

            context.Response.StatusCode = StatusCodes.Status204NoContent;
            return;
        }

        await next(context);
    }

    /// <summary>Whether a single-page application registered a redirection address on an origin.</summary>
    /// <param name="database">The OAuth tables.</param>
    /// <param name="origin">The <c>Origin</c> header of the request.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns><see langword="true"/> when the origin belongs to a single-page application.</returns>
    internal static async Task<bool> IsSinglePageOriginAsync(
        OAuthDbContext database,
        string origin,
        CancellationToken cancellationToken)
    {
        // Only an origin that is exactly scheme, host and port is looked up; anything else is no origin of a page.
        if (!Uri.TryCreate(origin, UriKind.Absolute, out Uri? uri) || uri.Scheme is not ("https" or "http")
            || !string.Equals(uri.GetLeftPart(UriPartial.Authority), origin, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        // The stored addresses are a JSON array of strings, so every address on the origin contains it followed by
        // a slash. The candidates are then checked exactly.
        string prefix = $"\"{uri.GetLeftPart(UriPartial.Authority)}/";
        List<OpenIddictEntityFrameworkCoreApplication> candidates = await database
            .Set<OpenIddictEntityFrameworkCoreApplication>()
            .Where(application => application.ClientType == ClientTypes.Public && application.RedirectUris != null
                                  && application.RedirectUris.Contains(prefix))
            .Take(50)
            .ToListAsync(cancellationToken);
        return candidates.Any(application => IsSinglePage(application) && RedirectsTo(application, uri));
    }

    /// <summary>Whether a stored application is a single-page application.</summary>
    private static bool IsSinglePage(OpenIddictEntityFrameworkCoreApplication application)
    {
        if (string.IsNullOrEmpty(application.Properties))
        {
            return false;
        }

        using JsonDocument properties = JsonDocument.Parse(application.Properties);
        return properties.RootElement.TryGetProperty(ApplicationRegistry.KindProperty, out JsonElement kind)
               && kind.ValueKind is JsonValueKind.String
               && kind.GetString() == ApplicationKind.SinglePage.Slug();
    }

    /// <summary>Whether a stored application registered a redirection address on an origin.</summary>
    private static bool RedirectsTo(OpenIddictEntityFrameworkCoreApplication application, Uri origin)
    {
        string[] addresses = JsonSerializer.Deserialize<string[]>(application.RedirectUris!) ?? [];
        return addresses.Any(address => Uri.TryCreate(address, UriKind.Absolute, out Uri? uri)
                                        && Uri.Compare(uri, origin, UriComponents.SchemeAndServer,
                                            UriFormat.Unescaped, StringComparison.OrdinalIgnoreCase) == 0);
    }
}
