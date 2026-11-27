// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

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
import { homeMessages } from "../lib/home-messages.ts";

test("only the published locales are accepted", () => {
  assert.deepEqual(supportedLocales, ["en-US", "de-DE", "ru-RU", "fr-FR"]);
  assert.equal(isLocale("en-US"), true);
  assert.equal(isLocale("de-DE"), true);
  assert.equal(isLocale("ru-RU"), true);
  for (const value of [
    "en",
    "de",
    "ru",
    "fr",
    "he",
    "he-IL",
    "en-us",
    "tr-TR",
    "",
    undefined,
  ]) {
    assert.equal(isLocale(value), false, `unexpected locale: ${value}`);
  }
});

test("both locales give the account routes distinct page metadata", () => {
  const english = messages["en-US"].metadata;
  const german = messages["de-DE"].metadata;
  for (const key of [
    "homeTitle",
    "accountTitle",
    "loginTitle",
    "registerTitle",
  ]) {
    assert.equal(typeof english[key], "string");
    assert.equal(typeof german[key], "string");
    assert.notEqual(english[key].trim(), "");
    assert.notEqual(german[key].trim(), "");
  }
  assert.notEqual(english.loginTitle, german.loginTitle);
  assert.notEqual(english.registerTitle, german.registerTitle);
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
    "product.progmasoft.com",
  ]) {
    assert.equal(localeCookieOptions(host, true).domain, ".progmasoft.com");
  }
  for (const host of [
    "localhost",
    "account.localhost",
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
  assert.equal(requestHost(null, "account.localhost:3000"), "account.localhost");
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
    homeMessages["ru-RU"].hero.title,
    russian.auth.signIn,
    russian.dashboard.welcome,
  ]) {
    assert.match(text, /[А-Яа-яЁё]/);
  }
  assert.notEqual(russian.auth.signIn, messages["en-US"].auth.signIn);
});

test("French is published, and Hebrew is retired", async () => {
  const { retiredLocales } = await import("../lib/localization.ts");
  assert.equal(isLocale("fr-FR"), true);
  assert.equal(localeNames["fr-FR"], "Français");
  const french = messages["fr-FR"];
  for (const text of [
    french.auth.signIn,
    french.metadata.homeDescription,
    french.dashboard.welcome,
  ]) {
    assert.match(text, /[a-zàâçéèêëîïôûùüÿœ]/);
    assert.ok(!/[֐-׿]/.test(text), text);
  }
  assert.notEqual(french.auth.signIn, messages["en-US"].auth.signIn);
  assert.deepEqual(retiredLocales, ["he-IL"]);
  assert.equal(isLocale("he-IL"), false);
});

test("a ?lang= link stores a published language, and the fallback for a retired one", async () => {
  const { languageRequest } = await import("../lib/localization.ts");
  assert.deepEqual(languageRequest("fr-FR"), { locale: "fr-FR", status: 307 });
  assert.deepEqual(languageRequest("de-DE"), { locale: "de-DE", status: 307 });
  assert.deepEqual(languageRequest("he-IL"), { locale: "en-US", status: 308 });
  for (const value of [undefined, "", "he", "fr", "tr-TR", "constructor"]) {
    assert.equal(languageRequest(value), undefined, `${value}`);
  }
});

test("the browser preference selects the language when nothing was chosen", async () => {
  const { fallbackLocale, negotiateLocale } =
    await import("../lib/localization.ts");
  assert.equal(fallbackLocale, "en-US");
  const cases = [
    [null, "en-US"],
    ["", "en-US"],
    ["de", "de-DE"],
    ["de-AT,de;q=0.9,en;q=0.8", "de-DE"],
    ["ru-RU,ru;q=0.9", "ru-RU"],
    ["fr-CA,fr;q=0.9,en-US;q=0.8", "fr-FR"],
    ["FR", "fr-FR"],
    // Hebrew is no longer published.
    ["he-IL,he;q=0.9,en-US;q=0.8", "en-US"],
    ["iw", "en-US"],
    // Quality decides, not position.
    ["en;q=0.3,ru;q=0.9", "ru-RU"],
    // The first of equally preferred languages wins.
    ["de,ru", "de-DE"],
    // An unpublished first choice falls through to a published one.
    ["tr-TR,tr;q=0.9,de;q=0.5", "de-DE"],
    ["tr-TR,fr;q=0.9", "fr-FR"],
    ["*", "en-US"],
    // A refused or malformed quality never selects a language.
    ["de;q=0", "en-US"],
    ["de;q=abc,ru;q=0.1", "ru-RU"],
    ["de;q=5", "en-US"],
    ["constructor,__proto__", "en-US"],
  ];
  for (const [header, expected] of cases) {
    assert.equal(negotiateLocale(header), expected, String(header));
  }
  // Only the beginning of an oversized header is read.
  assert.equal(negotiateLocale(`${"x,".repeat(2000)}de`), "en-US");
});
