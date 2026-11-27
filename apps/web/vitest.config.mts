// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * The unit tests of the site: tests/*.test.mjs, run in Node. The layout
 * tests in e2e/ belong to Playwright and are not collected here.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.mjs"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["lib/**"],
      reporter: ["lcov", "text"],
      reportsDirectory: "coverage",
    },
  },
});
