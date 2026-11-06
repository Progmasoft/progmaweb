// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

/** The request header that carries the nonce of a page to its layout. */
export const nonceHeader = "x-nonce";

/**
 * A fresh nonce for one response: 128 random bits in base64.
 *
 * @returns The nonce.
 */
export function createNonce(): string {
  return btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
  );
}

/**
 * The Content-Security-Policy of a page. Next marks its own inline scripts
 * with the nonce when it reads this policy from the request; the theme
 * bootstrap of the layout carries it too.
 *
 * Cloudflare adds its Web Analytics beacon to every page, from
 * static.cloudflareinsights.com, reporting to cloudflareinsights.com and to
 * /cdn-cgi/rum on the same host. 'strict-dynamic' would make browsers ignore
 * that host, so the policy lists hosts instead.
 *
 * There is no form-action: a sign-in or consent form ends in a redirect to
 * another Progmasoft host or to an OAuth client, including a loopback address,
 * and browsers apply form-action to those redirects.
 *
 * @param nonce The nonce of the response.
 * @param development Whether the development server runs, which evaluates code
 * for its hot reload.
 * @returns The value of the header.
 */
export function contentSecurityPolicy(
  nonce: string,
  development: boolean,
): string {
  const scripts = [
    "'self'",
    `'nonce-${nonce}'`,
    "https://static.cloudflareinsights.com",
    ...(development ? ["'unsafe-eval'"] : []),
  ];
  return [
    "default-src 'self'",
    `script-src ${scripts.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
