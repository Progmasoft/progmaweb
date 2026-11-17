// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * The theme a visitor chose, shared by every host of Progmasoft.
 *
 * It is a cookie of the registrable domain, as the language is, so a choice
 * made on progmasoft.com holds on account., viget., product. and console. as
 * well. Scripts of the page read and write it, so it is not HttpOnly; it
 * carries nothing but "light" or "dark". A choice stored by earlier versions
 * of the site in localStorage, which each host kept for itself, moves into
 * the cookie the first time a page sees it.
 */

export type Theme = "light" | "dark";

export const themeCookieName = "progmasoft_theme";

/** The value of the theme cookie in a Cookie header, if it holds a theme. */
export function themeFromCookies(cookieHeader: string): Theme | undefined {
  for (const part of cookieHeader.split(";")) {
    const [name, value] = part.trim().split("=", 2);
    if (name === themeCookieName && (value === "light" || value === "dark")) {
      return value;
    }
  }
  return undefined;
}

/**
 * The Set-Cookie text of a theme for `document.cookie`: a year long, for the
 * registrable domain on a Progmasoft host and for the host itself elsewhere
 * (a local development name), and Secure over HTTPS.
 */
export function themeCookie(
  theme: Theme,
  host: string,
  secure: boolean,
): string {
  const shared = host === "progmasoft.com" || host.endsWith(".progmasoft.com");
  return [
    `${themeCookieName}=${theme}`,
    "Path=/",
    `Max-Age=${60 * 60 * 24 * 365}`,
    "SameSite=Lax",
    ...(shared ? ["Domain=.progmasoft.com"] : []),
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

/**
 * The script that sets the theme before the body is painted, so no page
 * flashes the other theme: the cookie, else a choice in localStorage (which it
 * moves into the cookie), else light. It runs as an inline script with the
 * nonce of the page, so it is plain text; tests run it against the functions
 * above.
 */
export const themeBootstrap = `(() => {
  try {
    const host = location.hostname;
    const shared = host === "progmasoft.com" || host.endsWith(".progmasoft.com");
    let theme = (/(?:^|;\\s*)progmasoft_theme=(light|dark)(?:;|$)/.exec(document.cookie) || [])[1];
    if (!theme) {
      const stored = localStorage.getItem("progmasoft_theme");
      if (stored === "light" || stored === "dark") {
        theme = stored;
        document.cookie = "progmasoft_theme=" + theme + "; Path=/; Max-Age=31536000; SameSite=Lax" +
          (shared ? "; Domain=.progmasoft.com" : "") + (location.protocol === "https:" ? "; Secure" : "");
      }
    }
    theme = theme || "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();`;
