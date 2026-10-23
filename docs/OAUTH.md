<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1 -->

# Progmasoft OAuth

Progmasoft OAuth lets any application sign people in with their Progmasoft account and, with their consent, act on
their behalf. It is an OAuth 2.1 authorization server and an OpenID Connect provider at
`https://credentials.progmasoft.com/`. Any developer with a Progmasoft account can register applications.

## Register an application

Sign in at `https://credentials.progmasoft.com/developers` and register the application:

| Field | Meaning |
| --- | --- |
| Type | **Confidential** for a server that keeps a client secret; **public** for a browser or native application, which has no secret. The type cannot change later. |
| Name | What the consent page shows, 3 to 64 characters. |
| Homepage | Optional, `https://` only. |
| Redirection addresses | Up to 10, compared exactly. `https://` addresses; `http://` only for a loopback address (`127.0.0.1`, `[::1]`, `localhost`); for public clients also a private-use scheme in reverse DNS order, such as `com.example.app:/callback` (RFC 8252). No fragments, user information or wildcards. |
| Addresses after sign-out | Optional, the same rules; where `/connect/logout` may send the account holder. |
| Scopes | The scopes the application may request; see below. |
| Service access | Allows the client credentials grant; confidential clients only. |

The portal shows the client identifier (`pmo_…`) and, for a confidential client, the client secret. The secret is
shown once and stored only as a hash; make a new one in the portal if it is lost. An account can register 10
applications. Deleting an application ends every authorization and token it holds.

## Endpoints

The discovery documents list everything: `/.well-known/openid-configuration` and
`/.well-known/oauth-authorization-server`.

| Endpoint | Path |
| --- | --- |
| Authorization | `/connect/authorize` |
| Token | `/connect/token` |
| User information | `/connect/userinfo` |
| End session | `/connect/logout` |
| Revocation | `/connect/revoke` |
| Introspection | `/connect/introspect` (confidential clients) |
| Key set | `/.well-known/jwks` |

## Flows

- **Authorization code with PKCE**, for every client. `code_challenge_method` must be `S256`; requests without a
  challenge, and `plain` challenges, are refused. Confidential clients also authenticate at the token endpoint with
  their secret (`client_secret_post` or `client_secret_basic`).
- **Refresh tokens**, with `offline_access`. Each refresh returns a new refresh token and retires the old one. A
  retired refresh token that is presented again is treated as stolen: the whole chain of tokens is revoked.
- **Client credentials**, when allowed. The token names the application itself (`sub` is the client identifier) and
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

Account holders review and withdraw consent at `https://credentials.progmasoft.com/account/applications`.
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

The token endpoint, the authorization endpoint and the portal accept 60 requests a minute from one address; the
sign-in form accepts 12 in three minutes. More are answered with 429.
