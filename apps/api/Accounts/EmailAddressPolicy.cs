// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

using System.Net.Mail;

namespace Progmasoft.Progmaweb.Api.Accounts;

internal static class EmailAddressPolicy
{
    public const int MaximumLength = 254;

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
