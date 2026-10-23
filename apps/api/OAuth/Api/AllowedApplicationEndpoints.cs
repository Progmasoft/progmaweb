// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Collections.Immutable;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Api;

/// <summary>An application the account has allowed.</summary>
/// <param name="AuthorizationId">The identifier of the allowance, used to withdraw it.</param>
/// <param name="DisplayName">The name of the application, or <see langword="null"/> when it was deleted.</param>
/// <param name="Scopes">The scopes the account allowed.</param>
/// <param name="CreatedAt">When the account allowed it.</param>
internal sealed record AllowedApplicationView(
    string AuthorizationId,
    string? DisplayName,
    IReadOnlyList<string> Scopes,
    DateTimeOffset? CreatedAt);

/// <summary>The applications an account has allowed, and withdrawing an allowance.</summary>
internal static class AllowedApplicationEndpoints
{
    /// <summary>Maps the endpoints.</summary>
    /// <param name="api">The <c>/api/v1/oauth</c> group.</param>
    public static void MapAllowedApplicationEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/allowed", ListAsync);
        api.MapDelete("/allowed/{authorizationId}", RevokeAsync).RequireRateLimiting("oauth");
    }

    /// <summary>Lists the applications the signed-in account has allowed.</summary>
    private static async Task<IResult> ListAsync(
        HttpContext context,
        IOpenIddictAuthorizationManager authorizations,
        IOpenIddictApplicationManager applications)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        List<AllowedApplicationView> allowed = [];
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
            ImmutableArray<string> scopes = await authorizations.GetScopesAsync(authorization, context.RequestAborted);
            allowed.Add(new AllowedApplicationView(
                (await authorizations.GetIdAsync(authorization, context.RequestAborted))!,
                application is null
                    ? null
                    : await applications.GetDisplayNameAsync(application, context.RequestAborted),
                scopes,
                await authorizations.GetCreationDateAsync(authorization, context.RequestAborted)));
        }

        return Results.Ok(allowed.OrderByDescending(entry => entry.CreatedAt).ToList());
    }

    /// <summary>Withdraws an allowance and revokes the tokens issued under it.</summary>
    private static async Task<IResult> RevokeAsync(
        HttpContext context,
        IOpenIddictAuthorizationManager authorizations,
        IOpenIddictTokenManager tokens,
        string authorizationId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        if (!OAuthAccount.IsSameOrigin(context))
        {
            return OAuthAccount.ForeignOrigin();
        }

        // Only the account's own authorizations are searched, so another account's identifier is simply absent.
        await foreach (object authorization in authorizations.FindBySubjectAsync(account.Id.ToString(),
                           context.RequestAborted))
        {
            string? id = await authorizations.GetIdAsync(authorization, context.RequestAborted);
            if (id is null || !string.Equals(id, authorizationId, StringComparison.Ordinal))
            {
                continue;
            }

            await authorizations.TryRevokeAsync(authorization, context.RequestAborted);
            await tokens.RevokeByAuthorizationIdAsync(id, context.RequestAborted);
            return Results.NoContent();
        }

        return Results.NotFound();
    }
}
