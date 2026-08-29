// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

namespace Progmasoft.Progmaweb.Api.Accounts;

internal static class AccountEndpoints
{
    public static IEndpointRouteBuilder MapAccountEndpoints(this IEndpointRouteBuilder endpoints)
    {
        RouteGroupBuilder accounts = endpoints.MapGroup("/api/v1/accounts");

        accounts.MapPost("/register", RegisterAsync).RequireRateLimiting("account-auth");
        accounts.MapPost("/login", LoginAsync).RequireRateLimiting("account-auth");
        accounts.MapPost("/logout", LogoutAsync);
        accounts.MapGet("/me", MeAsync);

        return endpoints;
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
