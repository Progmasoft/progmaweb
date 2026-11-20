// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import assert from "node:assert/strict";
import test from "node:test";
import { llmsText } from "../lib/llms.ts";
import { supportedLocales } from "../lib/localization.ts";
import { productSlugs, products } from "../lib/products.ts";
import {
  catalogData,
  jsonLd,
  licenseUrls,
  organizationData,
  productData,
  websiteData,
} from "../lib/structured-data.ts";

const locales = supportedLocales;

test("an SPDX expression gives one URL per license it names", () => {
  assert.deepEqual(licenseUrls("MIT"), ["https://spdx.org/licenses/MIT.html"]);
  assert.deepEqual(licenseUrls("BSL-1.0 AND LGPL-3.0-or-later"), [
    "https://spdx.org/licenses/BSL-1.0.html",
    "https://spdx.org/licenses/LGPL-3.0-or-later.html",
  ]);
  assert.deepEqual(licenseUrls("(MIT OR Apache-2.0)"), [
    "https://spdx.org/licenses/MIT.html",
    "https://spdx.org/licenses/Apache-2.0.html",
  ]);
  assert.deepEqual(licenseUrls("GPL-2.0-only WITH Classpath-exception-2.0"), [
    "https://spdx.org/licenses/GPL-2.0-only.html",
  ]);
});

test("every project has its data in every language", () => {
  for (const slug of productSlugs) {
    for (const locale of locales) {
      const data = productData(slug, locale);
      assert.equal(data["@type"], "SoftwareSourceCode");
      assert.equal(data.name, products[slug].name);
      assert.equal(data.codeRepository, products[slug].source);
      assert.equal(data.inLanguage, locale);
      assert.ok(data.description.length > 20, `${slug} ${locale}`);
      assert.ok(data.license, `${slug} has a license`);
      assert.equal(data.version, products[slug].latestRelease?.version);
    }
  }
});

test("a released project names its version, one in development does not", () => {
  assert.equal(productData("catch3", "en-US").creativeWorkStatus, "Released");
  assert.equal(
    productData("tazel", "en-US").creativeWorkStatus,
    "In development",
  );
  assert.equal(productData("tazel", "en-US").version, undefined);
});

test("the catalog lists every project in order", () => {
  const data = catalogData("en-US");
  assert.equal(data.numberOfItems, productSlugs.length);
  assert.deepEqual(
    data.itemListElement.map((item) => item.position),
    productSlugs.map((_, index) => index + 1),
  );
});

test("the organization and the site point at each other", () => {
  assert.equal(
    websiteData("en-US").publisher["@id"],
    organizationData()["@id"],
  );
  assert.equal(organizationData()["@type"], "Organization");
});

test("JSON-LD text cannot close its script element", () => {
  const text = jsonLd({ name: "</script><script>alert(1)</script>" });
  assert.ok(!text.includes("</script>"));
  assert.deepEqual(JSON.parse(text), {
    name: "</script><script>alert(1)</script>",
  });
});

test("llms.txt lists every project with its facts and names no former project", () => {
  const text = llmsText();
  assert.match(text, /^# Progmasoft\n\n> /);
  for (const slug of productSlugs) {
    assert.ok(text.includes(`(https://product.progmasoft.com/${slug})`), slug);
    assert.ok(text.includes(products[slug].license), `${slug} license`);
  }
  assert.ok(text.includes("latest release 0.4.0"));
  assert.ok(text.includes("latest release 0.1.0"));
  for (const word of [/\bTala\b/, /\bXide\b/, /\bTalac\b/, /\bX#/]) {
    assert.ok(!word.test(text), String(word));
  }
});
