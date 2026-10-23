// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OpenIddict.Abstractions;
using Progmasoft.OAuth.Storage;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth.Developers;

/// <summary>An application as its owner sees it in the developer portal.</summary>
/// <param name="ClientId">The public identifier of the client.</param>
/// <param name="DisplayName">The name the consent page shows.</param>
/// <param name="Homepage">The address of the application's site, or empty.</param>
/// <param name="IsPublic">Whether the client has no secret.</param>
/// <param name="RedirectUris">The registered redirection addresses.</param>
/// <param name="PostLogoutRedirectUris">The registered end-session addresses.</param>
/// <param name="Scopes">The scopes the application may request.</param>
/// <param name="AllowClientCredentials">Whether the client credentials grant is allowed.</param>
/// <param name="CreatedAt">When the application was registered.</param>
internal sealed record RegisteredApplication(
    string ClientId,
    string DisplayName,
    string Homepage,
    bool IsPublic,
    IReadOnlyList<string> RedirectUris,
    IReadOnlyList<string> PostLogoutRedirectUris,
    IReadOnlyList<string> Scopes,
    bool AllowClientCredentials,
    DateTimeOffset CreatedAt);

/// <summary>What registering an application produced.</summary>
/// <param name="Application">The application, or <see langword="null"/> when it was refused.</param>
/// <param name="ClientSecret">The secret of a confidential client; shown once and never stored in clear.</param>
/// <param name="Errors">The messages of each refused field.</param>
internal sealed record RegistrationResult(
    RegisteredApplication? Application,
    string? ClientSecret,
    IReadOnlyDictionary<string, string> Errors);

