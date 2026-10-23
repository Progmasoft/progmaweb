// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.OAuth.Developers;

/// <summary>The type of an OAuth 2.1 application, chosen when its token is made.</summary>
/// <remarks>
/// The type decides whether the application keeps a secret, which grants it may use and which redirection addresses
/// it may register. It cannot change later: an application that changes its nature registers a new token.
/// </remarks>
internal enum ApplicationKind
{
    /// <summary>A web application with a server that keeps a client secret.</summary>
    Web,

    /// <summary>A browser application without a server; it cannot keep a secret.</summary>
    SinglePage,

    /// <summary>A desktop or command-line application on the user's machine; it cannot keep a secret.</summary>
    Desktop,

    /// <summary>An iOS or Android application; it cannot keep a secret.</summary>
    Mobile,

    /// <summary>A server that acts as itself, not for an account, with the client credentials grant.</summary>
    Service
}

/// <summary>The names, descriptions and rules of each <see cref="ApplicationKind"/>.</summary>
internal static class ApplicationKinds
{
    /// <summary>Every type in the order the portal offers them.</summary>
    public static IReadOnlyList<ApplicationKind> All { get; } =
    [
        ApplicationKind.Web,
        ApplicationKind.SinglePage,
        ApplicationKind.Desktop,
        ApplicationKind.Mobile,
        ApplicationKind.Service
    ];

    /// <summary>The name of a type in addresses and in the stored application.</summary>
    /// <param name="kind">The type.</param>
    /// <returns>The name, such as <c>web</c> or <c>spa</c>.</returns>
    public static string Slug(this ApplicationKind kind) => kind switch
    {
        ApplicationKind.Web => "web",
        ApplicationKind.SinglePage => "spa",
        ApplicationKind.Desktop => "desktop",
        ApplicationKind.Mobile => "mobile",
        _ => "service"
    };

    /// <summary>Finds a type by its name.</summary>
    /// <param name="slug">The name, as <see cref="Slug"/> writes it.</param>
    /// <returns>The type, or <see langword="null"/> for an unknown name.</returns>
    public static ApplicationKind? Parse(string? slug) =>
        All.Cast<ApplicationKind?>().FirstOrDefault(kind => kind!.Value.Slug() == slug);

    /// <summary>The title of a type in the portal.</summary>
    /// <param name="kind">The type.</param>
    /// <returns>The title.</returns>
    public static string Title(this ApplicationKind kind) => kind switch
    {
        ApplicationKind.Web => "Web application",
        ApplicationKind.SinglePage => "Single-page application",
        ApplicationKind.Desktop => "Desktop application",
        ApplicationKind.Mobile => "Mobile application",
        _ => "Service"
    };

    /// <summary>What a type is for and how it signs in, as the portal explains it.</summary>
    /// <param name="kind">The type.</param>
    /// <returns>The description.</returns>
    public static string Description(this ApplicationKind kind) => kind switch
    {
        ApplicationKind.Web =>
            "A site with a server. Signs people in with the authorization code flow and PKCE, and authenticates with " +
            "a client secret.",
        ApplicationKind.SinglePage =>
            "A browser application without a server, such as React or Vue. Authorization code flow with PKCE, no " +
            "secret; the token endpoint answers its origin.",
        ApplicationKind.Desktop =>
            "A desktop or command-line program. Authorization code flow with PKCE, no secret; returns through a " +
            "loopback address or a private-use scheme (RFC 8252).",
        ApplicationKind.Mobile =>
            "An iOS or Android application. Authorization code flow with PKCE, no secret; returns through a " +
            "private-use scheme or a claimed https:// address.",
        _ =>
            "A server that acts as itself, not for a person. Client credentials grant with a client secret; no " +
            "account scope and no sign-in page."
    };

    /// <summary>Whether a type cannot keep a secret and proves itself with PKCE only.</summary>
    /// <param name="kind">The type.</param>
    /// <returns><see langword="true"/> for single-page, desktop and mobile applications.</returns>
    public static bool IsPublic(this ApplicationKind kind) =>
        kind is ApplicationKind.SinglePage or ApplicationKind.Desktop or ApplicationKind.Mobile;

    /// <summary>Whether a type signs people in and so registers redirection addresses and scopes.</summary>
    /// <param name="kind">The type.</param>
    /// <returns><see langword="false"/> for a service only.</returns>
    public static bool SignsPeopleIn(this ApplicationKind kind) => kind is not ApplicationKind.Service;
}
