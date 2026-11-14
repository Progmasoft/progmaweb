// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import { catalogMessages, type CatalogMessages } from "./catalog-messages.ts";
import type { Locale } from "./localization";

export { catalogMessages, type CatalogMessages } from "./catalog-messages.ts";

/**
 * The projects of product.progmasoft.com, in the order the catalog lists
 * them. Each has a page there; the catalog introduces it and leads on.
 */
export const productSlugs = [
  "tazel",
  "catch3",
  "agenceland",
  "archer",
  "etincelle",
] as const;
export type ProductSlug = (typeof productSlugs)[number];

export function isProductSlug(value: string): value is ProductSlug {
  return productSlugs.includes(value as ProductSlug);
}

export const productCategories = [
  "build",
  "testing",
  "ide",
  "data-format",
  "data-processing",
] as const;
export type ProductCategory = (typeof productCategories)[number];

export const productLanguages = [
  "C++",
  "Java",
  "Kotlin",
  "TypeScript",
] as const;
export type ProductLanguage = (typeof productLanguages)[number];

/** `released` once a version is out; `development` before the first one. */
export const productStatuses = ["released", "development"] as const;
export type ProductStatus = (typeof productStatuses)[number];

export interface ProductRelease {
  version: string;
  /** The day it was published, as YYYY-MM-DD. */
  date: string;
  url: string;
}

export interface ProductFacts {
  name: string;
  /** The project's own site, when it has one. */
  site?: string;
  /** The public source repository. */
  source: string;
  issues: string;
  /** An SPDX license expression. */
  license: string;
  language: ProductLanguage;
  category: ProductCategory;
  status: ProductStatus;
  /** The day its repository was created, as YYYY-MM-DD. */
  started: string;
  /** The newest release, when there is one. */
  latestRelease?: ProductRelease;
  accent: "violet" | "blue" | "green" | "orange" | "teal" | "slate";
}

const progmasoftLicense = "MPL-2.0 WITH AdditionRef-Progmasoft-Exception-2.0";

function github(name: string) {
  return {
    source: `https://github.com/Progmasoft/${name}`,
    issues: `https://github.com/Progmasoft/${name}/issues`,
  };
}

export const products: Record<ProductSlug, ProductFacts> = {
  tazel: {
    name: "Tazel",
    site: "https://tazel.net/",
    ...github("tazel"),
    license: progmasoftLicense,
    language: "Kotlin",
    category: "build",
    status: "development",
    started: "2026-11-12",
    accent: "orange",
  },
  catch3: {
    name: "Catch3",
    site: "https://catch3.progmasoft.com/",
    ...github("catch3"),
    license: "BSL-1.0",
    language: "C++",
    category: "testing",
    status: "released",
    started: "2026-09-24",
    latestRelease: {
      version: "0.3.0.2",
      date: "2026-11-01",
      url: "https://github.com/Progmasoft/catch3/releases/tag/catch3-0.3.0.2",
    },
    accent: "green",
  },
  agenceland: {
    name: "Agenceland",
    ...github("agenceland"),
    license: "MIT",
    language: "TypeScript",
    category: "ide",
    status: "development",
    started: "2026-11-13",
    accent: "violet",
  },
  archer: {
    name: "Archer",
    ...github("archer"),
    license: progmasoftLicense,
    language: "Java",
    category: "data-format",
    status: "development",
    started: "2026-11-14",
    accent: "blue",
  },
  etincelle: {
    name: "Etincelle",
    ...github("etincelle"),
    license: progmasoftLicense,
    language: "Java",
    category: "data-processing",
    status: "development",
    started: "2026-11-14",
    accent: "teal",
  },
};

export function getCatalogMessages(locale: Locale): CatalogMessages {
  return catalogMessages[locale];
}

/** What the catalog's search form asks for; an empty field asks for anything. */
export interface ProductFilter {
  query: string;
  category?: ProductCategory;
  language?: ProductLanguage;
  status?: ProductStatus;
}

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function member<T extends string>(
  values: readonly T[],
  value: string,
): T | undefined {
  return values.includes(value as T) ? (value as T) : undefined;
}

/**
 * The filter of the catalog's query string: `q`, `category`, `language` and
 * `status`. A value the catalog does not know is the same as no value.
 */
export function parseProductFilter(
  search: Record<string, string | string[] | undefined>,
): ProductFilter {
  return {
    query: one(search.q).slice(0, 100),
    category: member(productCategories, one(search.category)),
    language: member(productLanguages, one(search.language)),
    status: member(productStatuses, one(search.status)),
  };
}

/**
 * The projects that match `filter`, in catalog order. The query matches the
 * name, the category, the tagline and the description in `locale`, without
 * regard to case.
 */
export function filterProducts(
  locale: Locale,
  filter: ProductFilter,
): ProductSlug[] {
  const messages = getCatalogMessages(locale);
  const query = filter.query.toLocaleLowerCase(locale);
  return productSlugs.filter((slug) => {
    const product = products[slug];
    if (filter.category && product.category !== filter.category) {
      return false;
    }
    if (filter.language && product.language !== filter.language) {
      return false;
    }
    if (filter.status && product.status !== filter.status) {
      return false;
    }
    if (query === "") {
      return true;
    }
    const text = messages.products[slug];
    return [
      product.name,
      messages.categories[product.category],
      text.tagline,
      text.description,
    ].some((field) => field.toLocaleLowerCase(locale).includes(query));
  });
}

/** The releases of every project, newest first. */
export function releases(): { slug: ProductSlug; release: ProductRelease }[] {
  return productSlugs
    .flatMap((slug) => {
      const release = products[slug].latestRelease;
      return release ? [{ slug, release }] : [];
    })
    .sort((a, b) => b.release.date.localeCompare(a.release.date));
}
