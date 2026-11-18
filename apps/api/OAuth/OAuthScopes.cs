// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Progmasoft.OAuth;

/// <summary>One permission an application can ask an account for.</summary>
/// <param name="Name">The scope value of the OAuth request.</param>
/// <param name="Consent">What the consent page tells the account holder the application will be able to do.</param>
/// <param name="Resource">
/// The audience of the access tokens that carry the scope, or <see langword="null"/> when only Progmasoft
/// Credentials itself serves the scope.
/// </param>
internal sealed record OAuthScope(string Name, string Consent, string? Resource);

/// <summary>The scopes of Progmasoft OAuth.</summary>
/// <remarks>
/// Each scope grants one thing, so that an application asks only for what it needs and the account holder sees each
/// grant on its own line of the consent page. <c>openid</c> is not listed: it is the OpenID Connect request itself
/// and grants nothing but the account identifier.
/// </remarks>
internal static class OAuthScopes
{
    /// <summary>Every scope an application may request besides <c>openid</c>, in the order the consent page lists them.</summary>
    public static IReadOnlyList<OAuthScope> All { get; } =
    [
        new(Scopes.Profile, "Read your Progmasoft account name.", null),
        new(Scopes.Email, "Read the email address you sign in and registered with.", null),
        new(Scopes.OfflineAccess, "Keep this access when you are not signed in, until you revoke it.", null),
    ];

    /// <summary>Finds a scope by its name.</summary>
    /// <param name="name">The scope value.</param>
    /// <returns>The scope, or <see langword="null"/> when Progmasoft OAuth has no such scope.</returns>
    public static OAuthScope? Find(string name) => All.FirstOrDefault(scope => scope.Name == name);

    /// <summary>The audiences of a set of scopes.</summary>
    /// <param name="scopes">Scope values that were granted.</param>
    /// <returns>Each audience once.</returns>
    public static IEnumerable<string> ResourcesOf(IEnumerable<string> scopes) => scopes
        .Select(Find)
        .Where(scope => scope?.Resource is not null)
        .Select(scope => scope!.Resource!)
        .Distinct(StringComparer.Ordinal);
}
