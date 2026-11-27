// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "vitest";
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
  expect(licenseUrls("MIT")).toStrictEqual([
    "https://spdx.org/licenses/MIT.html",
  ]);
  expect(licenseUrls("BSL-1.0 AND LGPL-3.0-or-later")).toStrictEqual([
    "https://spdx.org/licenses/BSL-1.0.html",
    "https://spdx.org/licenses/LGPL-3.0-or-later.html",
  ]);
  expect(licenseUrls("(MIT OR Apache-2.0)")).toStrictEqual([
    "https://spdx.org/licenses/MIT.html",
    "https://spdx.org/licenses/Apache-2.0.html",
  ]);
  expect(
    licenseUrls("GPL-2.0-only WITH Classpath-exception-2.0"),
  ).toStrictEqual(["https://spdx.org/licenses/GPL-2.0-only.html"]);
});

test("every project has its data in every language", () => {
  for (const slug of productSlugs) {
    for (const locale of locales) {
      const data = productData(slug, locale);
      expect(data["@type"]).toBe("SoftwareSourceCode");
      expect(data.name).toBe(products[slug].name);
      expect(data.codeRepository).toBe(products[slug].source);
      expect(data.inLanguage).toBe(locale);
      expect(data.description.length > 20, `${slug} ${locale}`).toBeTruthy();
      expect(data.license, `${slug} has a license`).toBeTruthy();
      expect(data.version).toBe(products[slug].latestRelease?.version);
    }
  }
});

test("a released project names its version, one in development does not", () => {
  expect(productData("catch3", "en-US").creativeWorkStatus).toBe("Released");
  expect(productData("tazel", "en-US").version).toBe("0.2.0");
  expect(productData("archer", "en-US").creativeWorkStatus).toBe(
    "In development",
  );
  expect(productData("archer", "en-US").version).toBe(undefined);
});

test("the catalog lists every project in order", () => {
  const data = catalogData("en-US");
  expect(data.numberOfItems).toBe(productSlugs.length);
  expect(data.itemListElement.map((item) => item.position)).toStrictEqual(
    productSlugs.map((_, index) => index + 1),
  );
});

test("the organization and the site point at each other", () => {
  expect(websiteData("en-US").publisher["@id"]).toBe(organizationData()["@id"]);
  expect(organizationData()["@type"]).toBe("Organization");
});

test("JSON-LD text cannot close its script element", () => {
  const text = jsonLd({ name: "</script><script>alert(1)</script>" });
  expect(!text.includes("</script>")).toBeTruthy();
  expect(JSON.parse(text)).toStrictEqual({
    name: "</script><script>alert(1)</script>",
  });
});

test("llms.txt lists every project with its facts and names no former project", () => {
  const text = llmsText();
  expect(text).toMatch(/^# Progmasoft\n\n> /);
  for (const slug of productSlugs) {
    expect(
      text.includes(`(https://product.progmasoft.com/${slug})`),
      slug,
    ).toBeTruthy();
    expect(
      text.includes(products[slug].license),
      `${slug} license`,
    ).toBeTruthy();
  }
  expect(text.includes("latest release 0.4.0")).toBeTruthy();
  expect(text.includes("latest release 0.2.0")).toBeTruthy();
  for (const word of [/\bTala\b/, /\bXide\b/, /\bTalac\b/, /\bX#/]) {
    expect(!word.test(text), String(word)).toBeTruthy();
  }
});
