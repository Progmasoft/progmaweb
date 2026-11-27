// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "vitest";
import {
  contentSecurityPolicy,
  createNonce,
} from "../lib/content-security-policy.ts";

function directives(policy) {
  return new Map(
    policy.split("; ").map((directive) => {
      const [name, ...values] = directive.split(" ");
      return [name, values];
    }),
  );
}

test("a nonce is 128 random bits and differs on every call", () => {
  const nonces = new Set(Array.from({ length: 100 }, createNonce));
  expect(nonces.size).toBe(100);
  for (const nonce of nonces) {
    expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
  }
});

test("scripts run from this host, with the nonce, or from Cloudflare's beacon", () => {
  const policy = directives(contentSecurityPolicy("abc", false));
  expect(policy.get("script-src")).toStrictEqual([
    "'self'",
    "'nonce-abc'",
    "https://static.cloudflareinsights.com",
  ]);
  expect(policy.get("connect-src")).toStrictEqual([
    "'self'",
    "https://cloudflareinsights.com",
  ]);
  expect(policy.get("object-src")).toStrictEqual(["'none'"]);
  expect(policy.get("frame-ancestors")).toStrictEqual(["'none'"]);
  expect(policy.get("base-uri")).toStrictEqual(["'self'"]);
  // OAuth ends in redirects to other hosts after a form is sent.
  expect(policy.has("form-action")).toBe(false);
  for (const values of policy.values()) {
    expect(values.includes("'unsafe-eval'")).toBe(false);
    expect(values.includes("'strict-dynamic'")).toBe(false);
  }
  expect(policy.get("script-src").includes("'unsafe-inline'")).toBe(false);
});

test("only the development server may evaluate code", () => {
  const policy = directives(contentSecurityPolicy("abc", true));
  expect(policy.get("script-src").includes("'unsafe-eval'")).toBeTruthy();
});
