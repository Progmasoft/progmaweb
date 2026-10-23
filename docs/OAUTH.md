<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1 -->

# Progmasoft OAuth

Progmasoft OAuth lets any application sign people in with their Progmasoft account and, with their consent, act on
their behalf. It is an OAuth 2.1 authorization server and an OpenID Connect provider on three hosts:

| Host | Serves |
| --- | --- |
| `credentials.progmasoft.com` | The issuer (`https://credentials.progmasoft.com/`): discovery documents, key set, and the endpoints clients call directly |
| `authorize.progmasoft.com` | The pages people see: the authorization endpoint with sign-in and the consent screen, the end session endpoint, and the applications an account has allowed |
| `console.progmasoft.com` | The Progmasoft Console, where developers make tokens for their applications |

The console has no sign-in of its own: it uses the Progmasoft account session of `account.progmasoft.com`, so any
developer signed in to their Progmasoft account can make tokens there.

## Make a token

Open **OAuth 2.1 tokens** in the console (`/credentials`), choose **New token**, then the type of the application. The type decides how the application
proves itself, which grants it may use and where people may return; it cannot change later.

| Type | For | Secret | Grants | Redirection addresses |
| --- | --- | --- | --- | --- |
| Web application | A site with a server | Yes | Authorization code + PKCE, refresh | `https://`; `http://` loopback during development |
| Single-page application | A browser application without a server | No | Authorization code + PKCE, refresh | `https://`; `http://` loopback during development |
| Desktop application | A desktop or command-line program | No | Authorization code + PKCE, refresh | `http://` loopback (`127.0.0.1`, `[::1]`, `localhost`) or a private-use scheme |
| Mobile application | An iOS or Android application | No | Authorization code + PKCE, refresh | A private-use scheme or a claimed `https://` address |
| Service | A server that acts as itself | Yes | Client credentials | None |

A private-use scheme names the application in reverse DNS order, such as `com.example.app:/callback` (RFC 8252).
Addresses are compared exactly; fragments, user information and wildcards are refused. Up to 10 redirection addresses
and 10 addresses after sign-out (where `/connect/logout` may send the account holder) are registered per application.

Every type but a service also lists the scopes the application may request (see below); each person still decides on
the consent page. The name (3 to 64 characters) is what the consent page shows; the homepage is optional and
`https://` only.

The console shows the client identifier (`pmo_…`) and, for a type with a secret, the client secret. The secret is
shown once and stored only as a hash; make a new one in the console if it is lost. An account can have 10 tokens.
Deleting an application ends every authorization and token it holds.

### Single-page applications

The token, revocation and user information endpoints answer CORS requests from the origins of the redirection
addresses that single-page applications registered, without credentials. The discovery documents and the key set
answer every origin.

## Endpoints

The discovery documents list everything: `/.well-known/openid-configuration` and
`/.well-known/oauth-authorization-server`.

| Endpoint | Address |
| --- | --- |
| Authorization | `https://authorize.progmasoft.com/connect/authorize` |
| End session | `https://authorize.progmasoft.com/connect/logout` |
| Token | `https://credentials.progmasoft.com/connect/token` |
| User information | `https://credentials.progmasoft.com/connect/userinfo` |
| Revocation | `https://credentials.progmasoft.com/connect/revoke` |
| Introspection | `https://credentials.progmasoft.com/connect/introspect` (web applications and services) |
| Key set | `https://credentials.progmasoft.com/.well-known/jwks` |

## Flows

- **Authorization code with PKCE**, for every type but a service. `code_challenge_method` must be `S256`; requests
  without a challenge, and `plain` challenges, are refused. Web applications also authenticate at the token endpoint
  with their secret (`client_secret_post` or `client_secret_basic`).
- **Refresh tokens**, with `offline_access`. Each refresh returns a new refresh token and retires the old one. A
  retired refresh token that is presented again is treated as stolen: the whole chain of tokens is revoked.
- **Client credentials**, for services. The token names the application itself (`sub` is the client identifier) and
  carries no account scope.

The implicit grant, the resource owner password grant and the device flow are not offered.

## Scopes

| Scope | Grants | Claims |
| --- | --- | --- |
| `openid` | An OpenID Connect sign-in: the account identifier | `sub` |
| `profile` | Reading the Progmasoft account name | `name`, `preferred_username` |
| `email` | Reading the email address the account signs in and registered with | `email`, `email_verified` |
| `viget.packages.read` | Reading the packages the account has published on ViGet | — |
| `viget.packages.publish` | Publishing packages to ViGet under the account | — |
| `viget.packages.yank` | Yanking packages of the account on ViGet | — |
| `offline_access` | Refresh tokens: access while the account holder is not signed in | — |

`sub` is a stable, opaque identifier; use it, not the account name or the address, to recognize an account. Account
registration does not verify email addresses, so `email_verified` is always `false`.

Access tokens that carry a ViGet scope have the audience `viget`; ViGet accepts only such tokens for its package
operations.

## Consent

Every application asks for consent, and the consent page lists each requested scope on its own line together with
the application's name, the account that registered it, and the host the account holder returns to. An application
that already holds consent for the requested scopes gets its code without the page, unless it sends
`prompt=consent`. `prompt=none` returns `login_required` or `consent_required` instead of showing a page.

Account holders review and withdraw consent at `https://authorize.progmasoft.com/account/applications`.
Withdrawing ends the application's tokens at once.

## Tokens

| Token | Lifetime |
| --- | --- |
| Authorization code | 2 minutes, single use |
| Access token | 15 minutes |
| Identity token | 15 minutes |
| Refresh token | 30 days, single use |

Identity tokens are signed JSON Web Tokens; verify them with the key set. Access tokens are encrypted for Progmasoft
services; a client treats them as opaque and asks the introspection or user information endpoint when it needs
their content.

## Limits

The token endpoint, the authorization endpoint and the console accept 60 requests a minute from one address; the
sign-in forms accept 12 in three minutes. More are answered with 429.
