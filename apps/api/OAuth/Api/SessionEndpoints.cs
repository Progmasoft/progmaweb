// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Progmasoft.Progmaweb.Api.Accounts;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Api;

/// <summary>The email address and password of a sign-in to Progmasoft OAuth.</summary>
/// <param name="Email">The email address as entered.</param>
/// <param name="Password">The password as entered.</param>
internal sealed record SignInRequest(string? Email, string? Password);

/// <summary>The signed-in account, as the pages of the OAuth host show it.</summary>
/// <param name="AccountName">The account name.</param>
internal sealed record SessionView(string AccountName);

/// <summary>Signing in to and out of Progmasoft OAuth.</summary>
/// <remarks>
/// The sign-in has its own cookie on the OAuth host and opens no session of the account site: an application that
/// signs people in with Progmasoft never shares a cookie with progmasoft.com.
/// </remarks>
internal static class SessionEndpoints
{
    /// <summary>Maps the endpoints.</summary>
    /// <param name="api">The <c>/api/v1/oauth</c> group.</param>
    public static void MapSessionEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/session", (Delegate)SessionAsync);
        api.MapPost("/signin", SignInAsync).RequireRateLimiting("account-auth");
        api.MapPost("/signout", (Delegate)SignOutAsync);
    }

    /// <summary>Answers who is signed in.</summary>
    private static async Task<IResult> SessionAsync(HttpContext context) =>
        await OAuthAccount.CurrentAsync(context) is { } account
            ? Results.Ok(new SessionView(account.AccountName))
            : OAuthAccount.SignInRequired();

    /// <summary>Checks the email address and password and signs the account in.</summary>
    private static async Task<IResult> SignInAsync(HttpContext context, SignInRequest request, AccountService accounts)
    {
        if (!OAuthAccount.IsSameOrigin(context))
        {
            return OAuthAccount.ForeignOrigin();
        }

        AccountRecord? account =
            await accounts.VerifyPasswordAsync(request.Email, request.Password, context.RequestAborted);
        if (account is null)
        {
            // One message for every failure, as the account API gives: it does not tell registered addresses apart.
            return Results.Problem(statusCode: StatusCodes.Status401Unauthorized,
                title: "The email address or the password is not right.");
        }

        ClaimsIdentity identity = new(OAuthRegistration.CookieScheme, Claims.Name, Claims.Role);
        identity.AddClaim(new Claim(Claims.Subject, account.Id.ToString()));
        identity.AddClaim(new Claim(Claims.Name, account.AccountName));
        await context.SignInAsync(OAuthRegistration.CookieScheme, new ClaimsPrincipal(identity),
            new AuthenticationProperties { IsPersistent = false });
        return Results.Ok(new SessionView(account.AccountName));
    }

    /// <summary>Ends the sign-in.</summary>
    private static async Task<IResult> SignOutAsync(HttpContext context)
    {
        if (!OAuthAccount.IsSameOrigin(context))
        {
            return OAuthAccount.ForeignOrigin();
        }

        await context.SignOutAsync(OAuthRegistration.CookieScheme);
        return Results.NoContent();
    }
}
