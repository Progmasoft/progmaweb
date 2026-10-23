// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

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

/** The public pages of ides.progmasoft.com: the list and Xide. */
export function idesRoute(pathname: string): string | null {
  const path = trimmed(pathname);
  if (path === "/") {
    return "/ides";
  }
  return path === "/xide" ? "/ides/xide" : null;
}

/** The public page of catch3.progmasoft.com. */
export function catch3Route(pathname: string): string | null {
  return trimmed(pathname) === "/" ? "/catch3" : null;
}
