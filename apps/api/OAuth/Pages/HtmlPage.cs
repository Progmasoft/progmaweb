// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Antiforgery;

namespace Progmasoft.OAuth.Pages;

/// <summary>Renders the pages of Progmasoft OAuth: plain HTML forms, no script.</summary>
/// <remarks>
/// The pages need no JavaScript, so the content security policy allows none. The one stylesheet is inline and
/// allowed by its digest. The policy has no <c>form-action</c>: a form here posts to this host, and the
/// redirection that follows a consent goes to the address the application registered, which browsers would check
/// against <c>form-action</c> as well.
/// </remarks>
internal static class HtmlPage
{
    /// <summary>The stylesheet of every page.</summary>
    internal const string Stylesheet =
        "body{margin:0;font:16px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1d1d1f;background:#f6f7f9}" +
        "main{max-width:34rem;margin:3rem auto;padding:2rem;background:#fff;border:1px solid #dcdfe4;border-radius:12px}" +
        "h1{font-size:1.5rem;margin:0 0 1rem}h2{font-size:1.1rem;margin:1.5rem 0 .5rem}" +
        "label{display:block;margin:.75rem 0 .25rem;font-weight:600}" +
        "input[type=text],input[type=email],input[type=password],input[type=url],textarea{box-sizing:border-box;" +
        "width:100%;padding:.55rem .65rem;border:1px solid #b8bec8;border-radius:8px;font:inherit}" +
        "textarea{min-height:5rem}button{margin-top:1rem;padding:.55rem 1rem;border:0;border-radius:8px;" +
        "background:#1f4fd6;color:#fff;font:inherit;cursor:pointer}button.secondary{background:#e5e8ee;color:#1d1d1f}" +
        "button.danger{background:#b3261e}.error{color:#b3261e}.note{color:#5b6270;font-size:.9rem}" +
        "code{font:14px ui-monospace,SFMono-Regular,Consolas,monospace;background:#eef0f4;padding:.1rem .3rem;" +
        "border-radius:4px;word-break:break-all}ul{padding-left:1.2rem}a{color:#1f4fd6}" +
        ".row{display:flex;gap:.5rem;flex-wrap:wrap}.check{font-weight:400}" +
        "@media(prefers-color-scheme:dark){body{background:#121316;color:#e8e9ec}main{background:#1b1d22;" +
        "border-color:#30343c}input[type=text],input[type=email],input[type=password],input[type=url],textarea" +
        "{background:#121316;color:#e8e9ec;border-color:#454a54}code{background:#262a31}a{color:#8fb0ff}" +
        "button.secondary{background:#30343c;color:#e8e9ec}.note{color:#a3a9b5}}";

    /// <summary>The content security policy source that allows <see cref="Stylesheet"/>.</summary>
    internal static readonly string StylesheetSource =
        "'sha256-" + Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(Stylesheet))) + "'";

    /// <summary>Encodes text for an HTML element or attribute.</summary>
    /// <param name="text">The text.</param>
    /// <returns>The encoded text.</returns>
    public static string Encode(string? text) => HtmlEncoder.Default.Encode(text ?? string.Empty);

    /// <summary>Answers with a page.</summary>
    /// <param name="context">The request.</param>
    /// <param name="title">The title of the page.</param>
    /// <param name="body">The content of the page, already encoded.</param>
    /// <param name="statusCode">The status of the response.</param>
    /// <returns>The result.</returns>
    public static IResult Render(HttpContext context, string title, string body, int statusCode = 200)
    {
        IHeaderDictionary headers = context.Response.Headers;
        headers.ContentSecurityPolicy =
            $"default-src 'none'; style-src {StylesheetSource}; img-src 'self'; frame-ancestors 'none'; base-uri 'none'";
        headers.CacheControl = "no-store";
        string html =
            "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
            "<meta name=\"robots\" content=\"noindex\">" +
            $"<title>{Encode(title)} · Progmasoft</title><style>{Stylesheet}</style></head>" +
            $"<body><main>{body}</main></body></html>";
        return Results.Content(html, "text/html; charset=utf-8", Encoding.UTF8, statusCode);
    }

    /// <summary>A form that posts to this host, with the token that proves it was served here.</summary>
    /// <param name="context">The request that renders the form.</param>
    /// <param name="action">The path the form posts to.</param>
    /// <param name="content">The fields and buttons, already encoded.</param>
    /// <returns>The form.</returns>
    public static string Form(HttpContext context, string action, string content)
    {
        IAntiforgery antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
        AntiforgeryTokenSet tokens = antiforgery.GetAndStoreTokens(context);
        return $"<form method=\"post\" action=\"{Encode(action)}\">" +
               $"<input type=\"hidden\" name=\"{Encode(tokens.FormFieldName)}\" value=\"{Encode(tokens.RequestToken)}\">" +
               content + "</form>";
    }

    /// <summary>A hidden field.</summary>
    /// <param name="name">The name of the field.</param>
    /// <param name="value">The value of the field.</param>
    /// <returns>The field.</returns>
    public static string Hidden(string name, string? value) =>
        $"<input type=\"hidden\" name=\"{Encode(name)}\" value=\"{Encode(value)}\">";

    /// <summary>A paragraph that reports an error, or nothing.</summary>
    /// <param name="message">The message, or <see langword="null"/>.</param>
    /// <returns>The paragraph.</returns>
    public static string Error(string? message) =>
        string.IsNullOrEmpty(message) ? string.Empty : $"<p class=\"error\" role=\"alert\">{Encode(message)}</p>";
}
