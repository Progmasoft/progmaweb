// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "@playwright/test";

const hosts = [
  "progmasoft.com",
  "account.progmasoft.com",
  "viget.progmasoft.com",
  "product.progmasoft.com",
];

for (const host of hosts) {
  test(`${host} answers an unknown address with its own page and 404`, async ({
    page,
  }) => {
    const response = await page.goto(`http://${host}/example.txt`);
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText(
      "We are sorry, the page you requested cannot be found.",
    );
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.site-footer")).toBeVisible();
    expect(await page.locator("title").count()).toBe(1);
    await expect(page).toHaveTitle("Page not found · Progmasoft");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}

test("the page of an unknown address speaks the visitor's language", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "progmasoft_locale",
      value: "de-DE",
      domain: ".progmasoft.com",
      path: "/",
    },
  ]);
  await page.goto("http://viget.progmasoft.com/nope");
  await expect(page.locator("h1")).toHaveText(
    "Es tut uns leid, die angeforderte Seite wurde nicht gefunden.",
  );
});
