// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "vitest";
import { homeMessages } from "../lib/home-messages.ts";
import { supportedLocales } from "../lib/localization.ts";
import {
  catalogMessages,
  isProductSlug,
  productSlugs,
  products,
} from "../lib/products.ts";
import { productRoute } from "../lib/sites.ts";
import { mcpMessages, mcpRoute } from "../lib/mcp-messages.ts";
import { gitMessages, gitRoute } from "../lib/git-messages.ts";

function shape(value) {
  if (Array.isArray(value)) {
    return ["array", value.length];
  }
  if (typeof value !== "object" || value === null) {
    return typeof value;
  }
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, shape(value[key])]),
  );
}

test("every language has the same home and catalog text", () => {
  for (const messages of [homeMessages, catalogMessages]) {
    const english = shape(messages["en-US"]);
    for (const locale of supportedLocales) {
      expect(shape(messages[locale]), locale).toStrictEqual(english);
    }
  }
});

test("the catalog lists the projects, each with its repository", () => {
  expect([...productSlugs]).toStrictEqual([
    "tazel",
    "catch3",
    "agenceland",
    "archer",
    "etincelle",
    "opentala",
  ]);
  for (const slug of productSlugs) {
    const product = products[slug];
    if (product.site !== undefined) {
      expect(product.site, slug).toMatch(/^https:\/\//);
    }
    expect(product.source, slug).toMatch(
      /^https:\/\/github\.com\/Progmasoft\//,
    );
    expect(product.issues, slug).toBe(`${product.source}/issues`);
    expect(product.started, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(
      product.status === "released",
      `${slug}: released exactly when it has a release`,
    ).toBe(product.latestRelease !== undefined);
  }
  expect(products.catch3.site).toBe("https://catch3.uk/");
  expect(isProductSlug("viget")).toBe(false);
  expect(isProductSlug("xide")).toBe(false);
});

test("the home page has a line for every product", () => {
  for (const locale of supportedLocales) {
    for (const slug of productSlugs) {
      expect(
        homeMessages[locale].lines[slug]?.length > 0,
        `${locale}: ${slug}`,
      ).toBeTruthy();
    }
  }
});

test("the product hosts map to their internal routes", () => {
  expect(productRoute("/")).toBe("/products");
  expect(productRoute("/tazel")).toBe("/products/tazel");
  expect(productRoute("/catch3/")).toBe("/products/catch3");
  expect(productRoute("/tazel/extra")).toBe(null);
  expect(productRoute("/../x")).toBe(null);
});

test("the MCP Marketplace has its root alone, in every language", () => {
  expect(mcpRoute("/")).toBe("/mcp");
  expect(mcpRoute("/servers")).toBe(null);
  expect(mcpRoute("/upload")).toBe(null);
  const english = shape(mcpMessages["en-US"]);
  for (const locale of supportedLocales) {
    expect(shape(mcpMessages[locale]), locale).toStrictEqual(english);
  }
});

test("git.progmasoft.com has its listing and the views of each repository", () => {
  const sha = "0123456789abcdef0123456789abcdef01234567";
  expect(gitRoute("/")).toBe("/git");
  expect(gitRoute("/tazel")).toBe("/git/tazel");
  expect(gitRoute("/tazel/")).toBe("/git/tazel");
  expect(gitRoute("/tazel/tree")).toBe("/git/tazel/tree");
  expect(gitRoute("/tazel/log")).toBe("/git/tazel/log");
  expect(gitRoute("/tazel/refs")).toBe("/git/tazel/refs");
  expect(gitRoute(`/tazel/commit/${sha}`)).toBe(`/git/tazel/commit/${sha}`);
  for (const path of [
    "/tazel.git",
    "/.hidden",
    "/tazel/commit/HEAD",
    "/tazel/commit",
    `/tazel/commit/${sha}/extra`,
    "/tazel/tree/src",
    "/tazel/blame",
    "/tazel/raw",
    "/tazel/info/refs",
  ]) {
    expect(gitRoute(path), path).toBe(null);
  }
  const english = shape(gitMessages["en-US"]);
  for (const locale of supportedLocales) {
    expect(shape(gitMessages[locale]), locale).toStrictEqual(english);
  }
});
