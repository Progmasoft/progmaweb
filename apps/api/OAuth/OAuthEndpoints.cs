// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Progmasoft.OAuth.Api;
using Progmasoft.OAuth.Endpoints;

namespace Progmasoft.OAuth;

/// <summary>Maps every endpoint of Progmasoft OAuth.</summary>
/// <remarks>
/// The pages of the OAuth host (sign-in, consent, the developer portal and the allowed applications) belong to the
/// Progmasoft site, which runs on Next.js; they call the JSON endpoints under <c>/api/v1/oauth</c>.
/// </remarks>
internal static class OAuthEndpoints
{
    /// <summary>Maps the endpoints. <see cref="OAuthHostFilter"/> keeps them on the OAuth host.</summary>
    /// <param name="app">The application.</param>
    public static void MapProgmasoftOAuth(this WebApplication app)
    {
        app.MapAuthorizationEndpoints();
        RouteGroupBuilder api = app.MapGroup("/api/v1/oauth");
        api.MapSessionEndpoints();
        api.MapApplicationEndpoints();
        api.MapAllowedApplicationEndpoints();
        api.MapConsentEndpoints();
    }
}
