namespace Progmasoft.Progmaweb.Api.Accounts;

internal static class PasswordPolicy
{
    public const int MinimumLength = 12;
    public const int MaximumLength = 256;

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
