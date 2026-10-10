<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1 -->

# Development

## Requirements

| Tool | Version | Used for |
| --- | --- | --- |
| Node.js | 24 or newer | the Next.js application and its tests |
| pnpm | 11 or newer; the repository pins 11.24.0 | the JavaScript workspace |
| .NET SDK | 10 | the account API, its tests and DocFX |

`just` is optional. The `justfile` only names the commands below; it adds no logic of its own.

## Repository layout

```text
apps/web          Next.js application: pages, components, localization, host routing
apps/api          ASP.NET Core account API
apps/api-tests    xUnit tests of the API, run against the application in memory and against PostgreSQL
docs              this documentation and the DocFX project in docs/api
ops               Nginx, systemd and mail configuration with their runbooks
```

## Run it locally

Install the JavaScript dependencies once, then start the frontend:

```text
pnpm install --frozen-lockfile
pnpm dev
```

Start the account API in a second terminal on the port the frontend expects:

```text
dotnet run --project apps/api/Progmaweb.Api.csproj --urls http://127.0.0.1:5085
```

The frontend forwards `/api/*` to `PROGMAWEB_API_ORIGIN`, which defaults to `http://127.0.0.1:5085`. Set it when the
API listens elsewhere; `.env.example` shows the variable.

Open the three surfaces through their development host names:

| URL | Surface |
| --- | --- |
| `http://localhost:3000/` | organization homepage |
| `http://account.localhost:3000/` | account pages |
| `http://viget.localhost:3000/` | ViGet catalogs |

Accounts created locally live in the memory of the API process and are gone when it stops. To keep them, point the
API at a PostgreSQL database before it starts; it creates its tables itself:

```text
ConnectionStrings__Accounts=Host=localhost;Database=progmaweb_accounts;Username=<role>
```

Production always uses PostgreSQL; see [Operations](../ops/README.md).

Sign-in with Google is optional locally. It needs the identifier and secret of a Google OAuth client in
`Authentication__Google__ClientId` and `Authentication__Google__ClientSecret`, set in the environment before the API
starts. Without them everything else works and the Google button leads to a 503 from the API. Never commit the
downloaded Google client file.

## Checks

Run these before opening a pull request. They are the same commands CI runs.

```text
pnpm check            # route types and TypeScript
pnpm test             # Node tests of localization and metadata
pnpm lint             # ESLint, no warnings allowed
pnpm build            # production build
pnpm format           # Prettier (writes)

dotnet build Progmaweb.slnx --configuration Release
dotnet test --project apps/api-tests/Progmaweb.Api.Tests.csproj --configuration Release
```

`just verify` runs the type check, the production build, the API build and the API tests in one go.

The .NET projects treat every warning as an error and restore in locked mode in CI. After changing a NuGet reference,
restore without `--locked-mode` once and commit the updated `packages.lock.json`.

A user-interface change is not verified by these commands alone. Look at it in a browser: all four languages, both
themes, a narrow window, and keyboard focus.

## Tests

- **Frontend** (`apps/web/tests`): the list of published locales, the shape of every message tree, language
  negotiation, cookie attributes, text direction and page metadata. The tests import the TypeScript sources directly
  and do not start a server.
- **Account store** (`apps/api-tests`): one set of rules, `AccountStoreContractTests`, run against the in-memory
  store and against PostgreSQL, so the two cannot drift apart; the schema steps; and an account with its session
  surviving a restart of the service. The PostgreSQL tests need the connection string of a database whose user may
  create schemas in `PROGMAWEB_TEST_POSTGRES`; each test works in a schema of its own and removes it. Without the
  variable they are skipped locally. CI starts PostgreSQL for them and fails when the variable is missing.
- **API** (`apps/api-tests`): the endpoints through an in-memory application, including validation, duplicate names
  and addresses, session cookies, the Google flow and security headers; and the account service on its own. The rate
  limit has no automated test.

## Continuous integration

| Workflow | Runs on | Enforces |
| --- | --- | --- |
| Frontend | changes under `apps/web` and the workspace files | type check, tests with coverage, lint, build |
| Backend | changes under `apps/api`, `apps/api-tests`, `docs/api` and the tool manifest | locked restore, build, tests with coverage, the DocFX gate |
| Security | every push and pull request, and weekly | dependency review of the pull request, `pnpm audit` at high severity, NuGet vulnerability audit |
| CodeQL | pushes, pull requests, and weekly | static analysis of the workflows, TypeScript and C# |

Coverage is uploaded to Codecov by separate jobs. Only those jobs receive an OIDC token; installation, build and test
jobs do not, and pull requests from forks skip the upload. Renovate proposes weekly updates for GitHub Actions, npm
and NuGet and never merges them itself.

`main` is protected: changes arrive through pull requests with green checks.

### The dependency audit exception

`pnpm-workspace.yaml` tells the audit to ignore one advisory, `GHSA-vfj7-8cjw-p6xm` (`braces` 3.0.3 and older). No
fixed release exists, and the package is reached only through the lint toolchain; it is not part of the built or
deployed application. Every other advisory of high severity still fails the check. Remove the entry as soon as a
release without the advisory is available, and do not add another entry without the same analysis written next to it.

## API reference

`docs/api` is a DocFX project that builds a reference from the C# sources. `.config/dotnet-tools.json` pins the DocFX
version, so a local run and CI use the same tool.

```text
dotnet tool restore
dotnet docfx docs/api/docfx.json --warningsAsErrors
dotnet run docs/api/CheckDocumentation.cs -- docs/api
```

or `just api-docs`. The output goes to `docs/api/_site`, which is ignored by Git.

The gate fails on a broken link or an unresolved reference, on a public declaration without a documentation comment,
and on any namespace, type or member of the reference that has no summary, internal and private ones included. A new
declaration therefore needs its `<summary>` in the same change. [The API reference page](api/index.md) describes the
three parts of the gate and how a namespace is described.

## Conventions

- Public documents, comments, commit messages and pull request text are written in American English.
- Every file carries the SPDX header of the repository; `REUSE.toml` covers the formats that cannot hold a comment.
- A user-visible string is added to every locale in the same change. See [Localization](LOCALIZATION.md).
- Secrets, generated output and downloaded credentials are never committed.
