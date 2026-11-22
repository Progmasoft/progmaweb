// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { expireShadowingCookies } from "@/lib/shared-cookies";
import {
  languageRequest,
  localeCookieName,
  localeCookieOptions,
  requestHost,
} from "@/lib/localization";
import { authorizeRoute, consoleRoute, issuerRoute } from "@/lib/credentials";
import { licenseRoute, productRoute } from "@/lib/sites";
import { mcpRoute } from "@/lib/mcp-messages";
import { gitRoute } from "@/lib/git-messages";
import {
  contentSecurityPolicy,
  createNonce,
  nonceHeader,
} from "@/lib/content-security-policy";

const accountHosts = new Set(["account.progmasoft.com", "account.localhost"]);
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
  {
    hosts: hostsOf("license"),
    root: "/license",
    route: licenseRoute,
    api: false,
  },
  {
    hosts: hostsOf("git"),
    root: "/git",
    route: gitRoute,
    api: false,
  },
  {
    hosts: hostsOf("agencelandmcp"),
    root: "/mcp",
    route: mcpRoute,
    api: false,
  },
];

function handle(request: NextRequest) {
  // Every page gets its own nonce. Next reads the policy from the request to
  // mark its scripts, and the layout reads the nonce for the theme bootstrap.
  const nonce = createNonce();
  const policy = contentSecurityPolicy(
    nonce,
    process.env.NODE_ENV === "development",
  );
  const headers = new Headers(request.headers);
  headers.set(nonceHeader, nonce);
  headers.set("Content-Security-Policy", policy);
  const response = route(request, headers);
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

/**
 * Where a request goes on its host.
 *
 * @param request The request.
 * @param headers The request headers the page renders with.
 * @returns The response.
 */
function route(request: NextRequest, headers: Headers): NextResponse {
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
  // A language the site no longer publishes, such as he-IL, sends the link to
  // the clean address for good, in the fallback language.
  const language = languageRequest(
    request.nextUrl.searchParams.get("lang") ?? undefined,
  );
  if (language) {
    const destination = request.nextUrl.clone();
    destination.searchParams.delete("lang");
    const forwardedProtocol = request.headers.get("x-forwarded-proto");
    const isProductionHost =
      host === "progmasoft.com" || host.endsWith(".progmasoft.com");
    destination.protocol = isProductionHost
      ? "https:"
      : request.nextUrl.protocol;
    const response = NextResponse.redirect(destination, language.status);
    response.cookies.set(
      localeCookieName,
      language.locale,
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
      return NextResponse.next({ request: { headers } });
    }
    // The standalone server runs this proxy a second time for the rewritten
    // path, with the same host: a path already in the site's tree is final.
    if (pathname === site.root || pathname.startsWith(`${site.root}/`)) {
      return NextResponse.next({ request: { headers } });
    }
    const destination = internalRoute(
      request,
      site.route(pathname) ?? `${site.root}/not-found`,
    );
    // The sign-in page reads ReturnUrl and the consent page every parameter
    // of the authorization request.
    destination.search = request.nextUrl.search;
    return rewrite(headers, destination);
  }
  // The internal trees belong to their hosts only.
  for (const { root } of ownSites) {
    if (pathname === root || pathname.startsWith(`${root}/`)) {
      return rewrite(headers, internalRoute(request, "/not-found"));
    }
  }

  // The account root has its own landing page, but authentication and dashboard URLs remain stable and readable.
  if (accountHosts.has(host) && pathname === "/") {
    const destination = new URL("/account", request.url);

    // TLS terminates at Nginx. Next derives the public scheme from X-Forwarded-Proto,
    // so an unmodified absolute rewrite would attempt TLS against its HTTP-only
    // loopback listener and fail before the account page can render.
    destination.protocol = "http:";
    return rewrite(headers, destination);
  }

  // Corporate hosts must not accidentally expose the account-only landing page as a public navigation destination.
  if (!accountHosts.has(host) && pathname === "/account") {
    return NextResponse.redirect(new URL("https://account.progmasoft.com/"));
  }

  return NextResponse.next({ request: { headers } });
}

function rewrite(headers: Headers, destination: URL): NextResponse {
  return NextResponse.rewrite(destination, { request: { headers } });
}

function internalRoute(request: NextRequest, pathname: string): URL {
  const destination = new URL(pathname, request.url);
  destination.protocol = "http:";
  return destination;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|robots.txt|sitemap.xml|llms.txt).*)",
  ],
};

export function proxy(request: NextRequest) {
  const response = handle(request);
  const secure =
    request.headers.get("x-forwarded-proto") === "https" ||
    request.nextUrl.protocol === "https:";
  for (const cookie of expireShadowingCookies(
    request.headers.get("cookie") ?? "",
    secure,
  )) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}
