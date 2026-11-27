// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "vitest";
import { supportedLocales } from "../lib/localization.ts";
import {
  filterProducts,
  parseProductFilter,
  productSlugs,
  releases,
} from "../lib/products.ts";

const anything = { query: "" };

test("an empty search finds every project in catalog order", () => {
  for (const locale of supportedLocales) {
    expect(filterProducts(locale, anything), locale).toStrictEqual([
      ...productSlugs,
    ]);
  }
});

test("the query matches names, categories and text without regard to case", () => {
  expect(filterProducts("en-US", { query: "ARCHER" })).toStrictEqual([
    "archer",
  ]);
  expect(filterProducts("en-US", { query: "jvm" })).toStrictEqual([
    "archer",
    "etincelle",
  ]);
  expect(filterProducts("en-US", { query: "spark" })).toStrictEqual([
    "etincelle",
  ]);
  expect(filterProducts("en-US", { query: "build system" })).toStrictEqual([
    "tazel",
  ]);
  expect(filterProducts("de-DE", { query: "testwerkzeug" })).toStrictEqual([]);
  expect(filterProducts("de-DE", { query: "testen" })).toStrictEqual([
    "catch3",
  ]);
  expect(filterProducts("en-US", { query: "no such project" })).toStrictEqual(
    [],
  );
});

test("category, language and status narrow the search together", () => {
  expect(
    filterProducts("en-US", { query: "", language: "Java" }),
  ).toStrictEqual(["archer", "etincelle"]);
  expect(
    filterProducts("en-US", { query: "", status: "released" }),
  ).toStrictEqual(["tazel", "catch3", "opentala"]);
  expect(
    filterProducts("en-US", {
      query: "",
      language: "Java",
      category: "data-format",
    }),
  ).toStrictEqual(["archer"]);
  expect(
    filterProducts("en-US", {
      query: "",
      language: "Java",
      status: "released",
    }),
  ).toStrictEqual([]);
});

test("the query string becomes a filter; unknown values ask for anything", () => {
  expect(
    parseProductFilter({
      q: "  ide ",
      category: "ide",
      language: "Java",
      status: "released",
    }),
  ).toStrictEqual({
    query: "ide",
    category: "ide",
    language: "Java",
    status: "released",
  });
  expect(
    parseProductFilter({
      q: ["a", "b"],
      category: "games",
      language: "Rust",
      status: "dead",
    }),
  ).toStrictEqual({
    query: "a",
    category: undefined,
    language: undefined,
    status: undefined,
  });
  expect(parseProductFilter({ q: "x".repeat(500) }).query.length).toBe(100);
  expect(parseProductFilter({})).toStrictEqual({
    query: "",
    category: undefined,
    language: undefined,
    status: undefined,
  });
});

test("releases are newest first", () => {
  const list = releases();
  for (let i = 1; i < list.length; i++) {
    expect(list[i - 1].release.date >= list[i].release.date).toBeTruthy();
  }
  expect(list.some(({ slug }) => slug === "catch3")).toBeTruthy();
});
