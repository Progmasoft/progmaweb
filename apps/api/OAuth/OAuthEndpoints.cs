// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Progmasoft.OAuth.Developers;
using Progmasoft.OAuth.Endpoints;
using Progmasoft.OAuth.Pages;

namespace Progmasoft.OAuth;

/// <summary>Maps every page and endpoint of Progmasoft OAuth.</summary>
internal static class OAuthEndpoints
{
    /// <summary>Maps the pages and endpoints. <see cref="OAuthHostFilter"/> keeps them on the OAuth host.</summary>
    /// <param name="app">The application.</param>
    public static void MapProgmasoftOAuth(this WebApplication app)
    {
        app.MapSignInPages();
        app.MapAuthorizationEndpoints();
        app.MapDeveloperPortal();
        app.MapAllowedApplications();
    }
}
