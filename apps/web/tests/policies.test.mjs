// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { messages, supportedLocales } from "../lib/localization.ts";
import {
  isPolicyVersion,
  policyAfter,
  policyInEffect,
  policyUrls,
  policyVersion,
  policyVersions,
  policyVersionWords,
} from "../lib/policies.ts";
import { enUS as enUS20261106 } from "../lib/policies/v2026-11-06/en-US.ts";
import { deDE } from "../lib/policies/de-DE.ts";
import { enUS } from "../lib/policies/en-US.ts";
import { frFR } from "../lib/policies/fr-FR.ts";
import { ruRU } from "../lib/policies/ru-RU.ts";

const policies = { "en-US": enUS, "de-DE": deDE, "ru-RU": ruRU, "fr-FR": frFR };

test("the page and the account API name the same version", () => {
  const api = readFileSync(
    new URL("../../api/Accounts/PolicyAcceptance.cs", import.meta.url),
    "utf8",
  );
  expect(api).toMatch(new RegExp(`CurrentVersion = "${policyVersion}"`));
  expect(policyVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test("every language has both policies, part for part", () => {
  expect(Object.keys(policies).sort()).toStrictEqual(
    [...supportedLocales].sort(),
  );
  for (const locale of supportedLocales) {
    for (const kind of ["privacy", "security"]) {
      const text = policies[locale][kind];
      const english = enUS[kind];
      expect(text.sections.length, locale).toBe(english.sections.length);
      text.sections.forEach((section, index) => {
        expect(
          section.heading.length > 0,
          `${locale} ${kind} ${index}`,
        ).toBeTruthy();
        expect(
          section.paragraphs.length,
          `${locale} ${kind} ${section.heading}`,
        ).toBe(english.sections[index].paragraphs.length);
      });
    }
  }
});

test("the privacy policy keeps the IP address for marketplace uploads only and sells nothing", () => {
  const privacy = enUS.privacy.sections.map((section) =>
    section.paragraphs.join(" "),
  );
  const address = privacy.find((text) =>
    text.startsWith("We keep your IP address for one purpose only."),
  );
  expect(address).toBeTruthy();
  expect(address).toMatch(
    /the marketplace will record the IP address each upload came from/,
  );
  expect(address).toMatch(
    /The Agenceland MCP Marketplace does not yet take uploads from accounts/,
  );
  expect(address).toMatch(/competent authorities/);
  expect(
    privacy.some((text) =>
      text.startsWith("We do not sell, rent or trade your data"),
    ),
  ).toBeTruthy();
});

test("registration names the policies in every language", () => {
  for (const locale of supportedLocales) {
    const { auth } = messages[locale];
    expect(auth.consentPrivacy.length > 0, locale).toBeTruthy();
    expect(auth.consentSecurity.length > 0, locale).toBeTruthy();
    expect(auth.consentRequired.length > 0, locale).toBeTruthy();
    expect(auth.googlePoliciesRequired.length > 0, locale).toBeTruthy();
  }
  expect(policyUrls).toStrictEqual({
    privacy: "https://progmasoft.com/privacy",
    security: "https://progmasoft.com/security",
  });
});

test("the newest version names the Agenceland MCP Marketplace and no closed service", () => {
  for (const locale of supportedLocales) {
    const text = JSON.stringify(policies[locale]);
    expect(text, locale).not.toMatch(/ViGet|Tazel/);
    expect(text, locale).toMatch(/Agenceland MCP Marketplace/);
  }
  // The version of 2026-11-06 stays as it was published.
  expect(JSON.stringify(enUS20261106)).toMatch(
    /ViGet does not yet take uploads/,
  );
  expect(enUS20261106.versionDate).toBe("6 November 2026");
  expect(enUS.versionDate).toBe("6 December 2026");
});

test("the version in effect is the newest whose date has come", () => {
  expect([...policyVersions]).toStrictEqual(["2026-11-06", "2026-12-06"]);
  expect(policyVersion).toBe(policyVersions.at(-1));
  expect(policyInEffect(new Date("2026-11-21T12:00:00Z"))).toBe("2026-11-06");
  expect(policyInEffect(new Date("2026-12-05T23:59:59Z"))).toBe("2026-11-06");
  expect(policyInEffect(new Date("2026-12-06T00:00:00Z"))).toBe("2026-12-06");
  expect(policyInEffect(new Date("2030-01-01T00:00:00Z"))).toBe("2026-12-06");
  expect(policyAfter("2026-11-06")).toBe("2026-12-06");
  expect(policyAfter("2026-12-06")).toBe(undefined);
  expect(isPolicyVersion("2026-11-06")).toBeTruthy();
  expect(!isPolicyVersion("2026-11-07")).toBeTruthy();
  expect(!isPolicyVersion("latest")).toBeTruthy();
  for (const locale of supportedLocales) {
    for (const word of Object.values(policyVersionWords[locale])) {
      expect(word.length > 0, locale).toBeTruthy();
    }
  }
});
