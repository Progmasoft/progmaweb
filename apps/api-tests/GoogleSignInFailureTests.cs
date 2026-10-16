// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progmasoft.Progmaweb.Api.Accounts;

namespace Progmasoft.Progmaweb.Api.Tests;

public sealed class GoogleSignInFailureTests
{
    private sealed class RecordingLogger : ILogger
    {
        public List<(LogLevel Level, EventId Event, string Message)> Entries { get; } = [];

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
            Func<TState, Exception?, string> formatter) => Entries.Add((logLevel, eventId, formatter(state, exception)));
    }

    private static RemoteFailureContext Failure(string query, Exception failure)
    {
        DefaultHttpContext http = new();
        http.Request.QueryString = new QueryString(query);
        AuthenticationScheme scheme = new(GoogleDefaults.AuthenticationScheme, null, typeof(GoogleHandler));
        return new RemoteFailureContext(http, scheme, new GoogleOptions(), failure);
    }

    [Fact]
    public async Task AFailedCallbackIsLoggedAndReturnsToTheSignInPage()
    {
        RecordingLogger logger = new();
        RemoteFailureContext context = Failure(
            "?state=secret-state&code=secret-code",
            new AuthenticationFailureException(
                "An error was encountered while handling the remote login.",
                new AuthenticationFailureException("The oauth state was missing or invalid.")));

        await GoogleSignInFailure.HandleAsync(context, logger);

        Assert.Equal("/login?google=failed", context.Response.Headers.Location.ToString());
        Assert.True(context.Result?.Handled);
        (LogLevel level, EventId eventId, string message) = Assert.Single(logger.Entries);
        Assert.Equal(LogLevel.Warning, level);
        Assert.Equal("GoogleSignInFailed", eventId.Name);
        Assert.Equal("Google sign-in could not be completed: The oauth state was missing or invalid.", message);
        Assert.DoesNotContain("secret", message, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("?error=access_denied&state=s", "Google reported access_denied")]
    [InlineData("?error=%3Cscript%3E&state=s", "Google reported an unrecognized error")]
    [InlineData("?state=s", "the denied consent")]
    public void TheReasonNamesWhatGoogleReportedOrWhyTheCallbackWasRefused(string query, string expected)
    {
        RemoteFailureContext context = Failure(query, new AuthenticationFailureException("the denied consent"));

        Assert.Equal(expected, GoogleSignInFailure.Reason(context));
    }
}
