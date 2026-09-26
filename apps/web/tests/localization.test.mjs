// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getMessages,
  isLocale,
  messages,
  supportedLocales,
} from "../lib/localization.ts";

test("only the two published locales are accepted", () => {
  assert.deepEqual(supportedLocales, ["en-US", "de-DE"]);
  assert.equal(isLocale("en-US"), true);
  assert.equal(isLocale("de-DE"), true);
  for (const value of ["en", "de", "en-us", "tr-TR", "", undefined]) {
    assert.equal(isLocale(value), false, `unexpected locale: ${value}`);
  }
});

test("both locales give the account and ViGet routes distinct page metadata", () => {
  const english = messages["en-US"].metadata;
  const german = messages["de-DE"].metadata;
  for (const key of [
    "homeTitle",
    "accountTitle",
    "loginTitle",
    "registerTitle",
    "vigetTitle",
    "dslPluginsTitle",
  ]) {
    assert.equal(typeof english[key], "string");
    assert.equal(typeof german[key], "string");
    assert.notEqual(english[key].trim(), "");
    assert.notEqual(german[key].trim(), "");
  }
  assert.notEqual(english.loginTitle, german.loginTitle);
  assert.notEqual(english.registerTitle, german.registerTitle);
  assert.match(english.vigetTitle, /ViGet/);
  assert.match(german.vigetTitle, /ViGet/);
});

test("each supported locale resolves to its own complete message tree", () => {
  for (const locale of supportedLocales) {
    assert.strictEqual(getMessages(locale), messages[locale]);
  }

  function shape(value) {
    if (Array.isArray(value)) return value.map(shape);
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, shape(child)]),
      );
    }
    assert.equal(typeof value, "string");
    assert.notEqual(value.trim(), "");
    return "text";
  }

  assert.deepEqual(shape(messages["de-DE"]), shape(messages["en-US"]));
});
