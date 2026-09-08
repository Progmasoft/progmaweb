<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1 -->

# Progmaweb

Progmaweb is the public web and account surface for Progmasoft. The repository intentionally keeps presentation and
account policy in one deployable workspace while preserving a strict process boundary between the Next.js frontend and
the ASP.NET Core API.

## Public hosts

- `progmasoft.com` serves the canonical organization homepage; `www.progmasoft.com` redirects to it.
- `account.progmasoft.com` serves account discovery and authentication.
- `account.progmasoft.com/login` signs an existing account in.
- `account.progmasoft.com/register` creates a new account after server-side validation.
- `account.progmasoft.com/<Account>/dashboard` serves the authenticated account dashboard.

Account names preserve their original display case but reserve names case-insensitively, preventing visually confusing
duplicates. Email uniqueness is also evaluated case-insensitively by the API.

ViGet does not maintain a separate publisher name. A package coordinate's `<Publisher>` segment is exactly the
canonical Progmasoft `<Account>` name, with the same spelling and case.

## Architecture

- `apps/web` is a Next.js App Router application. Host-aware routing keeps the public organization and account surfaces in one
  build without coupling their page hierarchy.
- `apps/api` is an ASP.NET Core minimal API. It owns account-name policy, password hashing, session issuance, secure
  cookies, rate limiting, and authorization.
- The browser never receives password hashes, session digests, deployment secrets, or database credentials.
- Production account maintenance is an explicit operations workflow. The public API does not contain bulk-delete,
  reset-all, seed-password, or environment-password endpoints.

## Requirements

- Node.js 24 or newer
- pnpm 11 or newer
- .NET SDK 10

The initial Progmaweb release, Git tag, and GitHub Release use version `1.0.0`. Visual X# compiler versions belong to
the language repositories and do not determine this website's version.

## Development

Install frontend dependencies and start Next.js:

```text
pnpm install --frozen-lockfile
pnpm dev
```

Start the account API in another terminal:

```text
dotnet run --project apps/api/Progmaweb.Api.csproj
```

The frontend defaults to `http://localhost:5085` for server-side API requests. Set `PROGMAWEB_API_ORIGIN` when the API
uses another origin. Browser requests use the same-origin `/api` boundary so production can proxy them without exposing
an internal address.

Google sign-in uses a server-side authorization-code flow. Configure `Authentication__Google__ClientId` and
`Authentication__Google__ClientSecret` only in the process environment or secret manager. The production OAuth client
uses `https://account.progmasoft.com` as its JavaScript origin and
`https://account.progmasoft.com/api/v1/accounts/oauth/google/callback` as its exact redirect URI. Never commit the
downloaded Google client JSON.

## Verification

```text
pnpm check
pnpm build
dotnet build apps/api/Progmaweb.Api.csproj --configuration Release
dotnet test --project apps/api-tests/Progmaweb.Api.Tests.csproj --configuration Release
```

## License

Progmaweb project-owned source code is licensed under `AGPL-3.0-or-later`, matching the Visual X# website, with the
additional Progmasoft Patent Grant, Version 1.1. See `LICENSE.txt`, `PATENTS`,
`LICENSES/AdditionRef-Progmasoft-Patent-Grant-1.1.txt`, and `NOTICE.txt`. Third-party dependencies remain under their
respective licenses.
