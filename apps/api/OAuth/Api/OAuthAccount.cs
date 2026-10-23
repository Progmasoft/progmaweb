// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Progmasoft.Progmaweb.Api.Accounts;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Api;

/// <summary>The account signed in to Progmasoft OAuth, and the origin check of its requests.</summary>
internal static class OAuthAccount
{
    /// <summary>Finds the signed-in account of a request.</summary>
    /// <remarks>
    /// The Progmasoft Console has no sign-in of its own: it knows the account of the Progmasoft account session, whose
    /// cookie production shares with <c>progmasoft.com</c>. The authorize host keeps its own sign-in cookie, so that an
    /// authorization never depends on the account site. An account that no longer exists ends that sign-in.
    /// </remarks>
    /// <param name="context">The request.</param>
    /// <returns>The account, or <see langword="null"/> when nobody is signed in.</returns>
    public static async Task<AccountRecord?> CurrentAsync(HttpContext context)
    {
        OAuthOptions options = context.RequestServices.GetRequiredService<IOptions<OAuthOptions>>().Value;
        if (string.Equals(context.Request.Host.Host, options.ConsoleHost, StringComparison.OrdinalIgnoreCase))
        {
            return await context.RequestServices.GetRequiredService<SessionService>().AuthenticateAsync(context);
        }

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

    /// <summary>Whether a request that changes something comes from a page of this host.</summary>
    /// <remarks>
    /// The pages of the OAuth host are served by the Progmasoft site on the same origin, so every request they make
    /// that changes state carries an <c>Origin</c> header naming this host. A request from another site is refused
    /// even before the <c>SameSite=Lax</c> cookie would keep it from acting as the account.
    /// </remarks>
    /// <param name="context">The request.</param>
    /// <returns><see langword="true"/> when the request may change state.</returns>
    public static bool IsSameOrigin(HttpContext context)
    {
        string? origin = context.Request.Headers.Origin;
        if (string.IsNullOrEmpty(origin))
        {
            return context.Request.Headers["Sec-Fetch-Site"] == "same-origin";
        }

        string expected = $"{context.Request.Scheme}://{context.Request.Host.Value}";
        return Uri.TryCreate(origin, UriKind.Absolute, out Uri? uri)
               && string.Equals(uri.GetLeftPart(UriPartial.Authority), expected, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>The answer for a request that needs a signed-in account.</summary>
    /// <returns>401 with a problem that names the remedy.</returns>
    public static IResult SignInRequired() => Results.Problem(
        statusCode: StatusCodes.Status401Unauthorized, title: "Sign in to Progmasoft first.");

    /// <summary>The answer for a request from another origin.</summary>
    public static IResult ForeignOrigin() => Results.Problem(
        statusCode: StatusCodes.Status403Forbidden, title: "The request did not come from this site.");

    /// <summary>A validation problem from the messages of each refused field.</summary>
    /// <param name="errors">The messages, keyed by field.</param>
    /// <returns>The problem.</returns>
    public static IResult Refused(IReadOnlyDictionary<string, string> errors) => Results.ValidationProblem(
        errors.ToDictionary(error => error.Key, error => new[] { error.Value }));
}
