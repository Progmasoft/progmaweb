// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { test } from "node:test";
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
  assert.equal(nonces.size, 100);
  for (const nonce of nonces) {
    assert.match(nonce, /^[A-Za-z0-9+/]{22}==$/);
  }
});

test("scripts run from this host, with the nonce, or from Cloudflare's beacon", () => {
  const policy = directives(contentSecurityPolicy("abc", false));
  assert.deepEqual(policy.get("script-src"), [
    "'self'",
    "'nonce-abc'",
    "https://static.cloudflareinsights.com",
  ]);
  assert.deepEqual(policy.get("connect-src"), [
    "'self'",
    "https://cloudflareinsights.com",
  ]);
  assert.deepEqual(policy.get("object-src"), ["'none'"]);
  assert.deepEqual(policy.get("frame-ancestors"), ["'none'"]);
  assert.deepEqual(policy.get("base-uri"), ["'self'"]);
  // OAuth ends in redirects to other hosts after a form is sent.
  assert.equal(policy.has("form-action"), false);
  for (const values of policy.values()) {
    assert.equal(values.includes("'unsafe-eval'"), false);
    assert.equal(values.includes("'strict-dynamic'"), false);
  }
  assert.equal(policy.get("script-src").includes("'unsafe-inline'"), false);
});

test("only the development server may evaluate code", () => {
  const policy = directives(contentSecurityPolicy("abc", true));
  assert.ok(policy.get("script-src").includes("'unsafe-eval'"));
});
