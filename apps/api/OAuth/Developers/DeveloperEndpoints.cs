// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.Extensions.Options;
using Progmasoft.OAuth.Pages;
using Progmasoft.Progmaweb.Api.Accounts;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Developers;

/// <summary>The developer portal: any account registers and manages its own applications here.</summary>
internal static class DeveloperEndpoints
{
    /// <summary>Maps the portal.</summary>
    /// <param name="app">The application.</param>
    public static void MapDeveloperPortal(this WebApplication app)
    {
        app.MapGet("/developers", ListAsync);
        app.MapGet("/developers/new", (Delegate)NewAsync);
        app.MapPost("/developers/new", CreateAsync).RequireRateLimiting("oauth");
        app.MapGet("/developers/{clientId}", ShowAsync);
        app.MapPost("/developers/{clientId}", UpdateAsync).RequireRateLimiting("oauth");
        app.MapPost("/developers/{clientId}/secret", RotateAsync).RequireRateLimiting("oauth");
        app.MapPost("/developers/{clientId}/delete", DeleteAsync).RequireRateLimiting("oauth");
    }

    private static async Task<IResult> ListAsync(
        HttpContext context,
        ApplicationRegistry registry,
        IOptions<OAuthOptions> options)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInFirst(context);
        }

        IReadOnlyList<RegisteredApplication> owned = await registry.ListAsync(account.Id, context.RequestAborted);
        string list = owned.Count == 0
            ? "<p>You have not registered an application yet.</p>"
            : "<ul>" + string.Concat(owned.Select(application =>
                  $"<li><a href=\"/developers/{Uri.EscapeDataString(application.ClientId)}\">" +
                  $"{HtmlPage.Encode(application.DisplayName)}</a> " +
                  $"<span class=\"note\">{(application.IsPublic ? "public" : "confidential")} · " +
                  $"<code>{HtmlPage.Encode(application.ClientId)}</code></span></li>")) + "</ul>";
        string body =
            "<h1>Your applications</h1>" + list +
            (owned.Count < options.Value.MaximumApplicationsPerAccount
                ? "<p><a href=\"/developers/new\">Register an application</a></p>"
                : $"<p class=\"note\">An account can register {options.Value.MaximumApplicationsPerAccount} applications.</p>") +
            "<h2>Endpoints</h2>" +
            "<p class=\"note\">Read the discovery document at <a href=\"/.well-known/openid-configuration\">" +
            "/.well-known/openid-configuration</a>. Every client uses the authorization code flow with PKCE (S256); " +
            "confidential clients authenticate at the token endpoint with their secret.</p>" +
            "<p><a href=\"/\">Back</a></p>";
        return HtmlPage.Render(context, "Your applications", body);
    }

    private static async Task<IResult> NewAsync(HttpContext context)
    {
        if (await OAuthAccount.CurrentAsync(context) is null)
        {
            return OAuthAccount.SignInFirst(context);
        }

        return RenderForm(context, "Register an application", "/developers/new",
            new ApplicationInput(string.Empty, string.Empty, false, [], [], [Scopes.Profile], false),
            isNew: true, new Dictionary<string, string>());
    }

    private static async Task<IResult> CreateAsync(HttpContext context, ApplicationRegistry registry)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInFirst(context);
        }

        if (!await OAuthAccount.IsGenuineFormAsync(context))
        {
            return Results.BadRequest();
        }

        ApplicationInput input = await ReadAsync(context);
        RegistrationResult result = await registry.CreateAsync(account.Id, input, context.RequestAborted);
        if (result.Application is null)
        {
            return RenderForm(context, "Register an application", "/developers/new", input, isNew: true,
                result.Errors, StatusCodes.Status400BadRequest);
        }

        return RenderCredentials(context, "Application registered", result.Application, result.ClientSecret);
    }

    private static async Task<IResult> ShowAsync(HttpContext context, ApplicationRegistry registry, string clientId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInFirst(context);
        }

        RegisteredApplication? application = await registry.FindOwnedAsync(account.Id, clientId, context.RequestAborted);
        return application is null
            ? NotFound(context)
            : RenderDetails(context, application, new Dictionary<string, string>(), null);
    }

    private static async Task<IResult> UpdateAsync(HttpContext context, ApplicationRegistry registry, string clientId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInFirst(context);
        }

        if (!await OAuthAccount.IsGenuineFormAsync(context))
        {
            return Results.BadRequest();
        }

        ApplicationInput input = await ReadAsync(context);
        IReadOnlyDictionary<string, string>? errors =
            await registry.UpdateAsync(account.Id, clientId, input, context.RequestAborted);
        RegisteredApplication? application = await registry.FindOwnedAsync(account.Id, clientId, context.RequestAborted);
        if (errors is null || application is null)
        {
            return NotFound(context);
        }

        return errors.Count == 0
            ? RenderDetails(context, application, errors, "The application was saved.")
            : RenderForm(context, application.DisplayName, $"/developers/{Uri.EscapeDataString(clientId)}",
                input with { IsPublic = application.IsPublic }, isNew: false, errors,
                StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> RotateAsync(HttpContext context, ApplicationRegistry registry, string clientId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInFirst(context);
        }

        if (!await OAuthAccount.IsGenuineFormAsync(context))
        {
            return Results.BadRequest();
        }

        string? secret = await registry.RotateSecretAsync(account.Id, clientId, context.RequestAborted);
        RegisteredApplication? application = await registry.FindOwnedAsync(account.Id, clientId, context.RequestAborted);
        return secret is null || application is null
            ? NotFound(context)
            : RenderCredentials(context, "New client secret", application, secret);
    }

    private static async Task<IResult> DeleteAsync(HttpContext context, ApplicationRegistry registry, string clientId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInFirst(context);
        }

        if (!await OAuthAccount.IsGenuineFormAsync(context))
        {
            return Results.BadRequest();
        }

        return await registry.DeleteAsync(account.Id, clientId, context.RequestAborted)
            ? Results.Redirect("/developers")
            : NotFound(context);
    }

    private static async Task<ApplicationInput> ReadAsync(HttpContext context)
    {
        IFormCollection form = await context.Request.ReadFormAsync(context.RequestAborted);
        return new ApplicationInput(
            form["displayName"].ToString(),
            form["homepage"].ToString().Trim(),
            form["clientType"] == "public",
            ApplicationPolicy.Lines(form["redirectUris"]),
            ApplicationPolicy.Lines(form["postLogoutRedirectUris"]),
            form["scope"].Where(scope => scope is not null).Select(scope => scope!).Distinct(StringComparer.Ordinal).ToList(),
            form["allowClientCredentials"] == "on");
    }

    private static IResult RenderCredentials(
        HttpContext context,
        string title,
        RegisteredApplication application,
        string? secret)
    {
        string body =
            $"<h1>{HtmlPage.Encode(title)}</h1>" +
            $"<p><strong>{HtmlPage.Encode(application.DisplayName)}</strong></p>" +
            $"<label>Client identifier</label><p><code>{HtmlPage.Encode(application.ClientId)}</code></p>" +
            (secret is null
                ? "<p class=\"note\">A public client has no secret: it proves itself with PKCE only.</p>"
                : $"<label>Client secret</label><p><code>{HtmlPage.Encode(secret)}</code></p>" +
                  "<p class=\"error\">Copy the secret now. It is stored only as a hash and is never shown again; " +
                  "if it is lost, make a new one.</p>") +
            $"<p><a href=\"/developers/{Uri.EscapeDataString(application.ClientId)}\">Go to the application</a></p>";
        return HtmlPage.Render(context, title, body);
    }

    private static IResult RenderDetails(
        HttpContext context,
        RegisteredApplication application,
        IReadOnlyDictionary<string, string> errors,
        string? saved)
    {
        string path = $"/developers/{Uri.EscapeDataString(application.ClientId)}";
        string secretForm = application.IsPublic
            ? string.Empty
            : HtmlPage.Form(context, path + "/secret",
                "<button class=\"secondary\" type=\"submit\">Make a new client secret</button>") +
              "<p class=\"note\">The old secret stops working at once.</p>";
        string body =
            (saved is null ? string.Empty : $"<p role=\"status\">{HtmlPage.Encode(saved)}</p>") +
            FormContent(context, application.DisplayName, path,
                new ApplicationInput(application.DisplayName, application.Homepage, application.IsPublic,
                    application.RedirectUris, application.PostLogoutRedirectUris, application.Scopes,
                    application.AllowClientCredentials),
                isNew: false, errors, application.ClientId) +
            "<h2>Secret</h2>" + secretForm +
            "<h2>Delete</h2>" +
            HtmlPage.Form(context, path + "/delete",
                "<p class=\"note\">Deleting the application ends every authorization and token it holds.</p>" +
                "<button class=\"danger\" type=\"submit\">Delete the application</button>") +
            "<p><a href=\"/developers\">Back</a></p>";
        return HtmlPage.Render(context, application.DisplayName, body);
    }

    private static IResult RenderForm(
        HttpContext context,
        string title,
        string action,
        ApplicationInput input,
        bool isNew,
        IReadOnlyDictionary<string, string> errors,
        int statusCode = StatusCodes.Status200OK) =>
        HtmlPage.Render(context, title,
            FormContent(context, title, action, input, isNew, errors, null) + "<p><a href=\"/developers\">Back</a></p>",
            statusCode);

    private static string FormContent(
        HttpContext context,
        string title,
        string action,
        ApplicationInput input,
        bool isNew,
        IReadOnlyDictionary<string, string> errors,
        string? clientId)
    {
        string Error(string field) => HtmlPage.Error(errors.TryGetValue(field, out string? message) ? message : null);
        string type = isNew
            ? "<label>Type</label>" +
              $"<label class=\"check\"><input type=\"radio\" name=\"clientType\" value=\"confidential\"{(input.IsPublic ? "" : " checked")}> " +
              "Confidential: a server that keeps a client secret</label>" +
              $"<label class=\"check\"><input type=\"radio\" name=\"clientType\" value=\"public\"{(input.IsPublic ? " checked" : "")}> " +
              "Public: a browser or native application without a secret</label>"
            : $"<p class=\"note\">{(input.IsPublic ? "Public" : "Confidential")} client · " +
              $"<code>{HtmlPage.Encode(clientId)}</code></p>";
        string scopes = string.Concat(OAuthScopes.All.Select(scope =>
            $"<label class=\"check\"><input type=\"checkbox\" name=\"scope\" value=\"{HtmlPage.Encode(scope.Name)}\"" +
            $"{(input.Scopes.Contains(scope.Name) ? " checked" : "")}> <code>{HtmlPage.Encode(scope.Name)}</code> " +
            $"{HtmlPage.Encode(scope.Consent)}</label>"));
        string fields =
            type +
            "<label for=\"displayName\">Name</label>" + Error("displayName") +
            $"<input id=\"displayName\" name=\"displayName\" type=\"text\" required maxlength=\"{ApplicationPolicy.MaximumDisplayNameLength}\" value=\"{HtmlPage.Encode(input.DisplayName)}\">" +
            "<label for=\"homepage\">Homepage (optional)</label>" + Error("homepage") +
            $"<input id=\"homepage\" name=\"homepage\" type=\"url\" value=\"{HtmlPage.Encode(input.Homepage)}\">" +
            "<label for=\"redirectUris\">Redirection addresses, one per line</label>" + Error("redirectUris") +
            $"<textarea id=\"redirectUris\" name=\"redirectUris\" required>{HtmlPage.Encode(string.Join('\n', input.RedirectUris))}</textarea>" +
            "<label for=\"postLogoutRedirectUris\">Addresses after sign-out (optional)</label>" +
            Error("postLogoutRedirectUris") +
            $"<textarea id=\"postLogoutRedirectUris\" name=\"postLogoutRedirectUris\">{HtmlPage.Encode(string.Join('\n', input.PostLogoutRedirectUris))}</textarea>" +
            "<label>Scopes the application may request</label>" + Error("scopes") + scopes +
            "<p class=\"note\"><code>openid</code> is always available.</p>" +
            "<label>Service access</label>" + Error("allowClientCredentials") +
            $"<label class=\"check\"><input type=\"checkbox\" name=\"allowClientCredentials\"{(input.AllowClientCredentials ? " checked" : "")}> " +
            "Allow the client credentials grant (confidential clients only)</label>" +
            $"<button type=\"submit\">{(isNew ? "Register" : "Save")}</button>";
        return $"<h1>{HtmlPage.Encode(title)}</h1>" + HtmlPage.Form(context, action, fields);
    }

    private static IResult NotFound(HttpContext context) => HtmlPage.Render(context, "Not found",
        "<h1>Not found</h1><p>No application of yours has this client identifier.</p>" +
        "<p><a href=\"/developers\">Back</a></p>", StatusCodes.Status404NotFound);
}
