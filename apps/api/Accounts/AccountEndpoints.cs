// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Accounts;

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;

/// <summary>HTTP endpoints of the account service under <c>/api/v1/accounts</c>.</summary>
/// <remarks>
/// <list type="table">
/// <item><term><c>POST /register</c></term><description>Creates a password account and signs it in.</description></item>
/// <item><term><c>POST /login</c></term><description>Signs in with email address and password.</description></item>
/// <item><term><c>POST /logout</c></term><description>Ends the current session.</description></item>
/// <item><term><c>GET /me</c></term><description>Returns the signed-in account.</description></item>
/// <item><term><c>GET /oauth/google/start</c></term><description>Begins sign-in with Google.</description></item>
/// <item><term><c>GET /oauth/google/complete</c></term><description>Finishes sign-in with Google.</description></item>
/// </list>
/// The endpoints that accept credentials share the <c>account-auth</c> rate limit.
/// </remarks>
internal static class AccountEndpoints
{
    /// <summary>
    /// Authentication scheme of the short-lived cookie that carries the Google identity between the provider callback
    /// and <c>/oauth/google/complete</c>.
    /// </summary>
    internal const string ExternalCookieScheme = "ProgmasoftExternal";

    /// <summary>Registers the account endpoints.</summary>
    /// <param name="endpoints">The route builder of the application.</param>
    /// <returns>The same route builder, for chaining.</returns>
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

    /// <summary>Begins sign-in with Google.</summary>
    /// <param name="accountName">
    /// Account name to create when the Google identity is new; omitted when signing in to an existing account.
    /// </param>
    /// <param name="configuration">Application configuration with the Google client credentials.</param>
    /// <returns>
    /// A challenge that sends the browser to Google, a redirect back to registration when the name is invalid, or
    /// 503 when Google sign-in is not configured.
    /// </returns>
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

    /// <summary>Finishes sign-in with Google after the provider callback.</summary>
    /// <param name="accounts">Account service.</param>
    /// <param name="sessions">Session service.</param>
    /// <param name="context">The current request, holding the external cookie.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>A redirect to the dashboard on success, or to the page that explains the failure.</returns>
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
        string? subject = external.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
        string? accountName = null;
        external.Properties?.Items.TryGetValue("accountName", out accountName);
        (AuthenticatedAccount? authentication, GoogleAccountFailure failure) =
            await accounts.AuthenticateGoogleAsync(subject, email, accountName, sessions, cancellationToken);
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

    /// <summary>Creates a password account and opens a session for it.</summary>
    /// <param name="request">The registration body.</param>
    /// <param name="accounts">Account service.</param>
    /// <param name="sessions">Session service.</param>
    /// <param name="context">The current request; receives the session cookie.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>201 with the account, or a validation problem that names each refused field.</returns>
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

    /// <summary>Signs in with email address and password.</summary>
    /// <param name="request">The login body.</param>
    /// <param name="accounts">Account service.</param>
    /// <param name="sessions">Session service.</param>
    /// <param name="context">The current request; receives the session cookie.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>
    /// 200 with the account, or 401 with one message that does not reveal whether the address or the password was wrong.
    /// </returns>
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

    /// <summary>Ends the current session and deletes its cookie.</summary>
    /// <param name="sessions">Session service.</param>
    /// <param name="context">The current request.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>204, also when no session existed.</returns>
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

    /// <summary>Returns the account of the current session.</summary>
    /// <param name="sessions">Session service.</param>
    /// <param name="context">The current request.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>200 with the account, or 401 when the request has no valid session.</returns>
    private static async Task<IResult> MeAsync(
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        context.Request.Cookies.TryGetValue(sessions.CookieName, out string? token);
        AccountRecord? account = await sessions.AuthenticateAsync(token, cancellationToken);
        return account is null ? Results.Unauthorized() : Results.Ok(ToResponse(account));
    }

    /// <summary>Writes the session cookie of a new session to the response.</summary>
    /// <param name="context">The current request.</param>
    /// <param name="sessions">Session service, which names the cookie.</param>
    /// <param name="authentication">The session that was opened.</param>
    private static void WriteSessionCookie(
        HttpContext context,
        SessionService sessions,
        AuthenticatedAccount authentication) =>
        context.Response.Cookies.Append(
            sessions.CookieName,
            authentication.SessionToken,
            SessionService.CreateCookieOptions(authentication.ExpiresAt));

    /// <summary>Projects a stored account to its public view.</summary>
    /// <param name="account">The stored account.</param>
    /// <returns>The fields a client may see.</returns>
    private static AccountResponse ToResponse(AccountRecord account) =>
        new(account.AccountName, account.Email, account.CreatedAt);
}
