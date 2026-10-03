// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.Api.Security;

/// <summary>Adds the security headers of a JSON API to every response.</summary>
/// <remarks>
/// The API serves no documents, so its content security policy allows nothing, it may not be framed, and its
/// responses are never cached.
/// </remarks>
/// <param name="next">The next middleware in the pipeline.</param>
internal sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    /// <summary>Sets the headers and continues the pipeline.</summary>
    /// <param name="context">The current request.</param>
    /// <returns>A task that completes when the rest of the pipeline has run.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        IHeaderDictionary headers = context.Response.Headers;
        headers["Content-Security-Policy"] =
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
        headers["Referrer-Policy"] = "no-referrer";
        headers["X-Content-Type-Options"] = "nosniff";
        headers["X-Frame-Options"] = "DENY";
        headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        headers["Cache-Control"] = "no-store";

        await next(context);
    }
}
