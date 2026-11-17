// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { catalogMessages } from "./catalog-messages.ts";
import type { Locale } from "./localization";
import { productSlugs, products, type ProductSlug } from "./products.ts";

/**
 * schema.org data that search engines read from the pages, as JSON-LD.
 *
 * Progmasoft is described as an `Organization`, the general type; the
 * projects as `SoftwareSourceCode`, since each is open source with a public
 * repository. A project's text comes in the language of the page.
 */

const organizationId = "https://progmasoft.com/#organization";

/** Progmasoft itself, for progmasoft.com. */
export function organizationData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: "Progmasoft",
    url: "https://progmasoft.com/",
    logo: "https://progmasoft.com/apple-icon.png",
    email: "support@progmasoft.com",
    sameAs: ["https://github.com/Progmasoft"],
  };
}

/** The site progmasoft.com, published by Progmasoft. */
export function websiteData(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Progmasoft",
    url: "https://progmasoft.com/",
    inLanguage: locale,
    publisher: { "@id": organizationId },
  };
}

/**
 * The URLs of the licenses of an SPDX expression: one per license it names.
 * `A AND B` and `A OR B` name two; `A WITH E` names A.
 */
export function licenseUrls(expression: string): string[] {
  return expression
    .split(/\s+(?:AND|OR)\s+/)
    .map((term) =>
      term
        .replace(/[()]/g, "")
        .split(/\s+WITH\s+/)[0]
        ?.trim(),
    )
    .filter((id): id is string => Boolean(id))
    .map((id) => `https://spdx.org/licenses/${id}.html`);
}

/** One project, for its page on product.progmasoft.com. */
export function productData(slug: ProductSlug, locale: Locale) {
  const product = products[slug];
  const text = catalogMessages[locale].products[slug];
  const licenses = licenseUrls(product.license);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `https://product.progmasoft.com/${slug}#project`,
    name: product.name,
    alternateName: `Progmasoft ${product.name}`,
    description: text.description,
    abstract: text.tagline,
    url: `https://product.progmasoft.com/${slug}`,
    ...(product.site ? { sameAs: [product.site] } : {}),
    codeRepository: product.source,
    discussionUrl: product.issues,
    programmingLanguage: product.language,
    license: licenses.length === 1 ? licenses[0] : licenses,
    dateCreated: product.started,
    creativeWorkStatus:
      product.status === "released" ? "Released" : "In development",
    ...(product.latestRelease
      ? {
          version: product.latestRelease.version,
          dateModified: product.latestRelease.date,
        }
      : {}),
    keywords: text.features.join(", "),
    inLanguage: locale,
    author: { "@id": organizationId },
    publisher: {
      "@type": "Organization",
      "@id": organizationId,
      name: "Progmasoft",
      url: "https://progmasoft.com/",
    },
  };
}

/** The catalog of product.progmasoft.com: every project, in catalog order. */
export function catalogData(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Progmasoft projects",
    url: "https://product.progmasoft.com/",
    numberOfItems: productSlugs.length,
    itemListElement: productSlugs.map((slug, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://product.progmasoft.com/${slug}`,
      name: products[slug].name,
      description: catalogMessages[locale].products[slug].tagline,
    })),
  };
}

/**
 * The text of a JSON-LD script element. `<` is escaped so that no string in
 * the data can close the element.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
