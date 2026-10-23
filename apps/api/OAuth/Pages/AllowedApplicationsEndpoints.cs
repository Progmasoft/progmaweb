// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Collections.Immutable;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Pages;

/// <summary>The applications an account has allowed, and withdrawing an allowance.</summary>
internal static class AllowedApplicationsEndpoints
{
    /// <summary>Maps the pages.</summary>
    /// <param name="app">The application.</param>
    public static void MapAllowedApplications(this WebApplication app)
    {
        app.MapGet("/account/applications", ListAsync);
        app.MapPost("/account/applications/{authorizationId}/revoke", RevokeAsync);
    }

    private static async Task<IResult> ListAsync(
        HttpContext context,
        IOpenIddictAuthorizationManager authorizations,
        IOpenIddictApplicationManager applications)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInFirst(context);
        }

        List<string> rows = [];
        await foreach (object authorization in authorizations.FindBySubjectAsync(account.Id.ToString(),
                           context.RequestAborted))
        {
            if (!await authorizations.HasStatusAsync(authorization, Statuses.Valid, context.RequestAborted)
                || !await authorizations.HasTypeAsync(authorization, AuthorizationTypes.Permanent, context.RequestAborted))
            {
                continue;
            }

            string? applicationId = await authorizations.GetApplicationIdAsync(authorization, context.RequestAborted);
            object? application = applicationId is null
                ? null
                : await applications.FindByIdAsync(applicationId, context.RequestAborted);
            string name = application is null
                ? "A deleted application"
                : await applications.GetDisplayNameAsync(application, context.RequestAborted) ?? "An application";
            ImmutableArray<string> scopes = await authorizations.GetScopesAsync(authorization, context.RequestAborted);
            string id = (await authorizations.GetIdAsync(authorization, context.RequestAborted))!;
            DateTimeOffset? created = await authorizations.GetCreationDateAsync(authorization, context.RequestAborted);
            string grants = string.Join(", ", scopes.Select(scope => $"<code>{HtmlPage.Encode(scope)}</code>"));
            rows.Add(
                $"<li><strong>{HtmlPage.Encode(name)}</strong> " +
                $"<span class=\"note\">since {created:yyyy-MM-dd}</span><br>{grants}" +
                HtmlPage.Form(context, $"/account/applications/{Uri.EscapeDataString(id)}/revoke",
                    "<button class=\"secondary\" type=\"submit\">Withdraw</button>") + "</li>");
        }

        string body = "<h1>Applications you have allowed</h1>" +
                      (rows.Count == 0 ? "<p>You have not allowed any application.</p>" : $"<ul>{string.Concat(rows)}</ul>") +
                      "<p class=\"note\">Withdrawing ends the application's access tokens and refresh tokens at once; " +
                      "it will have to ask you again.</p><p><a href=\"/\">Back</a></p>";
        return HtmlPage.Render(context, "Allowed applications", body);
    }

    private static async Task<IResult> RevokeAsync(
        HttpContext context,
        IOpenIddictAuthorizationManager authorizations,
        IOpenIddictTokenManager tokens,
        string authorizationId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInFirst(context);
        }

        if (!await OAuthAccount.IsGenuineFormAsync(context))
        {
            return Results.BadRequest();
        }

        object? authorization = await authorizations.FindByIdAsync(authorizationId, context.RequestAborted);
        // Another account's authorization is treated as absent.
        if (authorization is not null
            && await authorizations.GetSubjectAsync(authorization, context.RequestAborted) == account.Id.ToString())
        {
            await authorizations.TryRevokeAsync(authorization, context.RequestAborted);
            await tokens.RevokeByAuthorizationIdAsync(authorizationId, context.RequestAborted);
        }

        return Results.Redirect("/account/applications");
    }
}
