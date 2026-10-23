// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

/**
 * Progmasoft OAuth at credentials.progmasoft.com: the types of its JSON
 * endpoints and the requests the pages make.
 *
 * The protocol endpoints (`/connect/*`, `/.well-known/*`) and the JSON
 * endpoints (`/api/v1/oauth/*`) belong to the account API on the same host;
 * these pages only call them.
 */

/** The types an application may have, in the order the portal offers them. */
export const applicationKinds = [
  "web",
  "spa",
  "desktop",
  "mobile",
  "service",
] as const;
export type ApplicationKind = (typeof applicationKinds)[number];

export function isApplicationKind(value: string): value is ApplicationKind {
  return applicationKinds.includes(value as ApplicationKind);
}

/** Whether applications of a type sign people in, and so register redirection addresses and scopes. */
export function signsPeopleIn(kind: ApplicationKind): boolean {
  return kind !== "service";
}

/** The scopes an application may request, in the order the pages list them. */
export const oauthScopes = [
  "profile",
  "email",
  "viget.packages.read",
  "viget.packages.publish",
  "viget.packages.yank",
  "offline_access",
] as const;
export type OAuthScope = (typeof oauthScopes)[number];

export interface ApplicationView {
  clientId: string;
  displayName: string;
  homepage: string;
  kind: ApplicationKind;
  isPublic: boolean;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  scopes: string[];
  createdAt: string;
}

export interface ApplicationList {
  applications: ApplicationView[];
  maximum: number;
}

export interface ApplicationCredentials {
  application: ApplicationView;
  clientSecret: string | null;
}

export interface ApplicationSubmission {
  kind: ApplicationKind;
  displayName: string;
  homepage: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  scopes: string[];
}

export interface AllowedApplication {
  authorizationId: string;
  displayName: string | null;
  scopes: string[];
  createdAt: string | null;
}

export interface ConsentView {
  clientId: string;
  displayName: string;
  homepage: string;
  owner: string | null;
  returnTo: string;
  scopes: string[];
  accountName: string;
}

export interface SessionView {
  accountName: string;
}

/** What a request to the JSON endpoints produced. */
export type ApiResult<T> =
  | { kind: "ok"; value: T }
  | { kind: "signedOut" }
  | { kind: "notFound" }
  | { kind: "refused"; errors: Record<string, string>; title?: string }
  | { kind: "failed" };

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

/**
 * Calls a JSON endpoint of Progmasoft OAuth on this host.
 *
 * The sign-in cookie of the OAuth host goes with the request; the browser adds
 * the `Origin` header the API checks for every request that changes state.
 */
export async function callOAuthApi<T>(
  path: string,
  init: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`/api/v1/oauth${path}`, {
      method: init.method ?? "GET",
      credentials: "same-origin",
      headers:
        init.body === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: init.signal,
    });
  } catch {
    return { kind: "failed" };
  }

  if (response.status === 401) {
    return { kind: "signedOut" };
  }
  if (response.status === 404) {
    return { kind: "notFound" };
  }
  if (response.status === 204) {
    return { kind: "ok", value: undefined as T };
  }
  if (response.ok) {
    return { kind: "ok", value: (await response.json()) as T };
  }
  if (response.status === 400) {
    const problem = (await response.json().catch(() => ({}))) as ProblemDetails;
    const errors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(problem.errors ?? {})) {
      if (messages[0]) {
        errors[field] = messages[0];
      }
    }
    return {
      kind: "refused",
      errors,
      title: problem.detail ?? problem.title,
    };
  }
  return { kind: "failed" };
}

/**
 * A return address that stays on this host.
 *
 * The sign-in page sends the account holder back to where they came from,
 * usually `/connect/authorize`; anything that would leave the host goes to `/`.
 */
export function localReturnUrl(value: string | null | undefined): string {
  if (!value || value[0] !== "/" || value.startsWith("//")) {
    return "/";
  }
  if (value.startsWith("/\\") || /[\u0000-\u001f]/.test(value)) {
    return "/";
  }
  return value;
}

/** The address of the sign-in page that returns to the current page. */
export function signInPath(returnTo: string): string {
  return `/signin?ReturnUrl=${encodeURIComponent(localReturnUrl(returnTo))}`;
}

/** Splits a text area into its non-empty lines, each once. */
export function lines(text: string): string[] {
  return [
    ...new Set(
      text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    ),
  ];
}

/** Drops the trailing slash of every path but the root. */
function trimmed(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

/**
 * The public pages of authorize.progmasoft.com and the internal routes that
 * render them: the home page, sign-in, the consent screen and the allowed
 * applications. Nginx sends `/connect` and `/api` of the host to the account
 * API; every other path reaches the proxy.
 */
export function authorizeRoute(pathname: string): string | null {
  const path = trimmed(pathname);
  if (path === "/") {
    return "/authorize";
  }
  if (path === "/signin" || path === "/consent") {
    return `/authorize${path}`;
  }
  if (path === "/account/applications") {
    return "/authorize/applications";
  }
  return null;
}

/**
 * The public pages of credentials.progmasoft.com, the issuer: only its home
 * page. Its endpoints and discovery documents belong to the account API.
 */
export function issuerRoute(pathname: string): string | null {
  return trimmed(pathname) === "/" ? "/issuer" : null;
}

/**
 * The public pages of console.progmasoft.com, the Progmasoft Console, and the
 * internal routes that render them: the overview and the OAuth 2.1
 * credentials under `/credentials` (the list, a new token in two steps, one
 * application). The console has no sign-in page: it uses the Progmasoft
 * account session.
 */
export function consoleRoute(pathname: string): string | null {
  const path = trimmed(pathname);
  if (path === "/") {
    return "/console";
  }
  if (path === "/credentials" || path === "/credentials/new") {
    return `/console${path}`;
  }
  const segments = path.split("/");
  if (segments[1] !== "credentials") {
    return null;
  }
  if (segments.length === 4 && segments[2] === "new" && segments[3]) {
    return `/console${path}`;
  }
  if (segments.length === 3 && segments[2]) {
    return `/console${path}`;
  }
  return null;
}
