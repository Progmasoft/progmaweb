// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Net.Mail;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Rules for email addresses.</summary>
/// <remarks>
/// An address is accepted when it parses as a single mailbox without a display name and is at most 254 characters
/// long. Ownership of the address is not verified.
/// </remarks>
internal static class EmailAddressPolicy
{
    /// <summary>Most characters an email address may have.</summary>
    public const int MaximumLength = 254;

    /// <summary>Validates an email address and returns its stored and lookup forms.</summary>
    /// <param name="value">The address as entered; surrounding white space is ignored.</param>
    /// <param name="canonical">The trimmed address, kept as the owner wrote it.</param>
    /// <param name="normalized">The address in upper case; the uniqueness key. Empty when the address is refused.</param>
    /// <param name="error">Message for the user when the address is refused; empty otherwise.</param>
    /// <returns><see langword="true"/> when the address is a single valid mailbox.</returns>
    public static bool TryNormalize(string? value, out string canonical, out string normalized, out string error)
    {
        canonical = value?.Trim() ?? string.Empty;
        normalized = string.Empty;

        if (canonical.Length is 0 or > MaximumLength)
        {
            error = "Enter a valid email address.";
            return false;
        }

        try
        {
            MailAddress parsed = new(canonical);
            if (!string.Equals(parsed.Address, canonical, StringComparison.OrdinalIgnoreCase))
            {
                error = "Enter a single email address without a display name.";
                return false;
            }
        }
        catch (FormatException)
        {
            error = "Enter a valid email address.";
            return false;
        }

        normalized = canonical.ToUpperInvariant();
        error = string.Empty;
        return true;
    }
}
