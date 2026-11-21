<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# Architecture

Progmaweb is two processes behind one reverse proxy:

- **`apps/web`**, a Next.js App Router application. It renders every page of the public hosts and forwards API
  calls.
- **`apps/api`**, an ASP.NET Core minimal API. It owns accounts, passwords and sessions, and Progmasoft OAuth: the
  authorization server and the applications of the Progmasoft Console.

Both listen on loopback only. Nginx is the only public listener and terminates TLS.

```text
browser
   |  HTTPS
   v
Nginx  (progmasoft.com, account., credentials., authorize., console., product., license.)
   |                                    |
   |  pages: http://127.0.0.1:3010      |  OAuth hosts only: /connect/*, /.well-known/* (issuer)
   v                                    |  and /api/* go straight to http://127.0.0.1:5085
Next.js server (apps/web)               |
   |  /api/*  ->  http://127.0.0.1:5085 |  (rewrite, server side)
   v                                    v
ASP.NET Core API (apps/api)
```

On `credentials.progmasoft.com` Nginx sends `/connect/`, `/.well-known/` and `/api/` to the API; on
`authorize.progmasoft.com` `/connect/` and `/api/`; on `console.progmasoft.com` `/api/`. Every other path of those
hosts, and every path of the other hosts, goes to Next.js, which forwards `/api/*` itself.

## Hosts

One build serves every host. The host of a request, not a separate deployment, decides which pages it sees.

| Host | Serves | Internal tree |
| --- | --- | --- |
| `progmasoft.com` | the organization homepage, the Privacy Policy (`/privacy`), the Security Policy (`/security`), `llms.txt`; the only host meant to be indexed as the organization | `/` |
| `www.progmasoft.com` | a permanent redirect to the apex host, issued by Nginx | — |
| `account.progmasoft.com` | the account landing page, sign-in, registration, recovery and the dashboard | `/account` and the account pages |
| `credentials.progmasoft.com` | the OAuth issuer: its page, and through the API the discovery documents, key set and token endpoints | `/issuer` |
| `authorize.progmasoft.com` | the authorization endpoint, sign-in (`/signin`), consent (`/consent`) and the allowed applications (`/account/applications`) | `/authorize` |
| `console.progmasoft.com` | the Progmasoft Console: OAuth 2.1 tokens of the account's applications (`/credentials`, `/credentials/new`, `/credentials/<clientId>`) | `/console` |
| `product.progmasoft.com` | the product catalog: `/`, `/<product>`, `/categories`, `/languages`, `/releases` | `/products` |
| `license.progmasoft.com` | the Progmasoft Source License 1.0 and its pages | `/license` |

Nginx alone answers three more names from the same file: `viget.progmasoft.com` with 410 Gone (ViGet was closed),
`catch3.progmasoft.com` with a permanent redirect to `catch3.uk`, and `maven.progmasoft.com` with the static Maven
repository of `/srv/maven`.

`*.localhost` names (`account.localhost`, `authorize.localhost`, `product.localhost`, ...) behave like the production
hosts during development.

## Host-aware routing

`apps/web/proxy.ts` runs before every page request and applies these rules in order:

1. **Language parameter.** `?lang=<locale>` with a published locale stores the language cookie and redirects to the
   same URL without the parameter. See [Localization](LOCALIZATION.md).
2. **Sites of their own.** On the credentials, authorize, console, product and license hosts, a public path is
   rewritten into the host's internal tree (the table above); a path the host does not have shows its not-found page.
   `/api/*` passes through on the credentials, authorize and console hosts only.
3. **Internal trees stay internal.** `/issuer`, `/authorize`, `/console`, `/products` and `/license` on any other host
   show the not-found page.
4. **Account root.** `/` on the account host is rewritten to the internal `/account` page, so the account landing page
   has the short URL.
5. **The account tree stays on its host.** `/account` on any other host redirects to the account host.

The proxy also gives every page a nonce for its content security policy and expires host-only cookies that would
shadow the shared language and theme cookies of `.progmasoft.com`.

Internal rewrites use `http:` on purpose. TLS ends at Nginx, and Next.js would otherwise try TLS against its own
plain-HTTP loopback listener.

The host is read from `X-Forwarded-Host` first and `Host` second, without the port and in lower case.

## Pages

| Route | Page | Indexed |
| --- | --- | --- |
| `/` (apex) | organization homepage | yes |
| `/privacy`, `/security` (apex) | the Privacy Policy and the Security Policy | yes |
| `/account` (shown as `/` on the account host) | account landing page | no |
| `/login`, `/register`, `/recover` | authentication and recovery | no |
| `/<Account>/dashboard` | dashboard of the signed-in account | no |
| `/` (credentials host) | the issuer page | no |
| `/`, `/signin`, `/consent`, `/account/applications` (authorize host) | authorization, sign-in, consent, allowed applications | no |
| `/`, `/credentials`, `/credentials/new[/<kind>]`, `/credentials/<clientId>` (console host) | the Progmasoft Console | no |
| `/`, `/<product>`, `/categories`, `/languages`, `/releases` (product host) | the product catalog | yes |
| `/`, `/pm-spl/1.0/<page>` (license host) | the Progmasoft Source License | yes |

`robots.txt` and `sitemap.xml` are generated per host: the product and license hosts list their own pages, every
other host lists the apex homepage only. Nginx additionally sends `X-Robots-Tag: noindex` for the whole account host.

Pages are rendered on the server for every request, because the language depends on the request. The interactive
parts run in the browser: the authentication form, the dashboard, and the sign-in, consent, allowed-applications and
console forms of the OAuth hosts.

## Account flow

1. The registration or sign-in form posts JSON to `/api/v1/accounts/register` or `/login` on the same origin.
2. Next.js rewrites `/api/*` to the account API on loopback. The browser never learns the internal address.
3. The API validates the input, stores or verifies the account, opens a session and sets the session cookie.
4. The browser is sent to `/<Account>/dashboard`. The dashboard calls `/api/v1/accounts/me`; without a valid session
   it returns to `/login`, and with a session of another account it moves to that account's dashboard.

Sign-in with Google is a server-side authorization-code flow that starts at `/api/v1/accounts/oauth/google/start` and
returns through the API; the browser never handles Google tokens. The [Account API](ACCOUNT-API.md) describes each
step.

Sign-in on the authorize host has its own cookie and opens no session of the account site; the console uses the
account session, whose cookie production shares with `progmasoft.com`. [Progmasoft OAuth](OAUTH.md) describes both.
The API answers each OAuth and console path on its own host only and 404 elsewhere (`OAuthHostFilter`).

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
