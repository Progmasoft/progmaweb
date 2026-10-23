// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.Api.Accounts;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Pages;

/// <summary>The account signed in to Progmasoft OAuth.</summary>
internal static class OAuthAccount
{
    /// <summary>Finds the account of the sign-in cookie.</summary>
    /// <remarks>An account that no longer exists ends the sign-in.</remarks>
    /// <param name="context">The request.</param>
    /// <returns>The account, or <see langword="null"/> when nobody is signed in.</returns>
    public static async Task<AccountRecord?> CurrentAsync(HttpContext context)
    {
        AuthenticateResult result = await context.AuthenticateAsync(OAuthRegistration.CookieScheme);
        string? subject = result.Principal?.FindFirst(Claims.Subject)?.Value;
        if (!result.Succeeded || !Guid.TryParse(subject, out Guid id))
        {
            return null;
        }

        AccountService accounts = context.RequestServices.GetRequiredService<AccountService>();
        AccountRecord? account = await accounts.FindAsync(id, context.RequestAborted);
        if (account is null)
        {
            await context.SignOutAsync(OAuthRegistration.CookieScheme);
        }

        return account;
    }

    /// <summary>Sends a visitor to the sign-in page and back to where they were.</summary>
    /// <param name="context">The request.</param>
    /// <returns>The redirection.</returns>
    public static IResult SignInFirst(HttpContext context) => Results.Redirect(
        "/signin?ReturnUrl=" + Uri.EscapeDataString(context.Request.Path + context.Request.QueryString));

    /// <summary>Whether a form carries the token this host served with it.</summary>
    /// <param name="context">The request.</param>
    /// <returns><see langword="true"/> when the form is genuine.</returns>
    public static Task<bool> IsGenuineFormAsync(HttpContext context) =>
        context.RequestServices.GetRequiredService<IAntiforgery>().IsRequestValidAsync(context);

    /// <summary>A return address that stays on this host.</summary>
    /// <param name="returnUrl">The requested address.</param>
    /// <returns>The address, or <c>/</c> when it would leave the host.</returns>
    public static string LocalReturnUrl(string? returnUrl) =>
        !string.IsNullOrEmpty(returnUrl) && returnUrl[0] == '/' && (returnUrl.Length == 1 ||
                                                                    (returnUrl[1] != '/' && returnUrl[1] != '\\'))
            ? returnUrl
            : "/";
}

/// <summary>The home page, the sign-in page and signing out.</summary>
internal static class SignInEndpoints
{
    /// <summary>Maps the pages.</summary>
    /// <param name="app">The application.</param>
    public static void MapSignInPages(this WebApplication app)
    {
        app.MapGet("/", (Delegate)HomeAsync);
        app.MapGet("/signin", SignInPage);
        app.MapPost("/signin", SignInAsync).RequireRateLimiting("account-auth");
        app.MapPost("/signout", (Delegate)SignOutAsync);
    }

    private static async Task<IResult> HomeAsync(HttpContext context)
    {
        AccountRecord? account = await OAuthAccount.CurrentAsync(context);
        string body = "<h1>Progmasoft OAuth</h1>" +
                      "<p>Sign in with Progmasoft: an OAuth 2.1 and OpenID Connect provider for Progmasoft accounts. " +
                      "Any developer can register an application.</p>";
        if (account is null)
        {
            body += "<p><a href=\"/signin\">Sign in</a> to register applications or to review the applications you " +
                    "have allowed.</p>";
        }
        else
        {
            body += $"<p>Signed in as <strong>{HtmlPage.Encode(account.AccountName)}</strong>.</p>" +
                    "<ul><li><a href=\"/developers\">Your applications</a></li>" +
                    "<li><a href=\"/account/applications\">Applications you have allowed</a></li></ul>" +
                    HtmlPage.Form(context, "/signout", "<button class=\"secondary\" type=\"submit\">Sign out</button>");
        }

        body += "<p class=\"note\">Discovery document: <a href=\"/.well-known/openid-configuration\">" +
                "/.well-known/openid-configuration</a></p>";
        return HtmlPage.Render(context, "Progmasoft OAuth", body);
    }

    private static IResult SignInPage(HttpContext context, IOptions<OAuthOptions> options, string? returnUrl) =>
        RenderSignIn(context, options.Value, OAuthAccount.LocalReturnUrl(returnUrl), null, null);

    private static async Task<IResult> SignInAsync(
        HttpContext context,
        AccountService accounts,
        IOptions<OAuthOptions> options)
    {
        if (!await OAuthAccount.IsGenuineFormAsync(context))
        {
            return Results.BadRequest();
        }

        IFormCollection form = await context.Request.ReadFormAsync(context.RequestAborted);
        string returnUrl = OAuthAccount.LocalReturnUrl(form["returnUrl"]);
        string? email = form["email"];
        AccountRecord? account = await accounts.VerifyPasswordAsync(email, form["password"], context.RequestAborted);
        if (account is null)
        {
            // One message for every failure, as the account API gives: it does not tell registered addresses apart.
            return RenderSignIn(context, options.Value, returnUrl, email,
                "The email address or the password is not right.", StatusCodes.Status401Unauthorized);
        }

        ClaimsIdentity identity = new(OAuthRegistration.CookieScheme, Claims.Name, Claims.Role);
        identity.AddClaim(new Claim(Claims.Subject, account.Id.ToString()));
        identity.AddClaim(new Claim(Claims.Name, account.AccountName));
        await context.SignInAsync(OAuthRegistration.CookieScheme, new ClaimsPrincipal(identity),
            new AuthenticationProperties { IsPersistent = false });
        return Results.Redirect(returnUrl);
    }

    private static async Task<IResult> SignOutAsync(HttpContext context)
    {
        if (!await OAuthAccount.IsGenuineFormAsync(context))
        {
            return Results.BadRequest();
        }

        await context.SignOutAsync(OAuthRegistration.CookieScheme);
        return Results.Redirect("/");
    }

    private static IResult RenderSignIn(
        HttpContext context,
        OAuthOptions options,
        string returnUrl,
        string? email,
        string? error,
        int statusCode = StatusCodes.Status200OK)
    {
        string fields =
            HtmlPage.Hidden("returnUrl", returnUrl) +
            "<label for=\"email\">Email address</label>" +
            $"<input id=\"email\" name=\"email\" type=\"email\" autocomplete=\"username\" required value=\"{HtmlPage.Encode(email)}\">" +
            "<label for=\"password\">Password</label>" +
            "<input id=\"password\" name=\"password\" type=\"password\" autocomplete=\"current-password\" required>" +
            "<button type=\"submit\">Sign in</button>";
        string body = "<h1>Sign in to Progmasoft</h1>" + HtmlPage.Error(error) +
                      HtmlPage.Form(context, "/signin", fields) +
                      $"<p class=\"note\">No account yet? <a href=\"{HtmlPage.Encode(options.RegistrationUrl)}\">" +
                      "Create a Progmasoft account</a>.</p>";
        return HtmlPage.Render(context, "Sign in", body, statusCode);
    }
}
