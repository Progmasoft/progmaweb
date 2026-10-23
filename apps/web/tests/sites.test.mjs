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
import { catch3Route, idesRoute, productRoute } from "../lib/sites.ts";

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

test("the catalog lists the products the user named, each with a site", () => {
  assert.deepEqual(
    [...productSlugs],
    ["tala-lang", "talac", "talafmt", "talalint", "tazel", "xide", "catch3"],
  );
  for (const slug of productSlugs) {
    assert.match(products[slug].site, /^https:\/\//, slug);
    assert.match(
      products[slug].source,
      /^https:\/\/github\.com\/Progmasoft\//,
      slug,
    );
  }
  assert.equal(products.xide.site, "https://ides.progmasoft.com/xide");
  assert.equal(products.catch3.site, "https://catch3.progmasoft.com/");
  assert.equal(isProductSlug("viget"), false);
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
  assert.equal(productRoute("/talac"), "/products/talac");
  assert.equal(productRoute("/tala-lang/"), "/products/tala-lang");
  assert.equal(productRoute("/talac/extra"), null);
  assert.equal(productRoute("/../x"), null);
  assert.equal(idesRoute("/"), "/ides");
  assert.equal(idesRoute("/xide"), "/ides/xide");
  assert.equal(idesRoute("/other"), null);
  assert.equal(catch3Route("/"), "/catch3");
  assert.equal(catch3Route("/docs"), null);
});
