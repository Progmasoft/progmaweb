// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getMessages,
  isLocale,
  localeCookieName,
  localeNames,
  localeCookieOptions,
  messages,
  requestHost,
  supportedLocales,
} from "../lib/localization.ts";

test("only the published locales are accepted", () => {
  assert.deepEqual(supportedLocales, ["en-US", "de-DE", "ru-RU"]);
  assert.equal(isLocale("en-US"), true);
  assert.equal(isLocale("de-DE"), true);
  assert.equal(isLocale("ru-RU"), true);
  for (const value of ["en", "de", "ru", "en-us", "tr-TR", "", undefined]) {
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

test("the language cookie is shared by production hosts and host-only elsewhere", () => {
  assert.equal(localeCookieName, "progmasoft_locale");
  for (const host of [
    "progmasoft.com",
    "account.progmasoft.com",
    "viget.progmasoft.com",
  ]) {
    assert.equal(localeCookieOptions(host, true).domain, ".progmasoft.com");
  }
  for (const host of [
    "localhost",
    "viget.localhost",
    "notprogmasoft.com",
    "progmasoft.com.example",
    "",
  ]) {
    assert.equal(localeCookieOptions(host, false).domain, undefined, host);
  }
});

test("the language cookie is unreadable by scripts and secure only over TLS", () => {
  const overTls = localeCookieOptions("progmasoft.com", true);
  assert.equal(overTls.httpOnly, true);
  assert.equal(overTls.sameSite, "lax");
  assert.equal(overTls.secure, true);
  assert.equal(overTls.maxAge, 60 * 60 * 24 * 365);
  assert.equal(localeCookieOptions("localhost", false).secure, false);
});

test("the request host prefers the forwarded host and drops port and case", () => {
  assert.equal(
    requestHost("Account.Progmasoft.com", "127.0.0.1:3010"),
    "account.progmasoft.com",
  );
  assert.equal(requestHost(null, "viget.localhost:3000"), "viget.localhost");
  assert.equal(requestHost(null, null), "");
});

// The shape of a message tree: object keys, array lengths and leaf types,
// without the text itself.
function shapeOf(value) {
  if (Array.isArray(value)) {
    return value.map(shapeOf);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shapeOf(value[key])]),
    );
  }
  return typeof value;
}

function leavesOf(value) {
  if (Array.isArray(value)) {
    return value.flatMap(leavesOf);
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap(leavesOf);
  }
  return [value];
}

test("every locale has exactly the messages of the default locale", () => {
  const reference = shapeOf(messages["en-US"]);
  for (const locale of supportedLocales) {
    assert.deepEqual(shapeOf(messages[locale]), reference, locale);
    for (const text of leavesOf(messages[locale])) {
      assert.equal(typeof text, "string", locale);
      assert.notEqual(text.trim(), "", `${locale} has an empty message`);
    }
  }
});

test("every locale has a name in its own language for the language menu", () => {
  assert.deepEqual(Object.keys(localeNames), [...supportedLocales]);
  assert.equal(localeNames["ru-RU"], "Русский");
  assert.equal(
    new Set(Object.values(localeNames)).size,
    supportedLocales.length,
  );
});

test("the Russian messages are written in Cyrillic", () => {
  const russian = messages["ru-RU"];
  for (const text of [
    russian.navigation.language,
    russian.home.heroTitleStart,
    russian.auth.signIn,
    russian.viget.emptyTitle,
  ]) {
    assert.match(text, /[А-Яа-яЁё]/);
  }
  assert.notEqual(russian.auth.signIn, messages["en-US"].auth.signIn);
});
