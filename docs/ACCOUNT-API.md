<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1 -->

# Account API

The account service is the ASP.NET Core application in `apps/api`. Browsers reach it through the same origin as the
page, under `/api/`; the Next.js server forwards those requests to the service on loopback port 5085.

All bodies are JSON with camel-case property names. Errors use the problem-details format (`application/problem+json`).
Every response carries `Cache-Control: no-store`.

## Summary

| Method and path | Purpose | Rate limited |
| --- | --- | --- |
| `POST /api/v1/accounts/register` | create a password account and sign it in | yes |
| `POST /api/v1/accounts/login` | sign in with email address and password | yes |
| `POST /api/v1/accounts/logout` | end the current session | no |
| `GET /api/v1/accounts/me` | return the signed-in account | no |
| `GET /api/v1/accounts/oauth/google/start` | begin sign-in with Google | yes |
| `GET /api/v1/accounts/oauth/google/complete` | finish sign-in with Google | yes |
| `GET /api/v1/status` | report that the service is online | no |
| `GET /health` | liveness probe for the service manager | no |

## Field rules

| Field | Rule |
| --- | --- |
| `accountName` | 8 to 128 ASCII letters or digits, beginning with an upper-case letter. Unique without regard to case; the spelling the owner chose is kept. `Progmasoft` and `Leitwolf` are reserved in every case. |
| `email` | a single mailbox without a display name, at most 254 characters. Unique without regard to case. Ownership is not verified. |
| `password` | 12 to 256 characters, without a null character. No composition rule; long passphrases are welcome. |

Surrounding white space of an account name or email address is ignored.

## Register

`POST /api/v1/accounts/register`

```json
{ "accountName": "ExampleUser1", "email": "user@example.com", "password": "a long passphrase" }
```

**201 Created.** The session cookie is set, `Location` names the account, and the body is the account:

```json
{ "accountName": "ExampleUser1", "email": "user@example.com", "createdAt": "2026-10-03T12:00:00+00:00" }
```

**400 Bad Request.** A validation problem whose `errors` object names each refused field (`accountName`, `email`,
`password`) with a message. A name or address that is already taken is reported the same way, on its field.

## Sign in

`POST /api/v1/accounts/login`

```json
{ "email": "user@example.com", "password": "a long passphrase" }
```

**200 OK.** The session cookie is set and the body is the account, as above.

**401 Unauthorized.** One message for every failure. The response does not say whether the address or the password
was wrong, and an unknown address costs the same password verification as a wrong password, so timing does not reveal
which addresses are registered.

An account that was created through Google has no password and cannot sign in here.

## Sign out

`POST /api/v1/accounts/logout`

**204 No Content.** The session is revoked and the cookie deleted. The response is the same when no session existed.

## Current account

`GET /api/v1/accounts/me`

**200 OK** with the account, or **401 Unauthorized** when the request has no valid session. An expired session is
revoked when it is seen.

## Sign-in with Google

The flow is a server-side authorization-code flow. The browser is redirected; it never receives Google tokens.

1. `GET /api/v1/accounts/oauth/google/start` sends the browser to Google. When a new account should be created, the
   request carries `?accountName=<name>`. An invalid name redirects back to
   `/register?google=invalid-account-name` without contacting Google.
2. Google returns to `/api/v1/accounts/oauth/google/callback`, which the authentication middleware handles. The
   identity is kept for at most ten minutes in a separate cookie, `__Host-ProgmasoftExternal`.
3. `GET /api/v1/accounts/oauth/google/complete` decides the outcome and removes that cookie.

| Situation | Result |
| --- | --- |
| the Google identity is already linked to an account | signed in; redirect to `/<Account>/dashboard` |
| the identity is new and a valid, free account name was supplied | account created and signed in |
| the identity is new and no account name was supplied | redirect to `/register?google=account-name-required` |
| the supplied account name is invalid | redirect to `/register?google=invalid-account-name` |
| the supplied account name is taken | redirect to `/register?google=account-name-unavailable` |
| the email address of the identity belongs to another account | redirect to `/login?google=failed` |
| Google reported no usable identity, or the callback failed | redirect to `/login?google=failed` |

A Google identity is never linked to an existing account by email address. Password registrations do not verify the
address, so linking by address could give one person's account to another.

Google sign-in exists only when both the client identifier and the client secret are configured when the service
starts. Without them the rest of the service works, `start` answers **503 Service Unavailable**, `complete` redirects
to `/login?google=failed`, and the callback path is not a route.

## Status and health

`GET /api/v1/status` returns `{ "service": "progmaweb-account", "status": "online", "version": "1.0.0" }`.
`GET /health` is the ASP.NET Core health check for the service manager and is not a public contract.

## Sessions and cookies

| Cookie | Purpose | Attributes |
| --- | --- | --- |
| `__Host-ProgmasoftSession` | the account session | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, expires with the session |
| `__Host-ProgmasoftExternal` | carries the Google identity between callback and completion | `HttpOnly`, `Secure`, `SameSite=Lax`, ten minutes |

A session token is 256 random bits. The service stores only its SHA-256 digest, so a copy of the store does not
contain a usable token. A session lasts 12 hours by default; `AccountSessions:LifetimeHours` changes that, within 1 to
168 hours.

Passwords are hashed with the ASP.NET Core Identity password hasher and are never stored or logged in plain text.

## Limits

- **Rate limit.** The endpoints marked above share one limit per client address: 12 requests in a sliding window of
  three minutes. A request over the limit gets **429 Too Many Requests**.
- **Body size.** A request body larger than 16 KiB gets **413 Content Too Large**.
- **Hosts.** The service answers only the host names listed in `AllowedHosts`; any other host gets **400**.

The client address comes from `X-Forwarded-For`, which the service accepts from loopback proxies only.

## Configuration

| Setting | Meaning | Default |
| --- | --- | --- |
| `AccountSessions:LifetimeHours` | hours a session stays valid, clamped to 1–168 | `12` |
| `AccountSessions:CookieName` | name of the session cookie | `__Host-ProgmasoftSession` |
| `Authentication:Google:ClientId` | Google OAuth client identifier | empty; Google sign-in is off |
| `Authentication:Google:ClientSecret` | Google OAuth client secret | empty; Google sign-in is off |
| `AllowedHosts` | host names the service answers | see `appsettings.json` |
| `ASPNETCORE_URLS` | listener address | `http://127.0.0.1:5085` in production |

Environment variables use a double underscore for the colon, for example `Authentication__Google__ClientId`. Secrets
belong in the process environment or a secret manager and are never committed.

## What the API does not do

It does not verify email addresses, send mail, reset passwords, list accounts or delete accounts. See
[Known limitations](LIMITATIONS.md).
