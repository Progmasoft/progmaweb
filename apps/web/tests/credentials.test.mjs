// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "vitest";
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
    expect(shape(credentialsMessages[locale]), locale).toStrictEqual(english);
  }
});

test("every type and scope has its text in every language", () => {
  for (const locale of supportedLocales) {
    const messages = credentialsMessages[locale];
    for (const kind of applicationKinds) {
      expect(messages.kinds[kind].title, `${locale} ${kind}`).toBeTruthy();
      expect(
        messages.kinds[kind].description,
        `${locale} ${kind}`,
      ).toBeTruthy();
    }
    for (const scope of oauthScopes) {
      expect(messages.scopes[scope], `${locale} ${scope}`).toBeTruthy();
    }
  }
});

test("the pages people see map to the authorize host's routes", () => {
  expect(authorizeRoute("/")).toBe("/authorize");
  expect(authorizeRoute("/signin")).toBe("/authorize/signin");
  expect(authorizeRoute("/consent/")).toBe("/authorize/consent");
  expect(authorizeRoute("/account/applications")).toBe(
    "/authorize/applications",
  );
  for (const path of ["/login", "/register", "/credentials", "/new", "/x"]) {
    expect(authorizeRoute(path), path).toBe(null);
  }
});

test("the issuer has its home page only", () => {
  expect(issuerRoute("/")).toBe("/issuer");
  for (const path of ["/signin", "/consent", "/account/applications"]) {
    expect(issuerRoute(path), path).toBe(null);
  }
});

test("the public pages of the console map to the internal routes", () => {
  expect(consoleRoute("/")).toBe("/console");
  expect(consoleRoute("/credentials/")).toBe("/console/credentials");
  expect(consoleRoute("/credentials/new")).toBe("/console/credentials/new");
  expect(consoleRoute("/credentials/new/spa")).toBe(
    "/console/credentials/new/spa",
  );
  expect(consoleRoute("/credentials/pmo_abc")).toBe(
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
    expect(consoleRoute(path), path).toBe(null);
  }
});

test("the sign-in page only returns to this host", () => {
  expect(localReturnUrl("/connect/authorize?client_id=x")).toBe(
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
    expect(localReturnUrl(value), String(value)).toBe("/");
  }
  expect(signInPath("/credentials/new/web")).toBe(
    "/signin?ReturnUrl=%2Fcredentials%2Fnew%2Fweb",
  );
});

test("text areas become distinct addresses and messages fill their placeholders", () => {
  expect(
    lines(" https://a.example/cb \n\nhttps://a.example/cb\nb "),
  ).toStrictEqual(["https://a.example/cb", "b"]);
  expect(format("Allow {name}?", { name: "Example" })).toBe("Allow Example?");
  expect(format("{count} tokens", { count: 10 })).toBe("10 tokens");
});
