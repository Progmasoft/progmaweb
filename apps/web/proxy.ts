// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  isLocale,
  localeCookieName,
  localeCookieOptions,
  requestHost,
} from "@/lib/localization";
import { authorizeRoute, consoleRoute, issuerRoute } from "@/lib/credentials";

const accountHosts = new Set(["account.progmasoft.com", "account.localhost"]);
const vigetHosts = new Set(["viget.progmasoft.com", "viget.localhost"]);
const issuerHosts = new Set([
  "credentials.progmasoft.com",
  "credentials.localhost",
]);
const authorizeHosts = new Set([
  "authorize.progmasoft.com",
  "authorize.localhost",
]);
const consoleHosts = new Set(["console.progmasoft.com", "console.localhost"]);

export function proxy(request: NextRequest) {
  const host = requestHost(
    request.headers.get("x-forwarded-host"),
    request.headers.get("host"),
  );
  const pathname = request.nextUrl.pathname;

  // Language selection is a user preference, not a second canonical URL.
  // Consume the query parameter once, persist it across Progmasoft hosts, and
  // redirect to the clean URL so crawlers never index preference variants.
  // The header control switches in place through a server action; this
  // parameter remains for links and for browsers that run no script.
  const requestedLocale = request.nextUrl.searchParams.get("lang") ?? undefined;
  if (isLocale(requestedLocale)) {
    const destination = request.nextUrl.clone();
    destination.searchParams.delete("lang");
    const forwardedProtocol = request.headers.get("x-forwarded-proto");
    const isProductionHost =
      host === "progmasoft.com" || host.endsWith(".progmasoft.com");
    destination.protocol = isProductionHost
      ? "https:"
      : request.nextUrl.protocol;
    const response = NextResponse.redirect(destination);
    response.cookies.set(
      localeCookieName,
      requestedLocale,
      localeCookieOptions(
        host,
        forwardedProtocol === "https" || request.nextUrl.protocol === "https:",
      ),
    );
    return response;
  }

  // Progmasoft OAuth serves its own pages and nothing else of the site: the
  // account pages keep their own host and cookies.
  // Progmasoft OAuth and the Progmasoft Console serve their own pages and
  // nothing else of the site: the account pages keep their own host and cookies.
  const oauthSite = authorizeHosts.has(host)
    ? { route: authorizeRoute, root: "/authorize" }
    : issuerHosts.has(host)
      ? { route: issuerRoute, root: "/issuer" }
      : consoleHosts.has(host)
        ? { route: consoleRoute, root: "/console" }
        : null;
  if (oauthSite) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    const destination = internalRoute(
      request,
      oauthSite.route(pathname) ?? `${oauthSite.root}/not-found`,
    );
    // The sign-in page reads ReturnUrl and the consent page every parameter
    // of the authorization request.
    destination.search = request.nextUrl.search;
    return NextResponse.rewrite(destination);
  }
  for (const internal of ["/authorize", "/issuer", "/console"]) {
    if (pathname === internal || pathname.startsWith(`${internal}/`)) {
      return NextResponse.rewrite(internalRoute(request, "/not-found"));
    }
  }

  // The account root has its own landing page, but authentication and dashboard URLs remain stable and readable.
  if (accountHosts.has(host) && pathname === "/") {
    const destination = new URL("/account", request.url);

    // TLS terminates at Nginx. Next derives the public scheme from X-Forwarded-Proto,
    // so an unmodified absolute rewrite would attempt TLS against its HTTP-only
    // loopback listener and fail before the account page can render.
    destination.protocol = "http:";
    return NextResponse.rewrite(destination);
  }

  // ViGet is deployed by Progmaweb but keeps short public catalog URLs. The
  // internal /viget tree prevents those routes from colliding with the apex
  // organization page and the account surface.
  if (vigetHosts.has(host)) {
    if (pathname === "/") {
      return NextResponse.rewrite(internalRoute(request, "/viget"));
    }
    // Packages are grouped by the language they are written in and DSL
    // plugins by the build system they extend. A group without a catalog of
    // its own leads to the one catalog there is.
    if (pathname === "/langs/tala" || pathname === "/langs/tala/") {
      return NextResponse.rewrite(internalRoute(request, "/viget/langs/tala"));
    }
    if (pathname === "/dslplugins/tazel" || pathname === "/dslplugins/tazel/") {
      return NextResponse.rewrite(
        internalRoute(request, "/viget/dslplugins/tazel"),
      );
    }
    if (pathname === "/langs" || pathname === "/langs/") {
      return NextResponse.redirect(
        new URL("https://viget.progmasoft.com/langs/tala"),
        308,
      );
    }
    if (pathname === "/dslplugins" || pathname === "/dslplugins/") {
      return NextResponse.redirect(
        new URL("https://viget.progmasoft.com/dslplugins/tazel"),
        308,
      );
    }
    if (pathname === "/login" || pathname === "/login/") {
      return NextResponse.redirect(
        new URL("https://account.progmasoft.com/login"),
      );
    }
    if (pathname === "/register" || pathname === "/register/") {
      return NextResponse.redirect(
        new URL("https://account.progmasoft.com/register"),
      );
    }
    if (pathname === "/recover" || pathname === "/recover/") {
      return NextResponse.redirect(
        new URL("https://account.progmasoft.com/recover"),
      );
    }
  }

  if (
    !vigetHosts.has(host) &&
    (pathname === "/viget" || pathname.startsWith("/viget/"))
  ) {
    const publicPath = pathname.replace(/^\/viget/, "") || "/";
    return NextResponse.redirect(
      new URL(publicPath, "https://viget.progmasoft.com"),
    );
  }

  // Corporate hosts must not accidentally expose the account-only landing page as a public navigation destination.
  if (!accountHosts.has(host) && pathname === "/account") {
    return NextResponse.redirect(new URL("https://account.progmasoft.com/"));
  }

  return NextResponse.next();
}

function internalRoute(request: NextRequest, pathname: string): URL {
  const destination = new URL(pathname, request.url);
  destination.protocol = "http:";
  return destination;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
