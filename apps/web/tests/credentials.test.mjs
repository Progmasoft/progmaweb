// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applicationKinds,
  authorizeRoute,
  consoleRoute,
  issuerRoute,
  lines,
  localReturnUrl,
  oauthScopes,
  signInPath,
} from "../lib/credentials.ts";
import { credentialsMessages, format } from "../lib/credentials-messages.ts";
import { supportedLocales } from "../lib/localization.ts";

function shape(value) {
  if (typeof value !== "object" || value === null) {
    return typeof value;
  }
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, shape(value[key])]),
  );
}

test("every language has every message of the OAuth pages", () => {
  const english = shape(credentialsMessages["en-US"]);
  for (const locale of supportedLocales) {
    assert.deepEqual(shape(credentialsMessages[locale]), english, locale);
  }
});

test("every type and scope has its text in every language", () => {
  for (const locale of supportedLocales) {
    const messages = credentialsMessages[locale];
    for (const kind of applicationKinds) {
      assert.ok(messages.kinds[kind].title, `${locale} ${kind}`);
      assert.ok(messages.kinds[kind].description, `${locale} ${kind}`);
    }
    for (const scope of oauthScopes) {
      assert.ok(messages.scopes[scope], `${locale} ${scope}`);
    }
  }
});

test("the pages people see map to the authorize host's routes", () => {
  assert.equal(authorizeRoute("/"), "/authorize");
  assert.equal(authorizeRoute("/signin"), "/authorize/signin");
  assert.equal(authorizeRoute("/consent/"), "/authorize/consent");
  assert.equal(
    authorizeRoute("/account/applications"),
    "/authorize/applications",
  );
  for (const path of ["/login", "/register", "/credentials", "/new", "/x"]) {
    assert.equal(authorizeRoute(path), null, path);
  }
});

test("the issuer has its home page only", () => {
  assert.equal(issuerRoute("/"), "/issuer");
  for (const path of ["/signin", "/consent", "/account/applications"]) {
    assert.equal(issuerRoute(path), null, path);
  }
});

test("the public pages of the console map to the internal routes", () => {
  assert.equal(consoleRoute("/"), "/console");
  assert.equal(consoleRoute("/credentials/"), "/console/credentials");
  assert.equal(consoleRoute("/credentials/new"), "/console/credentials/new");
  assert.equal(
    consoleRoute("/credentials/new/spa"),
    "/console/credentials/new/spa",
  );
  assert.equal(
    consoleRoute("/credentials/pmo_abc"),
    "/console/credentials/pmo_abc",
  );
  for (const path of [
    "/signin",
    "/consent",
    "/account/applications",
    "/new",
    "/clients/pmo_abc",
    "/credentials/new/spa/x",
    "/login",
  ]) {
    assert.equal(consoleRoute(path), null, path);
  }
});

test("the sign-in page only returns to this host", () => {
  assert.equal(
    localReturnUrl("/connect/authorize?client_id=x"),
    "/connect/authorize?client_id=x",
  );
  for (const value of [
    "//attacker.example",
    "/\\attacker.example",
    "https://attacker.example/",
    "javascript:alert(1)",
    "",
    null,
    undefined,
  ]) {
    assert.equal(localReturnUrl(value), "/", String(value));
  }
  assert.equal(
    signInPath("/credentials/new/web"),
    "/signin?ReturnUrl=%2Fcredentials%2Fnew%2Fweb",
  );
});

test("text areas become distinct addresses and messages fill their placeholders", () => {
  assert.deepEqual(
    lines(" https://a.example/cb \n\nhttps://a.example/cb\nb "),
    ["https://a.example/cb", "b"],
  );
  assert.equal(format("Allow {name}?", { name: "Example" }), "Allow Example?");
  assert.equal(format("{count} tokens", { count: 10 }), "10 tokens");
});
