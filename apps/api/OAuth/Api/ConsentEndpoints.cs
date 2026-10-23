// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using OpenIddict.Abstractions;
using Progmasoft.OAuth.Developers;
using Progmasoft.Progmaweb.Api.Accounts;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Api;

/// <summary>What the consent page shows about an authorization request.</summary>
/// <param name="ClientId">The client identifier.</param>
/// <param name="DisplayName">The name of the application.</param>
/// <param name="Homepage">The address of the application's site, or empty.</param>
/// <param name="Owner">The account that registered the application, or <see langword="null"/>.</param>
/// <param name="ReturnTo">The origin, or for a native application the scheme, that the account holder returns to.</param>
/// <param name="Scopes">The requested scopes the consent page lists, <c>openid</c> left out.</param>
/// <param name="AccountName">The account that is signed in.</param>
internal sealed record ConsentView(
    string ClientId,
    string DisplayName,
    string Homepage,
    string? Owner,
    string ReturnTo,
    IReadOnlyList<string> Scopes,
    string AccountName);

/// <summary>The data of the consent page.</summary>
/// <remarks>
/// <c>/connect/authorize</c> sends an account holder who has not allowed the request yet to the consent page with
/// the parameters of the request. The page reads what to show here and posts the decision back to
/// <c>/connect/authorize</c>, where OpenIddict checks the whole request again. The checks here only keep the page
/// from showing an application, an address or a scope that the request could not use.
/// </remarks>
internal static class ConsentEndpoints
{
    /// <summary>Maps the endpoint.</summary>
    /// <param name="api">The <c>/api/v1/oauth</c> group.</param>
    public static void MapConsentEndpoints(this RouteGroupBuilder api) => api.MapGet("/consent", DescribeAsync);

    /// <summary>Describes an authorization request for the consent page.</summary>
    private static async Task<IResult> DescribeAsync(
        HttpContext context,
        IOpenIddictApplicationManager applications,
        ApplicationRegistry registry,
        AccountService accounts,
        string? client_id,
        string? redirect_uri,
        string? scope)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        object? application = string.IsNullOrEmpty(client_id)
            ? null
            : await applications.FindByClientIdAsync(client_id, context.RequestAborted);
        if (application is null
            || !await applications.HasPermissionAsync(application, Permissions.Endpoints.Authorization,
                context.RequestAborted)
            || string.IsNullOrEmpty(redirect_uri)
            || !Uri.TryCreate(redirect_uri, UriKind.Absolute, out Uri? redirect)
            || !await applications.ValidateRedirectUriAsync(application, redirect_uri, context.RequestAborted))
        {
            return Results.Problem(statusCode: StatusCodes.Status400BadRequest,
                title: "This request does not name a registered application and address.");
        }

        List<string> scopes = [];
        foreach (string requested in (scope ?? string.Empty).Split(' ', StringSplitOptions.RemoveEmptyEntries)
                     .Distinct(StringComparer.Ordinal))
        {
            if (requested == Scopes.OpenId)
            {
                continue;
            }

            if (OAuthScopes.Find(requested) is null
                || !await applications.HasPermissionAsync(application, Permissions.Prefixes.Scope + requested,
                    context.RequestAborted))
            {
                return Results.Problem(statusCode: StatusCodes.Status400BadRequest,
                    title: "The application may not request this scope.", detail: requested);
            }

            scopes.Add(requested);
        }

        string applicationId = (await applications.GetIdAsync(application, context.RequestAborted))!;
        Guid? ownerId = await registry.FindOwnerAsync(applicationId, context.RequestAborted);
        AccountRecord? owner = ownerId is { } id ? await accounts.FindAsync(id, context.RequestAborted) : null;
        RegisteredApplication? registered = ownerId is { } ownerAccount
            ? await registry.FindOwnedAsync(ownerAccount, client_id!, context.RequestAborted)
            : null;
        string returnTo = redirect.Scheme is "http" or "https"
            ? redirect.GetLeftPart(UriPartial.Authority)
            : redirect.Scheme + ":";
        return Results.Ok(new ConsentView(
            client_id!,
            await applications.GetDisplayNameAsync(application, context.RequestAborted) ?? client_id!,
            registered?.Homepage ?? string.Empty,
            owner?.AccountName,
            returnTo,
            scopes,
            account.AccountName));
    }
}
