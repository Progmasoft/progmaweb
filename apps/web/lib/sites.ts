// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/** Drops the trailing slash of every path but the root. */
function trimmed(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

/**
 * The public pages of product.progmasoft.com and the internal routes that
 * render them: the catalog, and one page per product.
 */
export function productRoute(pathname: string): string | null {
  const path = trimmed(pathname);
  if (path === "/") {
    return "/products";
  }
  const segments = path.split("/");
  return segments.length === 2 && /^[a-z0-9-]+$/.test(segments[1] ?? "")
    ? `/products${path}`
    : null;
}

/** The public page of catch3.uk. */
export function catch3Route(pathname: string): string | null {
  return trimmed(pathname) === "/" ? "/catch3" : null;
}

/**
 * The public pages of license.progmasoft.com and the internal routes that
 * render them: the list of licenses, and the pages of each license version,
 * such as /pm-spl/1.0/faq/.
 */
export function licenseRoute(pathname: string): string | null {
  const path = trimmed(pathname);
  if (path === "/") {
    return "/license";
  }
  const page = /^\/pm-spl\/1\.0\/(information|faq|categories)$/.exec(path);
  return page ? `/license/pm-spl/1.0/${page[1]}` : null;
}
