// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "vitest";
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
  expect(supportedLocales).toStrictEqual(["en-US", "de-DE", "ru-RU", "fr-FR"]);
  expect(isLocale("en-US")).toBe(true);
  expect(isLocale("de-DE")).toBe(true);
  expect(isLocale("ru-RU")).toBe(true);
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
    expect(isLocale(value), `unexpected locale: ${value}`).toBe(false);
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
    expect(typeof english[key]).toBe("string");
    expect(typeof german[key]).toBe("string");
    expect(english[key].trim()).not.toBe("");
    expect(german[key].trim()).not.toBe("");
  }
  expect(english.loginTitle).not.toBe(german.loginTitle);
  expect(english.registerTitle).not.toBe(german.registerTitle);
});

test("each supported locale resolves to its own complete message tree", () => {
  for (const locale of supportedLocales) {
    expect(getMessages(locale)).toBe(messages[locale]);
  }

  function shape(value) {
    if (Array.isArray(value)) return value.map(shape);
    if (value !== null && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, shape(child)]),
      );
    }
    expect(typeof value).toBe("string");
    expect(value.trim()).not.toBe("");
    return "text";
  }

  expect(shape(messages["de-DE"])).toStrictEqual(shape(messages["en-US"]));
});

test("the language cookie is shared by production hosts and host-only elsewhere", () => {
  expect(localeCookieName).toBe("progmasoft_locale");
  for (const host of [
    "progmasoft.com",
    "account.progmasoft.com",
    "product.progmasoft.com",
  ]) {
    expect(localeCookieOptions(host, true).domain).toBe(".progmasoft.com");
  }
  for (const host of [
    "localhost",
    "account.localhost",
    "notprogmasoft.com",
    "progmasoft.com.example",
    "",
  ]) {
    expect(localeCookieOptions(host, false).domain, host).toBe(undefined);
  }
});

test("the language cookie is unreadable by scripts and secure only over TLS", () => {
  const overTls = localeCookieOptions("progmasoft.com", true);
  expect(overTls.httpOnly).toBe(true);
  expect(overTls.sameSite).toBe("lax");
  expect(overTls.secure).toBe(true);
  expect(overTls.maxAge).toBe(60 * 60 * 24 * 365);
  expect(localeCookieOptions("localhost", false).secure).toBe(false);
});

test("the request host prefers the forwarded host and drops port and case", () => {
  expect(requestHost("Account.Progmasoft.com", "127.0.0.1:3010")).toBe(
    "account.progmasoft.com",
  );
  expect(requestHost(null, "account.localhost:3000")).toBe("account.localhost");
  expect(requestHost(null, null)).toBe("");
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
    expect(shapeOf(messages[locale]), locale).toStrictEqual(reference);
    for (const text of leavesOf(messages[locale])) {
      expect(typeof text, locale).toBe("string");
      expect(text.trim(), `${locale} has an empty message`).not.toBe("");
    }
  }
});

test("every locale has a name in its own language for the language menu", () => {
  expect(Object.keys(localeNames)).toStrictEqual([...supportedLocales]);
  expect(localeNames["ru-RU"]).toBe("Русский");
  expect(new Set(Object.values(localeNames)).size).toBe(
    supportedLocales.length,
  );
});

test("the Russian messages are written in Cyrillic", () => {
  const russian = messages["ru-RU"];
  for (const text of [
    russian.navigation.language,
    homeMessages["ru-RU"].statement.lead,
    russian.auth.signIn,
    russian.dashboard.welcome,
  ]) {
    expect(text).toMatch(/[А-Яа-яЁё]/);
  }
  expect(russian.auth.signIn).not.toBe(messages["en-US"].auth.signIn);
});

test("French is published, and Hebrew is retired", async () => {
  const { retiredLocales } = await import("../lib/localization.ts");
  expect(isLocale("fr-FR")).toBe(true);
  expect(localeNames["fr-FR"]).toBe("Français");
  const french = messages["fr-FR"];
  for (const text of [
    french.auth.signIn,
    french.metadata.homeDescription,
    french.dashboard.welcome,
  ]) {
    expect(text).toMatch(/[a-zàâçéèêëîïôûùüÿœ]/);
    expect(!/[֐-׿]/.test(text), text).toBeTruthy();
  }
  expect(french.auth.signIn).not.toBe(messages["en-US"].auth.signIn);
  expect(retiredLocales).toStrictEqual(["he-IL"]);
  expect(isLocale("he-IL")).toBe(false);
});

test("a ?lang= link stores a published language, and the fallback for a retired one", async () => {
  const { languageRequest } = await import("../lib/localization.ts");
  expect(languageRequest("fr-FR")).toStrictEqual({
    locale: "fr-FR",
    status: 307,
  });
  expect(languageRequest("de-DE")).toStrictEqual({
    locale: "de-DE",
    status: 307,
  });
  expect(languageRequest("he-IL")).toStrictEqual({
    locale: "en-US",
    status: 308,
  });
  for (const value of [undefined, "", "he", "fr", "tr-TR", "constructor"]) {
    expect(languageRequest(value), `${value}`).toBe(undefined);
  }
});

test("the browser preference selects the language when nothing was chosen", async () => {
  const { fallbackLocale, negotiateLocale } =
    await import("../lib/localization.ts");
  expect(fallbackLocale).toBe("en-US");
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
    expect(negotiateLocale(header), String(header)).toBe(expected);
  }
  // Only the beginning of an oversized header is read.
  expect(negotiateLocale(`${"x,".repeat(2000)}de`)).toBe("en-US");
});
