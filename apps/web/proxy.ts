// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isLocale } from "@/lib/localization";

const accountHosts = new Set(["account.progmasoft.com", "account.localhost"]);
const vigetHosts = new Set(["viget.progmasoft.com", "viget.localhost"]);

export function proxy(request: NextRequest) {
  const host =
    (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))
      ?.split(":", 1)[0]
      ?.toLowerCase() ?? "";
  const pathname = request.nextUrl.pathname;

  // Language selection is a user preference, not a second canonical URL.
  // Consume the query parameter once, persist it across Progmasoft hosts, and
  // redirect to the clean URL so crawlers never index preference variants.
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
    response.cookies.set("progmasoft_locale", requestedLocale, {
      domain:
        host === "progmasoft.com" || host.endsWith(".progmasoft.com")
          ? ".progmasoft.com"
          : undefined,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure:
        forwardedProtocol === "https" || request.nextUrl.protocol === "https:",
    });
    return response;
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
    if (pathname === "/dslplugins" || pathname === "/dslplugins/") {
      return NextResponse.rewrite(internalRoute(request, "/viget/dslplugins"));
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
