// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { messages, supportedLocales } from "../lib/localization.ts";
import { policyUrls, policyVersion } from "../lib/policies.ts";
import { deDE } from "../lib/policies/de-DE.ts";
import { enUS } from "../lib/policies/en-US.ts";
import { heIL } from "../lib/policies/he-IL.ts";
import { ruRU } from "../lib/policies/ru-RU.ts";

const policies = { "en-US": enUS, "de-DE": deDE, "ru-RU": ruRU, "he-IL": heIL };

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

test("the privacy policy keeps the IP address for ViGet uploads only and sells nothing", () => {
  const privacy = enUS.privacy.sections.map((section) =>
    section.paragraphs.join(" "),
  );
  const address = privacy.find((text) =>
    text.startsWith("We keep your IP address for one purpose only."),
  );
  assert.ok(address);
  assert.match(
    address,
    /ViGet will record the IP address each upload came from/,
  );
  assert.match(address, /ViGet does not yet take uploads from accounts/);
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
