// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "vitest";
import {
  licenseMessages,
  licensePages,
  pmSplIdentifiers,
  pmSplTexts,
} from "../lib/license-messages.ts";
import { supportedLocales } from "../lib/localization.ts";
import { licenseRoute } from "../lib/sites.ts";

test("license.progmasoft.com serves the list and the three pages of PM-SPL 1.0", () => {
  expect(licenseRoute("/")).toBe("/license");
  for (const page of licensePages) {
    expect(licenseRoute(`/pm-spl/1.0/${page}/`)).toBe(
      `/license/pm-spl/1.0/${page}`,
    );
    expect(licenseRoute(`/pm-spl/1.0/${page}`)).toBe(
      `/license/pm-spl/1.0/${page}`,
    );
  }
  for (const path of [
    "/pm-spl",
    "/pm-spl/1.0",
    "/pm-spl/2.0/faq/",
    "/faq",
    "/pm-spl/1.0/faq/x",
  ]) {
    expect(licenseRoute(path), path).toBe(null);
  }
});

/** The shape of a value: its keys and the lengths of its arrays, without the text. */
function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, shape(item)]),
    );
  }
  return typeof value;
}

test("every language has the same pages, questions and categories as English", () => {
  const english = shape(licenseMessages["en-US"]);
  for (const locale of supportedLocales) {
    expect(shape(licenseMessages[locale]), locale).toStrictEqual(english);
    const strings = [];
    const collect = (value) => {
      if (typeof value === "string") strings.push(value);
      else if (value && typeof value === "object")
        Object.values(value).forEach(collect);
    };
    collect(licenseMessages[locale]);
    for (const text of strings) expect(text.trim(), locale).not.toBe("");
  }
});

test("the identifiers and the texts are those PM-SPL 1.0 was published with", () => {
  expect(pmSplIdentifiers).toStrictEqual([
    "LicenseRef-PM-SPL-1.0-only",
    "LicenseRef-PM-SPL-1.0-or-later",
  ]);
  expect(pmSplTexts.map(([, url]) => url)).toStrictEqual(
    ["txt", "md", "rst"].map(
      (extension) =>
        `https://storage.progmasoft.com/pm-spl/1.0/LICENSE-1.0.${extension}`,
    ),
  );
  for (const locale of supportedLocales) {
    const letters = licenseMessages[locale].categories.items.map(
      (item) => item.letter,
    );
    expect(letters, locale).toStrictEqual(["A", "B", "X"]);
  }
});