/// <summary>Registers, changes and deletes the applications of an account.</summary>
/// <remarks>
/// Every operation takes the account that acts and touches only applications that account owns. An application of
/// another account is reported as absent, so that client identifiers cannot be probed through the portal.
/// </remarks>
/// <param name="applications">OpenIddict's application manager.</param>
/// <param name="database">The OAuth tables.</param>
/// <param name="options">The settings of Progmasoft OAuth.</param>
/// <param name="timeProvider">Clock of the registration times.</param>
internal sealed class ApplicationRegistry(
    IOpenIddictApplicationManager applications,
    OAuthDbContext database,
    IOptions<OAuthOptions> options,
    TimeProvider timeProvider)
{
    /// <summary>The property of the application that keeps its homepage.</summary>
    private const string HomepageProperty = "homepage";

    /// <summary>Lists the applications of an account, newest first.</summary>
    /// <param name="accountId">The owner.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The applications.</returns>
    public async Task<IReadOnlyList<RegisteredApplication>> ListAsync(Guid accountId, CancellationToken cancellationToken)
    {
        List<ApplicationOwner> owned = await database.ApplicationOwners
            .Where(owner => owner.AccountId == accountId)
            .OrderByDescending(owner => owner.CreatedAt)
            .ToListAsync(cancellationToken);
        List<RegisteredApplication> result = [];
        foreach (ApplicationOwner owner in owned)
        {
            if (await applications.FindByIdAsync(owner.ApplicationId, cancellationToken) is { } application)
            {
                result.Add(await DescribeAsync(application, owner.CreatedAt, cancellationToken));
            }
        }

        return result;
    }

    /// <summary>Finds an application of an account by its client identifier.</summary>
    /// <param name="accountId">The account that asks.</param>
    /// <param name="clientId">The client identifier.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The application, or <see langword="null"/> when the account owns no such application.</returns>
    public async Task<RegisteredApplication?> FindOwnedAsync(
        Guid accountId,
        string clientId,
        CancellationToken cancellationToken)
    {
        (object application, ApplicationOwner owner)? found = await FindOwnedEntryAsync(accountId, clientId, cancellationToken);
        return found is null ? null : await DescribeAsync(found.Value.application, found.Value.owner.CreatedAt, cancellationToken);
    }

    /// <summary>Finds the account that registered an application.</summary>
    /// <param name="applicationId">The OpenIddict identifier of the application.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The owning account, or <see langword="null"/> for an application without an owner.</returns>
    public async Task<Guid?> FindOwnerAsync(string applicationId, CancellationToken cancellationToken) =>
        (await database.ApplicationOwners.FirstOrDefaultAsync(
            owner => owner.ApplicationId == applicationId, cancellationToken))?.AccountId;

    /// <summary>Registers an application for an account.</summary>
    /// <param name="accountId">The owner.</param>
    /// <param name="input">The submission.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The application and its secret, or the refused fields.</returns>
    public async Task<RegistrationResult> CreateAsync(
        Guid accountId,
        ApplicationInput input,
        CancellationToken cancellationToken)
    {
        Dictionary<string, string> errors = ApplicationPolicy.Validate(input);
        int count = await database.ApplicationOwners.CountAsync(owner => owner.AccountId == accountId, cancellationToken);
        if (count >= options.Value.MaximumApplicationsPerAccount)
        {
            errors["displayName"] =
                $"An account can register {options.Value.MaximumApplicationsPerAccount} applications. Delete one first.";
        }

        if (errors.Count != 0)
        {
            return new RegistrationResult(null, null, errors);
        }

        string clientId = "pmo_" + RandomText(15);
        string? secret = input.IsPublic ? null : RandomText(32);
        OpenIddictApplicationDescriptor descriptor = new()
        {
            ClientId = clientId,
            ClientSecret = secret,
        };
        Describe(descriptor, input);
        object application = await applications.CreateAsync(descriptor, cancellationToken);

        DateTimeOffset now = timeProvider.GetUtcNow();
        database.ApplicationOwners.Add(new ApplicationOwner
        {
            ApplicationId = (await applications.GetIdAsync(application, cancellationToken))!,
            AccountId = accountId,
            CreatedAt = now
        });
        await database.SaveChangesAsync(cancellationToken);
        return new RegistrationResult(await DescribeAsync(application, now, cancellationToken), secret,
            new Dictionary<string, string>());
    }

    /// <summary>Changes an application of an account. The client identifier, type and secret stay.</summary>
    /// <param name="accountId">The account that asks.</param>
    /// <param name="clientId">The client identifier.</param>
    /// <param name="input">The new settings; <see cref="ApplicationInput.IsPublic"/> is ignored.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The refused fields, empty on success, or <see langword="null"/> when the application is absent.</returns>
    public async Task<IReadOnlyDictionary<string, string>?> UpdateAsync(
        Guid accountId,
        string clientId,
        ApplicationInput input,
        CancellationToken cancellationToken)
    {
        if (await FindOwnedEntryAsync(accountId, clientId, cancellationToken) is not { } found)
        {
            return null;
        }

        bool isPublic = await applications.HasClientTypeAsync(found.application, ClientTypes.Public, cancellationToken);
        ApplicationInput effective = input with { IsPublic = isPublic };
        Dictionary<string, string> errors = ApplicationPolicy.Validate(effective);
        if (errors.Count != 0)
        {
            return errors;
        }

        OpenIddictApplicationDescriptor descriptor = new();
        await applications.PopulateAsync(descriptor, found.application, cancellationToken);
        Describe(descriptor, effective);
        await applications.UpdateAsync(found.application, descriptor, cancellationToken);
        return errors;
    }

    /// <summary>Replaces the secret of a confidential application.</summary>
    /// <param name="accountId">The account that asks.</param>
    /// <param name="clientId">The client identifier.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns>The new secret, or <see langword="null"/> for an absent or public application.</returns>
    public async Task<string?> RotateSecretAsync(Guid accountId, string clientId, CancellationToken cancellationToken)
    {
        if (await FindOwnedEntryAsync(accountId, clientId, cancellationToken) is not { } found
            || await applications.HasClientTypeAsync(found.application, ClientTypes.Public, cancellationToken))
        {
            return null;
        }

        string secret = RandomText(32);
        OpenIddictApplicationDescriptor descriptor = new();
        await applications.PopulateAsync(descriptor, found.application, cancellationToken);
        descriptor.ClientSecret = secret;
        await applications.UpdateAsync(found.application, descriptor, cancellationToken);
        return secret;
    }

    /// <summary>Deletes an application with its authorizations and tokens.</summary>
    /// <param name="accountId">The account that asks.</param>
    /// <param name="clientId">The client identifier.</param>
    /// <param name="cancellationToken">Cancels the operation.</param>
    /// <returns><see langword="true"/> when the application was deleted.</returns>
    public async Task<bool> DeleteAsync(Guid accountId, string clientId, CancellationToken cancellationToken)
    {
        if (await FindOwnedEntryAsync(accountId, clientId, cancellationToken) is not { } found)
        {
            return false;
        }

        database.ApplicationOwners.Remove(found.owner);
        await database.SaveChangesAsync(cancellationToken);
        await applications.DeleteAsync(found.application, cancellationToken);
        return true;
    }

    private async Task<(object application, ApplicationOwner owner)?> FindOwnedEntryAsync(
        Guid accountId,
        string clientId,
        CancellationToken cancellationToken)
    {
        if (await applications.FindByClientIdAsync(clientId, cancellationToken) is not { } application)
        {
            return null;
        }

        string? id = await applications.GetIdAsync(application, cancellationToken);
        ApplicationOwner? owner = await database.ApplicationOwners.FirstOrDefaultAsync(
            entry => entry.ApplicationId == id && entry.AccountId == accountId, cancellationToken);
        return owner is null ? null : (application, owner);
    }

    /// <summary>Writes a submission into a descriptor: names, addresses and permissions.</summary>
    /// <param name="descriptor">The descriptor to fill.</param>
    /// <param name="input">The validated submission.</param>
    private static void Describe(OpenIddictApplicationDescriptor descriptor, ApplicationInput input)
    {
        descriptor.DisplayName = input.DisplayName.Trim();
        descriptor.ApplicationType = input.IsPublic ? ApplicationTypes.Native : ApplicationTypes.Web;
        descriptor.ClientType = input.IsPublic ? ClientTypes.Public : ClientTypes.Confidential;
        // Every client of Progmasoft OAuth shows the consent page: none is trusted by default.
        descriptor.ConsentType = ConsentTypes.Explicit;
        descriptor.Properties[HomepageProperty] = JsonSerializer.SerializeToElement(input.Homepage.Trim());

        descriptor.RedirectUris.Clear();
        foreach (string uri in input.RedirectUris)
        {
            descriptor.RedirectUris.Add(new Uri(uri));
        }

        descriptor.PostLogoutRedirectUris.Clear();
        foreach (string uri in input.PostLogoutRedirectUris)
        {
            descriptor.PostLogoutRedirectUris.Add(new Uri(uri));
        }

        descriptor.Permissions.Clear();
        descriptor.Permissions.UnionWith(
        [
            Permissions.Endpoints.Authorization,
            Permissions.Endpoints.Token,
            Permissions.Endpoints.EndSession,
            Permissions.Endpoints.Revocation,
            Permissions.GrantTypes.AuthorizationCode,
            Permissions.ResponseTypes.Code
        ]);
        if (!input.IsPublic)
        {
            descriptor.Permissions.Add(Permissions.Endpoints.Introspection);
        }

        if (input.Scopes.Contains(Scopes.OfflineAccess))
        {
            descriptor.Permissions.Add(Permissions.GrantTypes.RefreshToken);
        }

        if (input.AllowClientCredentials)
        {
            descriptor.Permissions.Add(Permissions.GrantTypes.ClientCredentials);
        }

        foreach (string scope in input.Scopes)
        {
            descriptor.Permissions.Add(Permissions.Prefixes.Scope + scope);
        }

        descriptor.Requirements.Clear();
        descriptor.Requirements.Add(Requirements.Features.ProofKeyForCodeExchange);
    }

    private async Task<RegisteredApplication> DescribeAsync(
        object application,
        DateTimeOffset createdAt,
        CancellationToken cancellationToken)
    {
        var permissions = await applications.GetPermissionsAsync(application, cancellationToken);
        var properties = await applications.GetPropertiesAsync(application, cancellationToken);
        string homepage = properties.TryGetValue(HomepageProperty, out JsonElement value)
                          && value.ValueKind is JsonValueKind.String
            ? value.GetString() ?? string.Empty
            : string.Empty;
        return new RegisteredApplication(
            (await applications.GetClientIdAsync(application, cancellationToken))!,
            await applications.GetDisplayNameAsync(application, cancellationToken) ?? string.Empty,
            homepage,
            await applications.HasClientTypeAsync(application, ClientTypes.Public, cancellationToken),
            (await applications.GetRedirectUrisAsync(application, cancellationToken)).Order(StringComparer.Ordinal).ToList(),
            (await applications.GetPostLogoutRedirectUrisAsync(application, cancellationToken))
                .Order(StringComparer.Ordinal).ToList(),
            OAuthScopes.All
                .Where(scope => permissions.Contains(Permissions.Prefixes.Scope + scope.Name))
                .Select(scope => scope.Name)
                .ToList(),
            permissions.Contains(Permissions.GrantTypes.ClientCredentials),
            createdAt);
    }

    /// <summary>Random text of the given number of bytes, as unpadded URL-safe base64.</summary>
    /// <param name="bytes">How many random bytes.</param>
    /// <returns>The text.</returns>
    private static string RandomText(int bytes) =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(bytes)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
