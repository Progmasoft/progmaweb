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
import { catch3Route, idesRoute, productRoute } from "@/lib/sites";

const accountHosts = new Set(["account.progmasoft.com", "account.localhost"]);
const vigetHosts = new Set(["viget.progmasoft.com", "viget.localhost"]);
interface OwnSite {
  hosts: Set<string>;
  /** The internal tree of the site's pages. */
  root: string;
  route: (pathname: string) => string | null;
  /** Whether /api reaches the account API on this host. */
  api: boolean;
}

function hostsOf(name: string): Set<string> {
  return new Set([`${name}.progmasoft.com`, `${name}.localhost`]);
}

const ownSites: OwnSite[] = [
  {
    hosts: hostsOf("authorize"),
    root: "/authorize",
    route: authorizeRoute,
    api: true,
  },
  {
    hosts: hostsOf("credentials"),
    root: "/issuer",
    route: issuerRoute,
    api: true,
  },
  {
    hosts: hostsOf("console"),
    root: "/console",
    route: consoleRoute,
    api: true,
  },
  {
    hosts: hostsOf("product"),
    root: "/products",
    route: productRoute,
    api: false,
  },
  { hosts: hostsOf("ides"), root: "/ides", route: idesRoute, api: false },
  { hosts: hostsOf("catch3"), root: "/catch3", route: catch3Route, api: false },
];

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

  // Hosts with pages of their own: Progmasoft OAuth, the Progmasoft Console,
  // the product catalog and the product sites. Each serves its own tree and
  // nothing else of the site, so the account pages keep their own host and
  // cookies.
  const site = ownSites.find((candidate) => candidate.hosts.has(host));
  if (site) {
    if (site.api && pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    // The standalone server runs this proxy a second time for the rewritten
    // path, with the same host: a path already in the site's tree is final.
    if (pathname === site.root || pathname.startsWith(`${site.root}/`)) {
      return NextResponse.next();
    }
    const destination = internalRoute(
      request,
      site.route(pathname) ?? `${site.root}/not-found`,
    );
    // The sign-in page reads ReturnUrl and the consent page every parameter
    // of the authorization request.
    destination.search = request.nextUrl.search;
    return NextResponse.rewrite(destination);
  }
  // The internal trees belong to their hosts only.
  for (const { root } of ownSites) {
    if (pathname === root || pathname.startsWith(`${root}/`)) {
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
    // The page of one plugin. Its index.json and JARs below it are served by
    // Nginx, from the API and from the files of ViGet.
    const plugin =
      /^\/dslplugins\/tazel\/([A-Za-z_][A-Za-z0-9_]*)\/([A-Za-z_][A-Za-z0-9_]*)\/?$/.exec(
        pathname,
      );
    if (plugin) {
      return NextResponse.rewrite(
        internalRoute(
          request,
          `/viget/dslplugins/tazel/${plugin[1]}/${plugin[2]}`,
        ),
      );
    }
    if (
      pathname === "/dslplugins/gradle" ||
      pathname === "/dslplugins/gradle/"
    ) {
      return NextResponse.rewrite(
        internalRoute(request, "/viget/dslplugins/gradle"),
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
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|robots.txt|sitemap.xml).*)",
  ],
};
