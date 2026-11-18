// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineConfig } from "@playwright/test";
import { layoutHosts } from "./e2e/pages";

/**
 * Layout tests of the built site in Chromium, at the widths of phones, a
 * tablet and a desktop.
 *
 * The site picks its pages by host name, so every public host name resolves
 * to the local server: the browser asks for http://product.progmasoft.com/ and
 * the request reaches `next start` on 127.0.0.1 with that Host header. No
 * request leaves the machine.
 */
const port = 3100;
const hostRules = layoutHosts
  .map((host) => `MAP ${host} 127.0.0.1:${port}`)
  .join(", ");

const phone = { isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : "list",
  use: {
    browserName: "chromium",
    launchOptions: { args: [`--host-resolver-rules=${hostRules}`] },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "phone-360",
      use: { ...phone, viewport: { width: 360, height: 780 } },
    },
    {
      name: "phone-390",
      use: { ...phone, viewport: { width: 390, height: 844 } },
    },
    {
      name: "tablet-768",
      use: { ...phone, viewport: { width: 768, height: 1024 } },
    },
    { name: "desktop-1280", use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `pnpm exec next start --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}/robots.txt`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
