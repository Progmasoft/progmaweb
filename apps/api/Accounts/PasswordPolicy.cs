// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Rules for passwords.</summary>
/// <remarks>
/// Only length is constrained, so long passphrases are welcome. The upper bound keeps hashing cost bounded for a
/// request that an anonymous caller can send.
/// </remarks>
internal static class PasswordPolicy
{
    /// <summary>Fewest characters a password may have.</summary>
    public const int MinimumLength = 12;
    /// <summary>Most characters a password may have.</summary>
    public const int MaximumLength = 256;

    /// <summary>Validates a new password.</summary>
    /// <param name="password">The password in plain text.</param>
    /// <param name="error">Message for the user when the password is refused; empty otherwise.</param>
    /// <returns><see langword="true"/> when the password may be used.</returns>
    public static bool TryValidate(string? password, out string error)
    {
        if (password is null || password.Length < MinimumLength)
        {
            error = $"Passwords must contain at least {MinimumLength} characters.";
            return false;
        }

        if (password.Length > MaximumLength)
        {
            error = $"Passwords cannot exceed {MaximumLength} characters.";
            return false;
        }

        if (password.Contains('\0'))
        {
            error = "Passwords cannot contain a null character.";
            return false;
        }

        error = string.Empty;
        return true;
    }
}
