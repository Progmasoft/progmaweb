// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Collections.Immutable;
using System.Security.Claims;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using OpenIddict.Validation.AspNetCore;
using Progmasoft.OAuth.Developers;
using Progmasoft.OAuth.Pages;
using Progmasoft.Progmaweb.Api.Accounts;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Endpoints;

/// <summary>The protocol endpoints OpenIddict passes through: authorization, token, user information, end session.</summary>
/// <remarks>
/// OpenIddict validates every request before it reaches these handlers: the client, its redirection address, its
/// permissions, PKCE and the requested scopes. The handlers decide who the account is and what it allowed.
/// </remarks>
internal static class AuthorizationEndpoints
{
    /// <summary>Maps the endpoints.</summary>
    /// <param name="app">The application.</param>
    public static void MapAuthorizationEndpoints(this WebApplication app)
    {
        app.MapMethods("/connect/authorize", ["GET", "POST"], AuthorizeAsync).RequireRateLimiting("oauth");
        app.MapPost("/connect/token", TokenAsync).RequireRateLimiting("oauth");
        app.MapMethods("/connect/userinfo", ["GET", "POST"], UserInfo)
            .RequireAuthorization(new AuthorizeAttribute
            {
                AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme
            });
        app.MapMethods("/connect/logout", ["GET", "POST"], (Delegate)LogoutAsync);
    }

    /// <summary>Answers the authorization endpoint: sign-in, consent, and the authorization code.</summary>
    private static async Task<IResult> AuthorizeAsync(
        HttpContext context,
        IOpenIddictApplicationManager applications,
        IOpenIddictAuthorizationManager authorizations,
        ApplicationRegistry registry,
        AccountService accounts)
    {
        OpenIddictRequest request = context.GetOpenIddictServerRequest()
                                    ?? throw new InvalidOperationException("OpenIddict did not pass a request.");

        AccountRecord? account = await OAuthAccount.CurrentAsync(context);
        if (account is null || request.HasPromptValue(PromptValues.Login))
        {
            if (request.HasPromptValue(PromptValues.None))
            {
                return Forbid(Errors.LoginRequired, "The account holder is not signed in.");
            }

            if (account is not null)
            {
                await context.SignOutAsync(OAuthRegistration.CookieScheme);
            }

            // The parameters come back to this endpoint after the sign-in, without prompt=login, which would
            // otherwise send the account holder to the sign-in page for ever.
            IEnumerable<KeyValuePair<string, string?>> parameters = request.GetParameters()
                .Where(parameter => parameter.Key != Parameters.Prompt)
                .Select(parameter => new KeyValuePair<string, string?>(parameter.Key, parameter.Value.ToString()));
            return Results.Challenge(
                new AuthenticationProperties { RedirectUri = "/connect/authorize" + QueryString.Create(parameters) },
                [OAuthRegistration.CookieScheme]);
        }

        object application = await applications.FindByClientIdAsync(request.ClientId!, context.RequestAborted)
                             ?? throw new InvalidOperationException("OpenIddict passed an unknown client.");
        string applicationId = (await applications.GetIdAsync(application, context.RequestAborted))!;
        ImmutableArray<string> scopes = request.GetScopes();

        object? authorization = null;
        await foreach (object existing in authorizations.FindAsync(
                           account.Id.ToString(), applicationId, Statuses.Valid, AuthorizationTypes.Permanent, scopes,
                           context.RequestAborted))
        {
            authorization = existing;
            break;
        }

        string? decision = context.Request.HasFormContentType
            ? (await context.Request.ReadFormAsync(context.RequestAborted))["decision"].ToString()
            : null;
        if (!string.IsNullOrEmpty(decision))
        {
            if (!await OAuthAccount.IsGenuineFormAsync(context))
            {
                return Results.BadRequest();
            }

            if (decision != "allow")
            {
                return Forbid(Errors.AccessDenied, "The account holder did not allow the application.");
            }

            ClaimsIdentity identity = CreateIdentity(account, scopes);
            authorization = await authorizations.CreateAsync(
                identity, account.Id.ToString(), applicationId, AuthorizationTypes.Permanent, scopes,
                context.RequestAborted);
            return Issue(identity, await authorizations.GetIdAsync(authorization, context.RequestAborted));
        }

        if (authorization is not null && !request.HasPromptValue(PromptValues.Consent))
        {
            return Issue(CreateIdentity(account, scopes),
                await authorizations.GetIdAsync(authorization, context.RequestAborted));
        }

        if (request.HasPromptValue(PromptValues.None))
        {
            return Forbid(Errors.ConsentRequired, "The account holder has not allowed these scopes yet.");
        }

        return await ConsentPageAsync(context, request, application, applicationId, account, applications, registry,
            accounts);
    }

