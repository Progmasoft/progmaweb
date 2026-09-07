// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Collections.Frozen;
using System.Text.RegularExpressions;

namespace Progmasoft.Progmaweb.Api.Accounts;

internal static partial class AccountNamePolicy
{
    public const int MinimumLength = 8;
    public const int MaximumLength = 128;

    // These names identify Progmasoft itself and the initial administrative identity. They are provisioned only by
    // trusted operations tooling, never by the public registration endpoint.
    private static readonly FrozenSet<string> ReservedNames =
        new[] { "LEITWOLF", "PROGMASOFT" }.ToFrozenSet(StringComparer.Ordinal);

    [GeneratedRegex("^[A-Z][A-Za-z0-9]{7,127}$", RegexOptions.CultureInvariant)]
    private static partial Regex CanonicalPattern();

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

    public static string NormalizeForLookup(string canonical) => canonical.ToUpperInvariant();
}
