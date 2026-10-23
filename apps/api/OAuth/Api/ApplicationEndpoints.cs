// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.Extensions.Options;
using Progmasoft.OAuth.Developers;

namespace Progmasoft.OAuth.Api;

/// <summary>What the developer portal submits to make or change a token.</summary>
/// <param name="Kind">The type, as <see cref="ApplicationKinds.Slug"/> writes it; read only when a token is made.</param>
/// <param name="DisplayName">The name the consent page shows.</param>
/// <param name="Homepage">The address of the application's site, or empty.</param>
/// <param name="RedirectUris">The redirection addresses.</param>
/// <param name="PostLogoutRedirectUris">The addresses after sign-out.</param>
/// <param name="Scopes">The scopes the application may request.</param>
internal sealed record ApplicationRequest(
    string? Kind,
    string? DisplayName,
    string? Homepage,
    string[]? RedirectUris,
    string[]? PostLogoutRedirectUris,
    string[]? Scopes)
{
    /// <summary>The submission of an application of a type.</summary>
    /// <param name="kind">The type.</param>
    /// <returns>The submission, with blank and repeated addresses and scopes left out.</returns>
    public ApplicationInput ToInput(ApplicationKind kind) => new(
        DisplayName ?? string.Empty,
        (Homepage ?? string.Empty).Trim(),
        kind,
        Clean(RedirectUris),
        Clean(PostLogoutRedirectUris),
        Clean(Scopes));

    /// <summary>Each non-blank entry once, trimmed, in the submitted order.</summary>
    private static List<string> Clean(string[]? values) => (values ?? [])
        .Select(value => value?.Trim() ?? string.Empty)
        .Where(value => value.Length != 0)
        .Distinct(StringComparer.Ordinal)
        .ToList();
}

/// <summary>An application as the developer portal shows it.</summary>
/// <param name="ClientId">The client identifier.</param>
/// <param name="DisplayName">The name the consent page shows.</param>
/// <param name="Homepage">The address of the application's site, or empty.</param>
/// <param name="Kind">The type, as <see cref="ApplicationKinds.Slug"/> writes it.</param>
/// <param name="IsPublic">Whether the application has no secret.</param>
/// <param name="RedirectUris">The redirection addresses.</param>
/// <param name="PostLogoutRedirectUris">The addresses after sign-out.</param>
/// <param name="Scopes">The scopes the application may request.</param>
/// <param name="CreatedAt">When the token was made.</param>
internal sealed record ApplicationView(
    string ClientId,
    string DisplayName,
    string Homepage,
    string Kind,
    bool IsPublic,
    IReadOnlyList<string> RedirectUris,
    IReadOnlyList<string> PostLogoutRedirectUris,
    IReadOnlyList<string> Scopes,
    DateTimeOffset CreatedAt)
{
    /// <summary>The view of a registered application.</summary>
    public static ApplicationView Of(RegisteredApplication application) => new(
        application.ClientId,
        application.DisplayName,
        application.Homepage,
        application.Kind.Slug(),
        application.IsPublic,
        application.RedirectUris,
        application.PostLogoutRedirectUris,
        application.Scopes,
        application.CreatedAt);
}

/// <summary>The applications of an account, with how many it may have.</summary>
/// <param name="Applications">The applications, newest first.</param>
/// <param name="Maximum">How many applications an account may have.</param>
internal sealed record ApplicationList(IReadOnlyList<ApplicationView> Applications, int Maximum);

/// <summary>A token that was just made, or a secret that was just replaced.</summary>
/// <param name="Application">The application.</param>
/// <param name="ClientSecret">The secret, shown this once; <see langword="null"/> for a type without one.</param>
internal sealed record ApplicationCredentials(ApplicationView Application, string? ClientSecret);