    /// <summary>Shows the consent page for an authorization request.</summary>
    private static async Task<IResult> ConsentPageAsync(
        HttpContext context,
        OpenIddictRequest request,
        object application,
        string applicationId,
        AccountRecord account,
        IOpenIddictApplicationManager applications,
        ApplicationRegistry registry,
        AccountService accounts)
    {
        string name = await applications.GetDisplayNameAsync(application, context.RequestAborted) ?? request.ClientId!;
        Guid? ownerId = await registry.FindOwnerAsync(applicationId, context.RequestAborted);
        AccountRecord? owner = ownerId is { } id ? await accounts.FindAsync(id, context.RequestAborted) : null;
        Uri redirect = new(request.RedirectUri!);

        string grants = "<li>Know which Progmasoft account you use.</li>" + string.Concat(request.GetScopes()
            .Select(OAuthScopes.Find)
            .Where(scope => scope is not null)
            .Select(scope => $"<li>{HtmlPage.Encode(scope!.Consent)}</li>"));
        string hidden = string.Concat(request.GetParameters()
            .Where(parameter => parameter.Key != Parameters.Prompt)
            .Select(parameter => HtmlPage.Hidden(parameter.Key, parameter.Value.ToString())));
        string buttons =
            "<div class=\"row\"><button type=\"submit\" name=\"decision\" value=\"allow\">Allow</button>" +
            "<button class=\"secondary\" type=\"submit\" name=\"decision\" value=\"deny\">Deny</button></div>";
        string body =
            $"<h1>Allow {HtmlPage.Encode(name)}?</h1>" +
            $"<p><strong>{HtmlPage.Encode(name)}</strong>" +
            (owner is null ? string.Empty : $", registered by <strong>{HtmlPage.Encode(owner.AccountName)}</strong>,") +
            " wants to:</p>" +
            $"<ul>{grants}</ul>" +
            $"<p class=\"note\">You will be sent back to <code>{HtmlPage.Encode(redirect.GetLeftPart(UriPartial.Authority))}</code>. " +
            $"Signed in as {HtmlPage.Encode(account.AccountName)}. You can withdraw this at any time under " +
            "<a href=\"/account/applications\">Applications you have allowed</a>.</p>" +
            HtmlPage.Form(context, "/connect/authorize", hidden + buttons);
        return HtmlPage.Render(context, "Allow access", body);
    }

