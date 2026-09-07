// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Accounts;

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;

internal static class AccountEndpoints
{
    internal const string ExternalCookieScheme = "ProgmasoftExternal";

    public static IEndpointRouteBuilder MapAccountEndpoints(this IEndpointRouteBuilder endpoints)
    {
        RouteGroupBuilder accounts = endpoints.MapGroup("/api/v1/accounts");

        accounts.MapPost("/register", RegisterAsync).RequireRateLimiting("account-auth");
        accounts.MapPost("/login", LoginAsync).RequireRateLimiting("account-auth");
        accounts.MapPost("/logout", LogoutAsync);
        accounts.MapGet("/me", MeAsync);
        accounts.MapGet("/oauth/google/start", StartGoogleAsync).RequireRateLimiting("account-auth");
        accounts.MapGet("/oauth/google/complete", CompleteGoogleAsync).RequireRateLimiting("account-auth");

        return endpoints;
    }

    private static IResult StartGoogleAsync(string? accountName, IConfiguration configuration)
    {
        if (string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"]) ||
            string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]))
        {
            return Results.Problem(
                title: "Google sign-in is unavailable",
                detail: "The Google identity provider has not been configured.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        string? normalized = null;
        if (accountName is not null && !AccountNamePolicy.TryNormalize(accountName, out normalized, out _))
        {
            return Results.Redirect("/register?google=invalid-account-name");
        }

        AuthenticationProperties properties = new()
        {
            RedirectUri = "/api/v1/accounts/oauth/google/complete"
        };
        if (normalized is not null)
        {
            properties.Items["accountName"] = normalized;
        }

        return Results.Challenge(properties, [GoogleDefaults.AuthenticationScheme]);
    }

    private static async Task<IResult> CompleteGoogleAsync(
        AccountService accounts,
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        AuthenticateResult external = await context.AuthenticateAsync(ExternalCookieScheme);
        if (!external.Succeeded || external.Principal is null)
        {
            return Results.Redirect("/login?google=failed");
        }

        string? email = external.Principal.FindFirstValue(ClaimTypes.Email);
        string? accountName = null;
        external.Properties?.Items.TryGetValue("accountName", out accountName);
        (AuthenticatedAccount? authentication, GoogleAccountFailure failure) =
            await accounts.AuthenticateGoogleAsync(email, accountName, sessions, cancellationToken);
        await context.SignOutAsync(ExternalCookieScheme);

        if (authentication is null)
        {
            string destination = failure switch
            {
                GoogleAccountFailure.AccountNameRequired => "/register?google=account-name-required",
                GoogleAccountFailure.InvalidAccountName => "/register?google=invalid-account-name",
                GoogleAccountFailure.AccountNameUnavailable => "/register?google=account-name-unavailable",
                _ => "/login?google=failed"
            };
            return Results.Redirect(destination);
        }

        WriteSessionCookie(context, sessions, authentication);
        return Results.Redirect($"/{Uri.EscapeDataString(authentication.Account.AccountName)}/dashboard");
    }

    private static async Task<IResult> RegisterAsync(
        RegisterAccountRequest request,
        AccountService accounts,
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        (AuthenticatedAccount? authentication, Dictionary<string, string[]> errors) =
            await accounts.RegisterAsync(request, sessions, cancellationToken);

        if (authentication is null)
        {
            return Results.ValidationProblem(errors);
        }

        WriteSessionCookie(context, sessions, authentication);
        return Results.Created($"/api/v1/accounts/{Uri.EscapeDataString(authentication.Account.AccountName)}",
            ToResponse(authentication.Account));
    }

    private static async Task<IResult> LoginAsync(
        LoginAccountRequest request,
        AccountService accounts,
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        AuthenticatedAccount? authentication = await accounts.LoginAsync(request, sessions, cancellationToken);
        if (authentication is null)
        {
            return Results.Problem(
                title: "Sign-in failed",
                detail: "The email address or password is incorrect.",
                statusCode: StatusCodes.Status401Unauthorized);
        }

        WriteSessionCookie(context, sessions, authentication);
        return Results.Ok(ToResponse(authentication.Account));
    }

    private static async Task<IResult> LogoutAsync(
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        context.Request.Cookies.TryGetValue(sessions.CookieName, out string? token);
        await sessions.RevokeAsync(token, cancellationToken);
        context.Response.Cookies.Delete(sessions.CookieName, new CookieOptions
        {
            HttpOnly = true,
            Path = "/",
            SameSite = SameSiteMode.Lax,
            Secure = true
        });
        return Results.NoContent();
    }

    private static async Task<IResult> MeAsync(
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        context.Request.Cookies.TryGetValue(sessions.CookieName, out string? token);
        AccountRecord? account = await sessions.AuthenticateAsync(token, cancellationToken);
        return account is null ? Results.Unauthorized() : Results.Ok(ToResponse(account));
    }

    private static void WriteSessionCookie(
        HttpContext context,
        SessionService sessions,
        AuthenticatedAccount authentication) =>
        context.Response.Cookies.Append(
            sessions.CookieName,
            authentication.SessionToken,
            SessionService.CreateCookieOptions(authentication.ExpiresAt));

    private static AccountResponse ToResponse(AccountRecord account) =>
        new(account.AccountName, account.Email, account.CreatedAt);
}
