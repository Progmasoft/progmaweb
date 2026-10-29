// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  buildSystemCatalogs,
  buildSystemsHeading,
  catalogText,
  languageCatalogs,
  languagesHeading,
} from "../lib/viget-catalogs.ts";

const locales = ["en-US", "de-DE", "ru-RU", "he-IL"];

test("the registry lists Tala and C++, then Tazel and Gradle, under their own headings", () => {
  assert.equal(languagesHeading, "LANGUAGES");
  assert.equal(buildSystemsHeading, "BUILD SYSTEM DSL PLUGINS");
  assert.deepEqual(languageCatalogs, [
    { name: "Tala", path: "/langs/tala" },
    { name: "C++" },
  ]);
  assert.deepEqual(buildSystemCatalogs, [
    { name: "Tazel", path: "/dslplugins/tazel" },
    { name: "Gradle", path: "/dslplugins/gradle" },
  ]);
});

test("every open catalog says what it holds in every language", () => {
  for (const locale of locales) {
    const text = catalogText(locale);
    for (const catalog of [...languageCatalogs, ...buildSystemCatalogs]) {
      if (catalog.path)
        assert.ok(
          text.holds[catalog.name]?.length > 0,
          `${locale} ${catalog.name}`,
        );
    }
    for (const [key, value] of Object.entries(text)) {
      if (typeof value === "string")
        assert.ok(value.trim().length > 0, `${locale} ${key}`);
    }
  }
  assert.notEqual(
    catalogText("de-DE").talaTitle,
    catalogText("en-US").talaTitle,
  );
});

test("a catalog that is not offered yet is a disabled button and links nowhere", () => {
  const section = readFileSync(
    new URL("../components/ViGetCatalogSection.tsx", import.meta.url),
    "utf8",
  );
  assert.match(section, /type="button"\s+disabled/);
  assert.match(
    section,
    /href=\{`https:\/\/viget\.progmasoft\.com\$\{catalog\.path\}`\}/,
  );
  const styles = readFileSync(
    new URL("../app/viget.css", import.meta.url),
    "utf8",
  );
  assert.match(styles, /\.viget-catalog-disabled \{[^}]*cursor: not-allowed;/s);
});

test("the ViGet host serves both catalogs and leads the bare groups to them", () => {
  const proxy = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
  assert.match(proxy, /internalRoute\(request, "\/viget\/langs\/tala"\)/);
  assert.match(proxy, /internalRoute\(request, "\/viget\/dslplugins\/tazel"\)/);
  assert.match(
    proxy,
    /"https:\/\/viget\.progmasoft\.com\/langs\/tala"\),\s*308/,
  );
  assert.match(
    proxy,
    /"https:\/\/viget\.progmasoft\.com\/dslplugins\/tazel"\),\s*308/,
  );
  const home = readFileSync(
    new URL("../app/viget/page.tsx", import.meta.url),
    "utf8",
  );
  const status = home.indexOf("viget-status-title");
  assert.ok(
    status >= 0 && status < home.indexOf("<ViGetCatalogSection"),
    "the status comes first",
  );
  assert.ok(
    home.indexOf("languagesHeading}") < home.indexOf("buildSystemsHeading}"),
  );
});
