import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const accountHosts = new Set(["account.progmasoft.com", "account.localhost"]);

export function proxy(request: NextRequest) {
  const host =
    (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))
      ?.split(":", 1)[0]
      ?.toLowerCase() ?? "";
  const pathname = request.nextUrl.pathname;

  // The account root has its own landing page, but authentication and dashboard URLs remain stable and readable.
  if (accountHosts.has(host) && pathname === "/") {
    const destination = new URL("/account", request.url);

    // TLS terminates at Nginx. Next derives the public scheme from X-Forwarded-Proto,
    // so an unmodified absolute rewrite would attempt TLS against its HTTP-only
    // loopback listener and fail before the account page can render.
    destination.protocol = "http:";
    return NextResponse.rewrite(destination);
  }

  // Corporate hosts must not accidentally expose the account-only landing page as a public navigation destination.
  if (!accountHosts.has(host) && pathname === "/account") {
    return NextResponse.redirect(new URL("https://account.progmasoft.com/"));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
