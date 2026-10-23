// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.OAuth;

/// <summary>Settings of Progmasoft OAuth, the OAuth 2.1 and OpenID Connect provider of Progmasoft accounts.</summary>
internal sealed class OAuthOptions
{
    /// <summary>The configuration section of these settings.</summary>
    public const string SectionName = "OAuth";

    /// <summary>
    /// The host name of the issuer, <c>https://{Host}/</c>: the discovery documents, the key set and the endpoints
    /// clients call directly (token, user information, revocation, introspection).
    /// </summary>
    public string Host { get; set; } = "credentials.progmasoft.com";

    /// <summary>
    /// The host name of the pages people see: the authorization endpoint with its sign-in and consent screen, the end
    /// session endpoint, and the applications an account has allowed.
    /// </summary>
    public string AuthorizeHost { get; set; } = "authorize.progmasoft.com";

    /// <summary>
    /// The host name of the Progmasoft Cloud Console, where developers make and manage the tokens of their
    /// applications. It has its own sign-in; the protocol endpoints stay on <see cref="Host"/>.
    /// </summary>
    public string ConsoleHost { get; set; } = "console.progmasoft.com";

    /// <summary>
    /// PEM file with the RSA private key that signs identity and access tokens. Required in production; other
    /// environments use a key that lives as long as the process.
    /// </summary>
    public string? SigningKeyPath { get; set; }

    /// <summary>
    /// File with the base64 text of the 256-bit key that encrypts access tokens, authorization codes and refresh
    /// tokens. Required in production, like <see cref="SigningKeyPath"/>.
    /// </summary>
    public string? EncryptionKeyPath { get; set; }

    /// <summary>Where a visitor without an account creates one.</summary>
    public string RegistrationUrl { get; set; } = "https://account.progmasoft.com/register";

    /// <summary>How many applications one account may register.</summary>
    public int MaximumApplicationsPerAccount { get; set; } = 10;

    /// <summary>The issuer, derived from <see cref="Host"/>.</summary>
    public Uri Issuer => new($"https://{Host}/");
}
