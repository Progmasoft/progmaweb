// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
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
  assert.match(api, new RegExp(`CurrentVersion = "${policyVersion}"`));
  assert.match(policyVersion, /^\d{4}-\d{2}-\d{2}$/);
});

test("every language has both policies, part for part", () => {
  assert.deepEqual(Object.keys(policies).sort(), [...supportedLocales].sort());
  for (const locale of supportedLocales) {
    for (const kind of ["privacy", "security"]) {
      const text = policies[locale][kind];
      const english = enUS[kind];
      assert.equal(text.sections.length, english.sections.length, locale);
      text.sections.forEach((section, index) => {
        assert.ok(section.heading.length > 0, `${locale} ${kind} ${index}`);
        assert.equal(
          section.paragraphs.length,
          english.sections[index].paragraphs.length,
          `${locale} ${kind} ${section.heading}`,
        );
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
  assert.ok(address);
  assert.match(
    address,
    /the marketplace will record the IP address each upload came from/,
  );
  assert.match(
    address,
    /The Agenceland MCP Marketplace does not yet take uploads from accounts/,
  );
  assert.match(address, /competent authorities/);
  assert.ok(
    privacy.some((text) =>
      text.startsWith("We do not sell, rent or trade your data"),
    ),
  );
});

test("registration names the policies in every language", () => {
  for (const locale of supportedLocales) {
    const { auth } = messages[locale];
    assert.ok(auth.consentPrivacy.length > 0, locale);
    assert.ok(auth.consentSecurity.length > 0, locale);
    assert.ok(auth.consentRequired.length > 0, locale);
    assert.ok(auth.googlePoliciesRequired.length > 0, locale);
  }
  assert.deepEqual(policyUrls, {
    privacy: "https://progmasoft.com/privacy",
    security: "https://progmasoft.com/security",
  });
});

test("the newest version names the Agenceland MCP Marketplace and no closed service", () => {
  for (const locale of supportedLocales) {
    const text = JSON.stringify(policies[locale]);
    assert.doesNotMatch(text, /ViGet|Tazel/, locale);
    assert.match(text, /Agenceland MCP Marketplace/, locale);
  }
  // The version of 2026-11-06 stays as it was published.
  assert.match(JSON.stringify(enUS20261106), /ViGet does not yet take uploads/);
  assert.equal(enUS20261106.versionDate, "6 November 2026");
  assert.equal(enUS.versionDate, "6 December 2026");
});

test("the version in effect is the newest whose date has come", () => {
  assert.deepEqual([...policyVersions], ["2026-11-06", "2026-12-06"]);
  assert.equal(policyVersion, policyVersions.at(-1));
  assert.equal(policyInEffect(new Date("2026-11-21T12:00:00Z")), "2026-11-06");
  assert.equal(policyInEffect(new Date("2026-12-05T23:59:59Z")), "2026-11-06");
  assert.equal(policyInEffect(new Date("2026-12-06T00:00:00Z")), "2026-12-06");
  assert.equal(policyInEffect(new Date("2030-01-01T00:00:00Z")), "2026-12-06");
  assert.equal(policyAfter("2026-11-06"), "2026-12-06");
  assert.equal(policyAfter("2026-12-06"), undefined);
  assert.ok(isPolicyVersion("2026-11-06"));
  assert.ok(!isPolicyVersion("2026-11-07"));
  assert.ok(!isPolicyVersion("latest"));
  for (const locale of supportedLocales) {
    for (const word of Object.values(policyVersionWords[locale])) {
      assert.ok(word.length > 0, locale);
    }
  }
});
