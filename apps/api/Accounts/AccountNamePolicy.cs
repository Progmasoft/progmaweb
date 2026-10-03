// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Collections.Frozen;
using System.Text.RegularExpressions;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Rules for account names.</summary>
/// <remarks>
/// A name is 8 to 128 ASCII letters or digits and begins with an upper-case letter. Names are unique without regard
/// to case, so two names that differ only in case cannot both exist, while each keeps the spelling its owner chose.
/// The same name is the ViGet publisher name.
/// </remarks>
internal static partial class AccountNamePolicy
{
    /// <summary>Fewest characters an account name may have.</summary>
    public const int MinimumLength = 8;
    /// <summary>Most characters an account name may have.</summary>
    public const int MaximumLength = 128;

    /// <summary>Names nobody may register, in their lookup form.</summary>
    // These names identify Progmasoft itself and the initial administrative identity. They are provisioned only by
    // trusted operations tooling, never by the public registration endpoint.
    private static readonly FrozenSet<string> ReservedNames =
        new[] { "LEITWOLF", "PROGMASOFT" }.ToFrozenSet(StringComparer.Ordinal);

    /// <summary>Matches a name of the allowed length, alphabet and first letter.</summary>
    /// <returns>The compiled expression.</returns>
    [GeneratedRegex("^[A-Z][A-Za-z0-9]{7,127}$", RegexOptions.CultureInvariant)]
    private static partial Regex CanonicalPattern();

    /// <summary>Validates an account name and returns its canonical spelling.</summary>
    /// <param name="value">The name as entered; surrounding white space is ignored.</param>
    /// <param name="canonical">The trimmed name. It is meaningful only when the method returns <see langword="true"/>.</param>
    /// <param name="error">Message for the user when the name is refused; empty otherwise.</param>
    /// <returns><see langword="true"/> when the name satisfies every rule and is not reserved.</returns>
    public static bool TryNormalize(string? value, out string canonical, out string error)
    {
        canonical = value?.Trim() ?? string.Empty;

        if (canonical.Length is < MinimumLength or > MaximumLength)
        {
            error = $"Account names must contain {MinimumLength}–{MaximumLength} characters.";
            return false;
        }

        if (!CanonicalPattern().IsMatch(canonical))
        {
            error = "Account names must begin with an uppercase ASCII letter and contain only ASCII letters or digits.";
            return false;
        }

        if (ReservedNames.Contains(NormalizeForLookup(canonical)))
        {
            error = "That account name is reserved.";
            return false;
        }

        error = string.Empty;
        return true;
    }

    /// <summary>Returns the key under which a name is compared for uniqueness.</summary>
    /// <param name="canonical">A name that <see cref="TryNormalize"/> accepted.</param>
    /// <returns>The name in upper case.</returns>
    public static string NormalizeForLookup(string canonical) => canonical.ToUpperInvariant();
}
