// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>The Privacy Policy and Security Policy a new account accepts.</summary>
/// <remarks>
/// Registration, with a password or through Google, creates an account only after the person accepted both policies.
/// The account keeps the version it accepted and the moment, so a later version of the policies can tell who has
/// accepted it. The text lives on the <c>/privacy</c> and <c>/security</c> pages of the web application, which name
/// the same version.
/// </remarks>
internal static class PolicyAcceptance
{
    /// <summary>
    /// The newest version of the policies, the date it takes effect. Registration records it from the day it is
    /// published, and the account holders who accepted an earlier one are told before that date
    /// (<c>accounts notify-policies</c>).
    /// </summary>
    public const string CurrentVersion = "2026-12-06";

    /// <summary>The version before it, which applies until <see cref="CurrentVersion"/> takes effect.</summary>
    public const string PreviousVersion = "2026-11-06";

    /// <summary>The message of a registration that did not accept the policies.</summary>
    public const string RequiredMessage = "Accept the Privacy Policy and the Security Policy to create an account.";
}
