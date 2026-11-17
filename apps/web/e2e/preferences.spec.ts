// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test, type Page } from "@playwright/test";

/**
 * The theme and the language a visitor chooses on one host of Progmasoft
 * hold on the others: both are cookies of the registrable domain.
 */

async function open(page: Page, target: string) {
  const response = await page.goto(`http://${target}`);
  expect(response?.status(), `status of ${target}`).toBeLessThan(400);
}

const theme = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.theme);

test.beforeEach(({ page }) => {
  // The header shows its controls without a menu on a wide screen.
  test.skip(
    (page.viewportSize()?.width ?? 0) <= 980,
    "the controls are in the menu below 980px; one width is enough here",
  );
});

test("a theme chosen on progmasoft.com holds on the other hosts", async ({
  page,
}) => {
  await open(page, "progmasoft.com/");
  expect(await theme(page)).toBe("light");
  await page.locator(".preference-controls button").click();
  expect(await theme(page)).toBe("dark");
  for (const host of [
    "viget.progmasoft.com/",
    "account.progmasoft.com/",
    "product.progmasoft.com/",
  ]) {
    await open(page, host);
    expect(await theme(page), host).toBe("dark");
  }
  await page.locator(".preference-controls button").click();
  await open(page, "progmasoft.com/");
  expect(await theme(page)).toBe("light");
});

test("a language chosen on progmasoft.com holds on the other hosts", async ({
  page,
}) => {
  await open(page, "progmasoft.com/");
  await page.locator(".preference-controls select").selectOption("de-DE");
  await expect(page.locator("html")).toHaveAttribute("lang", "de-DE");
  for (const host of ["viget.progmasoft.com/", "product.progmasoft.com/"]) {
    await open(page, host);
    await expect(page.locator("html"), host).toHaveAttribute("lang", "de-DE");
  }
});

test("a theme of an earlier version in localStorage moves into the shared cookie", async ({
  page,
}) => {
  await open(page, "account.progmasoft.com/");
  await page.evaluate(() => localStorage.setItem("progmasoft_theme", "dark"));
  await open(page, "account.progmasoft.com/");
  expect(await theme(page)).toBe("dark");
  await open(page, "viget.progmasoft.com/");
  expect(await theme(page)).toBe("dark");
});

test("a cookie of one host does not shadow the shared language", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "progmasoft_locale",
      value: "ru-RU",
      url: "http://viget.progmasoft.com/",
    },
    {
      name: "progmasoft_locale",
      value: "de-DE",
      domain: ".progmasoft.com",
      path: "/",
    },
  ]);
  await open(page, "viget.progmasoft.com/");
  await open(page, "viget.progmasoft.com/");
  await expect(page.locator("html")).toHaveAttribute("lang", "de-DE");
  const left = (await context.cookies("http://viget.progmasoft.com/")).filter(
    (cookie) => cookie.name === "progmasoft_locale",
  );
  expect(left.map((cookie) => cookie.domain)).toEqual([".progmasoft.com"]);
});
