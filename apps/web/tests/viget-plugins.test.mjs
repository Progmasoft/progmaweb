// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  gradlePlugins,
  pluginDeclaration,
  pluginText,
  tazelPlugin,
} from "../lib/viget-plugins.ts";

const locales = ["en-US", "de-DE", "ru-RU", "he-IL"];

test("the plugin pages have every text in every language", () => {
  for (const locale of locales) {
    for (const [key, value] of Object.entries(pluginText(locale))) {
      assert.ok(value.trim().length > 0, `${locale} ${key}`);
    }
    for (const plugin of gradlePlugins) {
      assert.ok(
        plugin.description[locale].length > 0,
        `${locale} ${plugin.id}`,
      );
    }
  }
});

test("the declaration is the plugins block Tazel reads", () => {
  assert.equal(
    pluginDeclaration({ publisher: "Progmasoft", name: "CMake" }, "0.1.0"),
    [
      "plugins {",
      '  plugin("Progmasoft") {',
      '    name = "CMake"',
      '    version = "0.1.0"',
      "  }",
      "}",
    ].join("\n"),
  );
});

test("the Gradle catalog lists the Tazel plugin builder", () => {
  assert.deepEqual(
    gradlePlugins.map((plugin) => plugin.id),
    ["com.progmasoft.tazel.plugin"],
  );
});

test("a plugin page asks the API only for names that are identifiers", async () => {
  assert.equal(await tazelPlugin("../etc", "passwd"), null);
  assert.equal(await tazelPlugin("Progmasoft", "c-make"), null);
});
