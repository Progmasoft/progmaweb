// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { test } from "node:test";
import { homeMessages } from "../lib/home-messages.ts";
import { supportedLocales } from "../lib/localization.ts";
import { sitesMessages } from "../lib/product-sites.ts";
import {
  catalogMessages,
  isProductSlug,
  productSlugs,
  products,
} from "../lib/products.ts";
import { catch3Route, productRoute } from "../lib/sites.ts";

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

test("every language has the same home, catalog and product-site text", () => {
  for (const messages of [homeMessages, catalogMessages, sitesMessages]) {
    const english = shape(messages["en-US"]);
    for (const locale of supportedLocales) {
      assert.deepEqual(shape(messages[locale]), english, locale);
    }
  }
});

test("the catalog lists the projects, each with its repository", () => {
  assert.deepEqual(
    [...productSlugs],
    ["tazel", "catch3", "agenceland", "archer", "etincelle"],
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
  assert.equal(products.catch3.site, "https://catch3.progmasoft.com/");
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
  assert.equal(catch3Route("/"), "/catch3");
  assert.equal(catch3Route("/docs"), null);
});
