// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.OAuth;

/// <summary>Settings of Progmasoft OAuth, the OAuth 2.1 and OpenID Connect provider of Progmasoft accounts.</summary>
internal sealed class OAuthOptions
{
    /// <summary>The configuration section of these settings.</summary>
    public const string SectionName = "OAuth";

    /// <summary>The host name Progmasoft OAuth answers on; the issuer is <c>https://{Host}/</c>.</summary>
    public string Host { get; set; } = "credentials.progmasoft.com";

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