/// <summary>
/// The Progmasoft Cloud Console: any account makes and manages the tokens of its own applications there.
/// </summary>
/// <remarks>
/// Every endpoint acts only on applications the signed-in account owns. An application of another account answers
/// 404, so that client identifiers cannot be probed.
/// </remarks>
internal static class ApplicationEndpoints
{
    /// <summary>Maps the endpoints.</summary>
    /// <param name="api">The <c>/api/v1/oauth</c> group.</param>
    public static void MapApplicationEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/applications", ListAsync);
        api.MapPost("/applications", CreateAsync).RequireRateLimiting("oauth");
        api.MapGet("/applications/{clientId}", ShowAsync);
        api.MapPut("/applications/{clientId}", UpdateAsync).RequireRateLimiting("oauth");
        api.MapPost("/applications/{clientId}/secret", RotateAsync).RequireRateLimiting("oauth");
        api.MapDelete("/applications/{clientId}", DeleteAsync).RequireRateLimiting("oauth");
    }

    /// <summary>Lists the applications of the signed-in account.</summary>
    private static async Task<IResult> ListAsync(
        HttpContext context,
        ApplicationRegistry registry,
        IOptions<OAuthOptions> options)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        IReadOnlyList<RegisteredApplication> owned = await registry.ListAsync(account.Id, context.RequestAborted);
        return Results.Ok(new ApplicationList(owned.Select(ApplicationView.Of).ToList(),
            options.Value.MaximumApplicationsPerAccount));
    }

    /// <summary>Makes a token of the submitted type.</summary>
    private static async Task<IResult> CreateAsync(
        HttpContext context,
        ApplicationRequest request,
        ApplicationRegistry registry)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        if (!OAuthAccount.IsSameOrigin(context))
        {
            return OAuthAccount.ForeignOrigin();
        }

        if (ApplicationKinds.Parse(request.Kind) is not { } kind)
        {
            return OAuthAccount.Refused(new Dictionary<string, string> { ["kind"] = "Choose an application type." });
        }

        RegistrationResult result = await registry.CreateAsync(account.Id, request.ToInput(kind), context.RequestAborted);
        return result.Application is null
            ? OAuthAccount.Refused(result.Errors)
            : Results.Created($"/api/v1/oauth/applications/{Uri.EscapeDataString(result.Application.ClientId)}",
                new ApplicationCredentials(ApplicationView.Of(result.Application), result.ClientSecret));
    }

    /// <summary>Shows an application of the signed-in account.</summary>
    private static async Task<IResult> ShowAsync(HttpContext context, ApplicationRegistry registry, string clientId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        return await registry.FindOwnedAsync(account.Id, clientId, context.RequestAborted) is { } application
            ? Results.Ok(ApplicationView.Of(application))
            : Results.NotFound();
    }

    /// <summary>Saves the settings of an application. Its type, identifier and secret stay.</summary>
    private static async Task<IResult> UpdateAsync(
        HttpContext context,
        ApplicationRequest request,
        ApplicationRegistry registry,
        string clientId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        if (!OAuthAccount.IsSameOrigin(context))
        {
            return OAuthAccount.ForeignOrigin();
        }

        if (await registry.FindOwnedAsync(account.Id, clientId, context.RequestAborted) is not { } current)
        {
            return Results.NotFound();
        }

        IReadOnlyDictionary<string, string>? errors = await registry.UpdateAsync(account.Id, clientId,
            request.ToInput(current.Kind), context.RequestAborted);
        if (errors is null)
        {
            return Results.NotFound();
        }

        if (errors.Count != 0)
        {
            return OAuthAccount.Refused(errors);
        }

        RegisteredApplication? saved = await registry.FindOwnedAsync(account.Id, clientId, context.RequestAborted);
        return saved is null ? Results.NotFound() : Results.Ok(ApplicationView.Of(saved));
    }

    /// <summary>Replaces the secret of an application and answers the new one once.</summary>
    private static async Task<IResult> RotateAsync(HttpContext context, ApplicationRegistry registry, string clientId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        if (!OAuthAccount.IsSameOrigin(context))
        {
            return OAuthAccount.ForeignOrigin();
        }

        string? secret = await registry.RotateSecretAsync(account.Id, clientId, context.RequestAborted);
        RegisteredApplication? application = await registry.FindOwnedAsync(account.Id, clientId, context.RequestAborted);
        return secret is null || application is null
            ? Results.NotFound()
            : Results.Ok(new ApplicationCredentials(ApplicationView.Of(application), secret));
    }

    /// <summary>Deletes an application with its authorizations and tokens.</summary>
    private static async Task<IResult> DeleteAsync(HttpContext context, ApplicationRegistry registry, string clientId)
    {
        if (await OAuthAccount.CurrentAsync(context) is not { } account)
        {
            return OAuthAccount.SignInRequired();
        }

        if (!OAuthAccount.IsSameOrigin(context))
        {
            return OAuthAccount.ForeignOrigin();
        }

        return await registry.DeleteAsync(account.Id, clientId, context.RequestAborted)
            ? Results.NoContent()
            : Results.NotFound();
    }
}
