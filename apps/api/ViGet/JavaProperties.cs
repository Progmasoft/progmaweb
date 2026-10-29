// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Globalization;
using System.Text;

namespace Progmasoft.Progmaweb.Api.ViGet;

/// <summary>Reads the text of a Java <c>.properties</c> file, as <c>java.util.Properties.load</c> does.</summary>
/// <remarks>
/// A logical line may continue over several lines with a trailing backslash; <c>#</c> and <c>!</c> start a comment
/// line; a key ends at the first unescaped <c>=</c>, <c>:</c> or white space; and <c>\t</c>, <c>\n</c>, <c>\r</c>,
/// <c>\f</c> and <c>\uXXXX</c> are escapes, while a backslash before any other character stands for that character.
/// A later line with the same key replaces an earlier one.
/// </remarks>
internal static class JavaProperties
{
    /// <summary>Reads the properties of a text.</summary>
    /// <param name="text">The text of the file, already decoded.</param>
    /// <returns>The properties by key.</returns>
    /// <exception cref="FormatException">A <c>\u</c> escape is not followed by four hexadecimal digits.</exception>
    public static IReadOnlyDictionary<string, string> Parse(string text)
    {
        Dictionary<string, string> properties = new(StringComparer.Ordinal);
        foreach (string line in LogicalLines(text))
        {
            int index = 0;
            while (index < line.Length && IsBlank(line[index]))
            {
                index++;
            }

            if (index == line.Length || line[index] is '#' or '!')
            {
                continue;
            }

            int keyStart = index;
            while (index < line.Length && !IsKeyEnd(line[index]))
            {
                index += line[index] == '\\' ? 2 : 1;
            }

            string key = Unescape(line[keyStart..Math.Min(index, line.Length)]);
            while (index < line.Length && IsBlank(line[index]))
            {
                index++;
            }

            if (index < line.Length && line[index] is '=' or ':')
            {
                index++;
                while (index < line.Length && IsBlank(line[index]))
                {
                    index++;
                }
            }

            properties[key] = Unescape(line[index..]);
        }

        return properties;
    }

    /// <summary>Joins the physical lines that a trailing backslash continues.</summary>
    private static IEnumerable<string> LogicalLines(string text)
    {
        string[] lines = text.Replace("\r\n", "\n", StringComparison.Ordinal).Replace('\r', '\n').Split('\n');
        StringBuilder current = new();
        bool continuing = false;
        foreach (string physical in lines)
        {
            // A continued line loses the white space it starts with.
            string line = continuing ? physical.TrimStart(' ', '\t', '\f') : physical;
            int backslashes = 0;
            for (int position = line.Length - 1; position >= 0 && line[position] == '\\'; position--)
            {
                backslashes++;
            }

            continuing = backslashes % 2 == 1;
            current.Append(continuing ? line[..^1] : line);
            if (!continuing)
            {
                yield return current.ToString();
                current.Clear();
            }
        }

        if (current.Length > 0)
        {
            yield return current.ToString();
        }
    }

    /// <summary>Whether a character is white space of the format: space, tab or form feed.</summary>
    private static bool IsBlank(char character) => character is ' ' or '\t' or '\f';

    /// <summary>Whether an unescaped character ends a key.</summary>
    private static bool IsKeyEnd(char character) => character is '=' or ':' || IsBlank(character);

    /// <summary>Resolves the escapes of a key or a value.</summary>
    /// <param name="text">The text as the file writes it.</param>
    /// <returns>The text it stands for.</returns>
    /// <exception cref="FormatException">A <c>\u</c> escape is not followed by four hexadecimal digits.</exception>
    private static string Unescape(string text)
    {
        StringBuilder result = new(text.Length);
        for (int index = 0; index < text.Length; index++)
        {
            char character = text[index];
            if (character != '\\' || index + 1 == text.Length)
            {
                result.Append(character);
                continue;
            }

            char escaped = text[++index];
            switch (escaped)
            {
                case 't':
                    result.Append('\t');
                    break;
                case 'n':
                    result.Append('\n');
                    break;
                case 'r':
                    result.Append('\r');
                    break;
                case 'f':
                    result.Append('\f');
                    break;
                case 'u':
                    if (text.Length - index - 1 < 4 ||
                        !int.TryParse(
                            text.AsSpan(index + 1, 4),
                            NumberStyles.AllowHexSpecifier,
                            CultureInfo.InvariantCulture,
                            out int code))
                    {
                        throw new FormatException("A \\u escape needs four hexadecimal digits.");
                    }

                    result.Append((char)code);
                    index += 4;
                    break;
                default:
                    result.Append(escaped);
                    break;
            }
        }

        return result.ToString();
    }
}
