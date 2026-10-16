// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.AspNetCore.Authentication;

namespace Progmasoft.Progmaweb.Api.Accounts;

/// <summary>Ends a Google callback that cannot finish: it records why and returns to the sign-in page.</summary>
/// <remarks>
/// The visitor sees one message for every cause, so the log is where the cause can be read. The entry names the
/// error Google reported, such as <c>access_denied</c>, or the reason the handler refused the callback, such as a
/// missing or invalid state. It never contains the authorization code, the state or a token.
/// </remarks>
internal static class GoogleSignInFailure
{
    /// <summary>The page that explains a failed Google sign-in.</summary>
    public const string SignInPage = "/login?google=failed";

    /// <summary>Writes the cause of a failed Google callback.</summary>
    private static readonly Action<ILogger, string, Exception?> FailureReport = LoggerMessage.Define<string>(
        LogLevel.Warning,
        new EventId(5, "GoogleSignInFailed"),
        "Google sign-in could not be completed: {Reason}");

    /// <summary>The longest provider error code that is written as it was sent.</summary>
    private const int MaximumErrorLength = 64;

    /// <summary>Records the cause of the failure and redirects to <see cref="SignInPage"/>.</summary>
    /// <param name="context">The failed remote authentication.</param>
    /// <param name="logger">Receives the cause.</param>
    /// <returns>A completed task; the response is handled.</returns>
    public static Task HandleAsync(RemoteFailureContext context, ILogger logger)
    {
        FailureReport(logger, Reason(context), null);
        context.Response.Redirect(SignInPage);
        context.HandleResponse();
        return Task.CompletedTask;
    }

    /// <summary>Describes why the callback failed, in words safe to log.</summary>
    /// <param name="context">The failed remote authentication.</param>
    /// <returns>The error Google reported, or the reason the handler refused the callback.</returns>
    internal static string Reason(RemoteFailureContext context)
    {
        string? error = context.Request.Query["error"];
        if (!string.IsNullOrEmpty(error))
        {
            // The value comes from the query string, so only a short code of safe characters is written as it is.
            bool plain = error.Length <= MaximumErrorLength && error.All(character =>
                char.IsAsciiLetterOrDigit(character) || character is '_' or '-' or '.');
            return plain ? $"Google reported {error}" : "Google reported an unrecognized error";
        }

        string? message = context.Failure?.InnerException?.Message ?? context.Failure?.Message;
        return string.IsNullOrWhiteSpace(message) ? "the callback could not be processed" : message;
    }
}
