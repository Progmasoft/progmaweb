// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { test } from "node:test";
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
    assert.deepEqual(
      filterProducts(locale, anything),
      [...productSlugs],
      locale,
    );
  }
});

test("the query matches names, categories and text without regard to case", () => {
  assert.deepEqual(filterProducts("en-US", { query: "ARCHER" }), [
    "archer",
    "etincelle",
  ]);
  assert.deepEqual(filterProducts("en-US", { query: "spark" }), ["etincelle"]);
  assert.deepEqual(filterProducts("en-US", { query: "build system" }), [
    "tazel",
  ]);
  assert.deepEqual(filterProducts("de-DE", { query: "testwerkzeug" }), []);
  assert.deepEqual(filterProducts("de-DE", { query: "testen" }), ["catch3"]);
  assert.deepEqual(filterProducts("en-US", { query: "no such project" }), []);
});

test("category, language and status narrow the search together", () => {
  assert.deepEqual(filterProducts("en-US", { query: "", language: "Java" }), [
    "archer",
    "etincelle",
  ]);
  assert.deepEqual(filterProducts("en-US", { query: "", status: "released" }), [
    "catch3",
  ]);
  assert.deepEqual(
    filterProducts("en-US", {
      query: "",
      language: "Java",
      category: "data-format",
    }),
    ["archer"],
  );
  assert.deepEqual(
    filterProducts("en-US", {
      query: "",
      language: "Java",
      status: "released",
    }),
    [],
  );
});

test("the query string becomes a filter; unknown values ask for anything", () => {
  assert.deepEqual(
    parseProductFilter({
      q: "  ide ",
      category: "ide",
      language: "Java",
      status: "released",
    }),
    { query: "ide", category: "ide", language: "Java", status: "released" },
  );
  assert.deepEqual(
    parseProductFilter({
      q: ["a", "b"],
      category: "games",
      language: "Rust",
      status: "dead",
    }),
    { query: "a", category: undefined, language: undefined, status: undefined },
  );
  assert.equal(parseProductFilter({ q: "x".repeat(500) }).query.length, 100);
  assert.deepEqual(parseProductFilter({}), {
    query: "",
    category: undefined,
    language: undefined,
    status: undefined,
  });
});

test("releases are newest first", () => {
  const list = releases();
  for (let i = 1; i < list.length; i++) {
    assert.ok(list[i - 1].release.date >= list[i].release.date);
  }
  assert.ok(list.some(({ slug }) => slug === "catch3"));
});