    /// <summary>Answers the token endpoint for the authorization code, refresh token and client credentials grants.</summary>
    private static async Task<IResult> TokenAsync(
        HttpContext context,
        IOpenIddictApplicationManager applications,
        AccountService accounts)
    {
        OpenIddictRequest request = context.GetOpenIddictServerRequest()
                                    ?? throw new InvalidOperationException("OpenIddict did not pass a request.");

        if (request.IsAuthorizationCodeGrantType() || request.IsRefreshTokenGrantType())
        {
            AuthenticateResult result =
                await context.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
            string? subject = result.Principal?.GetClaim(Claims.Subject);
            AccountRecord? account = Guid.TryParse(subject, out Guid id)
                ? await accounts.FindAsync(id, context.RequestAborted)
                : null;
            if (account is null)
            {
                return Forbid(Errors.InvalidGrant, "The account no longer exists.");
            }

            // The claims are written again, so that a renamed account or a changed address reaches the client with
            // the next refresh, and a refresh never grants more than the original authorization.
            ClaimsIdentity identity = CreateIdentity(account, result.Principal!.GetScopes());
            return Issue(identity, result.Principal!.GetAuthorizationId());
        }

        if (request.IsClientCredentialsGrantType())
        {
            // A client credentials token names the application itself, not an account, so no account scope can be
            // granted with it.
            if (!request.GetScopes().IsEmpty)
            {
                return Forbid(Errors.InvalidScope,
                    "The client credentials grant acts as the application and takes no account scope.");
            }

            object application = await applications.FindByClientIdAsync(request.ClientId!, context.RequestAborted)
                                 ?? throw new InvalidOperationException("OpenIddict passed an unknown client.");
            ClaimsIdentity identity = new(TokenValidationParameters.DefaultAuthenticationType, Claims.Name, Claims.Role);
            identity.SetClaim(Claims.Subject, request.ClientId);
            identity.SetClaim(Claims.Name, await applications.GetDisplayNameAsync(application, context.RequestAborted));
            identity.SetDestinations(_ => [Destinations.AccessToken]);
            return Results.SignIn(new ClaimsPrincipal(identity), null,
                OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        return Forbid(Errors.UnsupportedGrantType, "This grant type is not supported.");
    }

    /// <summary>Answers the user information endpoint with the claims the access token's scopes allow.</summary>
    private static IResult UserInfo(HttpContext context)
    {
        ClaimsPrincipal principal = context.User;
        Dictionary<string, object> claims = new(StringComparer.Ordinal)
        {
            [Claims.Subject] = principal.GetClaim(Claims.Subject)!
        };
        if (principal.HasScope(Scopes.Profile))
        {
            claims[Claims.Name] = principal.GetClaim(Claims.Name)!;
            claims[Claims.PreferredUsername] = principal.GetClaim(Claims.PreferredUsername)!;
        }

        if (principal.HasScope(Scopes.Email))
        {
            claims[Claims.Email] = principal.GetClaim(Claims.Email)!;
            claims[Claims.EmailVerified] = false;
        }

        return Results.Ok(claims);
    }

    /// <summary>Ends the sign-in and returns to the address the client registered, if any.</summary>
    private static async Task<IResult> LogoutAsync(HttpContext context)
    {
        await context.SignOutAsync(OAuthRegistration.CookieScheme);
        // OpenIddict sends the account holder to post_logout_redirect_uri when the client registered it.
        return Results.SignOut(new AuthenticationProperties { RedirectUri = "/" },
            [OpenIddictServerAspNetCoreDefaults.AuthenticationScheme]);
    }

    /// <summary>The identity of an account, with the claims the granted scopes allow.</summary>
    /// <param name="account">The account.</param>
    /// <param name="scopes">The granted scopes.</param>
    /// <returns>The identity.</returns>
    private static ClaimsIdentity CreateIdentity(AccountRecord account, ImmutableArray<string> scopes)
    {
        ClaimsIdentity identity = new(TokenValidationParameters.DefaultAuthenticationType, Claims.Name, Claims.Role);
        identity.SetClaim(Claims.Subject, account.Id.ToString());
        if (scopes.Contains(Scopes.Profile))
        {
            identity.SetClaim(Claims.Name, account.AccountName);
            identity.SetClaim(Claims.PreferredUsername, account.AccountName);
        }

        if (scopes.Contains(Scopes.Email))
        {
            identity.SetClaim(Claims.Email, account.Email);
            // Registration does not verify the address; a client must not treat it as proven.
            identity.SetClaim(Claims.EmailVerified, false);
        }

        identity.SetScopes(scopes);
        identity.SetResources(OAuthScopes.ResourcesOf(scopes));
        identity.SetDestinations(claim => claim.Type switch
        {
            Claims.Subject => [Destinations.AccessToken, Destinations.IdentityToken],
            Claims.Name or Claims.PreferredUsername or Claims.Email or Claims.EmailVerified =>
                [Destinations.AccessToken, Destinations.IdentityToken],
            _ => [Destinations.AccessToken]
        });
        return identity;
    }

    /// <summary>Issues the tokens of an identity under an authorization.</summary>
    private static IResult Issue(ClaimsIdentity identity, string? authorizationId)
    {
        identity.SetAuthorizationId(authorizationId);
        return Results.SignIn(new ClaimsPrincipal(identity), null,
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    /// <summary>Answers a protocol request with an OAuth error.</summary>
    private static IResult Forbid(string error, string description) => Results.Forbid(
        new AuthenticationProperties(new Dictionary<string, string?>
        {
            [OpenIddictServerAspNetCoreConstants.Properties.Error] = error,
            [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = description
        }),
        [OpenIddictServerAspNetCoreDefaults.AuthenticationScheme]);
}
