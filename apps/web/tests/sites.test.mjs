// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import assert from "node:assert/strict";
import { test } from "node:test";
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
      assert.deepEqual(shape(messages[locale]), english, locale);
    }
  }
});

test("the catalog lists the projects, each with its repository", () => {
  assert.deepEqual(
    [...productSlugs],
    ["tazel", "catch3", "agenceland", "archer", "etincelle", "opentala"],
  );
  for (const slug of productSlugs) {
    const product = products[slug];
    if (product.site !== undefined) {
      assert.match(product.site, /^https:\/\//, slug);
    }
    assert.match(product.source, /^https:\/\/github\.com\/Progmasoft\//, slug);
    assert.equal(product.issues, `${product.source}/issues`, slug);
    assert.match(product.started, /^\d{4}-\d{2}-\d{2}$/, slug);
    assert.equal(
      product.status === "released",
      product.latestRelease !== undefined,
      `${slug}: released exactly when it has a release`,
    );
  }
  assert.equal(products.catch3.site, "https://catch3.uk/");
  assert.equal(isProductSlug("viget"), false);
  assert.equal(isProductSlug("xide"), false);
});

test("the home page names areas, not products", () => {
  const productNames = Object.values(products).map((product) => product.name);
  for (const locale of supportedLocales) {
    for (const [title, description] of homeMessages[locale].pool.areas) {
      for (const name of productNames) {
        assert.ok(!title.includes(name), `${locale}: ${title}`);
        assert.ok(!description.includes(name), `${locale}: ${description}`);
      }
    }
  }
});

test("the product hosts map to their internal routes", () => {
  assert.equal(productRoute("/"), "/products");
  assert.equal(productRoute("/tazel"), "/products/tazel");
  assert.equal(productRoute("/catch3/"), "/products/catch3");
  assert.equal(productRoute("/tazel/extra"), null);
  assert.equal(productRoute("/../x"), null);
});

test("the MCP Marketplace has its root alone, in every language", () => {
  assert.equal(mcpRoute("/"), "/mcp");
  assert.equal(mcpRoute("/servers"), null);
  assert.equal(mcpRoute("/upload"), null);
  const english = shape(mcpMessages["en-US"]);
  for (const locale of supportedLocales) {
    assert.deepEqual(shape(mcpMessages[locale]), english, locale);
  }
});

test("git.progmasoft.com has its listing and the views of each repository", () => {
  const sha = "0123456789abcdef0123456789abcdef01234567";
  assert.equal(gitRoute("/"), "/git");
  assert.equal(gitRoute("/tazel"), "/git/tazel");
  assert.equal(gitRoute("/tazel/"), "/git/tazel");
  assert.equal(gitRoute("/tazel/tree"), "/git/tazel/tree");
  assert.equal(gitRoute("/tazel/log"), "/git/tazel/log");
  assert.equal(gitRoute("/tazel/refs"), "/git/tazel/refs");
  assert.equal(gitRoute(`/tazel/commit/${sha}`), `/git/tazel/commit/${sha}`);
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
    assert.equal(gitRoute(path), null, path);
  }
  const english = shape(gitMessages["en-US"]);
  for (const locale of supportedLocales) {
    assert.deepEqual(shape(gitMessages[locale]), english, locale);
  }
});
