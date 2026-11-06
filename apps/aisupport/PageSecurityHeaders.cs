// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

namespace Progmasoft.Progmaweb.AiSupport;

/// <summary>Adds the security headers of the page and its API to every response.</summary>
/// <remarks>
/// The page loads its own script and style only. Cloudflare Web Analytics, which Cloudflare adds to the pages of
/// progmasoft.com, may load its beacon and report to Cloudflare, as on the other Progmasoft sites.
/// </remarks>
/// <param name="next">The next middleware in the pipeline.</param>
internal sealed class PageSecurityHeaders(RequestDelegate next)
{
    /// <summary>The content security policy of every response.</summary>
    internal const string ContentSecurityPolicy =
        "default-src 'none'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self'; " +
        "img-src 'self'; connect-src 'self' https://cloudflareinsights.com; manifest-src 'self'; " +
        "frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

    /// <summary>Sets the headers and continues the pipeline.</summary>
    /// <param name="context">The current request.</param>
    /// <returns>A task that completes when the rest of the pipeline has run.</returns>
    public async Task InvokeAsync(HttpContext context)
    {
        IHeaderDictionary headers = context.Response.Headers;
        headers.ContentSecurityPolicy = ContentSecurityPolicy;
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers.XContentTypeOptions = "nosniff";
        headers.XFrameOptions = "DENY";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
        headers["Cross-Origin-Opener-Policy"] = "same-origin";

        await next(context);
    }
}
