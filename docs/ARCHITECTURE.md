<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# Architecture

Progmaweb is two processes behind one reverse proxy:

- **`apps/web`**, a Next.js App Router application. It renders every page of three public hosts and forwards API
  calls.
- **`apps/api`**, an ASP.NET Core minimal API. It owns accounts, passwords and sessions.

Both listen on loopback only. Nginx is the only public listener and terminates TLS.

```text
browser
   |  HTTPS
   v
Nginx  (progmasoft.com, www, account.progmasoft.com, ...)
   |  http://127.0.0.1:3010
   v
Next.js server (apps/web)
   |  /api/*  ->  http://127.0.0.1:5085   (rewrite, server side)
   v
ASP.NET Core account API (apps/api)
```

## Hosts

One build serves three hosts. The host of a request, not a separate deployment, decides which pages it sees.

| Host | Serves |
| --- | --- |
| `progmasoft.com` | the organization homepage; the only host that is meant to be indexed as the organization |
| `www.progmasoft.com` | a permanent redirect to the apex host, issued by Nginx |
| `account.progmasoft.com` | the account landing page, sign-in, registration, recovery and the dashboard |

`*.localhost` names (`account.localhost`, `product.localhost`) behave like the production hosts during development.

## Host-aware routing

`apps/web/proxy.ts` runs before every page request and applies these rules in order:

1. **Language parameter.** `?lang=<locale>` with a published locale stores the language cookie and redirects to the
   same URL without the parameter. See [Localization](LOCALIZATION.md).
2. **Account root.** `/` on the account host is rewritten to the internal `/account` page, so the account landing page
   has the short URL.
3. **Internal trees stay internal.** `/account` on any other host redirects to the account host.

Internal rewrites use `http:` on purpose. TLS ends at Nginx, and Next.js would otherwise try TLS against its own
plain-HTTP loopback listener.

The host is read from `X-Forwarded-Host` first and `Host` second, without the port and in lower case.

## Pages

| Route | Page | Indexed |
| --- | --- | --- |
| `/` (apex) | organization homepage | yes |
| `/account` (shown as `/` on the account host) | account landing page | no |
| `/login`, `/register`, `/recover` | authentication and recovery | no |
| `/<Account>/dashboard` | dashboard of the signed-in account | no |

`robots.txt` and `sitemap.xml` are generated per host: the product and license hosts list their own pages, every
other host lists the apex homepage only. Nginx additionally sends `X-Robots-Tag: noindex` for the whole account host.

Pages are rendered on the server for every request, because the language depends on the request. Two components run
in the browser: the authentication form and the dashboard.

## Account flow

1. The registration or sign-in form posts JSON to `/api/v1/accounts/register` or `/login` on the same origin.
2. Next.js rewrites `/api/*` to the account API on loopback. The browser never learns the internal address.
3. The API validates the input, stores or verifies the account, opens a session and sets the session cookie.
4. The browser is sent to `/<Account>/dashboard`. The dashboard calls `/api/v1/accounts/me`; without a valid session
   it returns to `/login`, and with a session of another account it moves to that account's dashboard.

Sign-in with Google is a server-side authorization-code flow that starts at `/api/v1/accounts/oauth/google/start` and
returns through the API; the browser never handles Google tokens. The [Account API](ACCOUNT-API.md) describes each
step.

## Trust boundaries

- **Browser to Nginx.** Everything from the browser is untrusted, including the language cookie, the `lang`
  parameter and the `Accept-Language` header. Each is validated against the list of published locales.
- **Nginx and Next.js to the API.** The API trusts forwarded headers only from loopback and reads one proxy hop. A
  caller that reached the API directly could otherwise forge the client address that the rate limiter uses.
- **API to its store.** The store is a PostgreSQL database on the same host, reached through its Unix socket as the
  operating system user of the service, without a password. It keeps password hashes and session digests, never
  passwords or session tokens.
- **What the browser never receives.** Password hashes, session digests, deployment secrets and internal addresses.

The API has no bulk-delete, reset-all or seed-password endpoint. Maintenance of production accounts is an operations
task, not a public route.

## Response headers

Nginx adds HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, a referrer policy and a permissions policy on
every host. Next.js sets the same content headers for the responses it produces, and its proxy gives every page a
content security policy with a nonce of its own (`apps/web/lib/content-security-policy.ts`): scripts come from the
host, carry the nonce, or are Cloudflare's Web Analytics beacon; nothing may frame a page, and there is no
`form-action`, because sign-in and consent end in redirects to other hosts. The API sets its own, stricter set:
a content security policy that allows nothing, `Cache-Control: no-store`, and no referrer.

## Shared account identity

An account name is the public identity of its owner on every Progmasoft service.
