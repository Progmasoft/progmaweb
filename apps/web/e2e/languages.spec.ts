// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "@playwright/test";

test("a visitor who chose French reads the site in French", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "progmasoft_locale",
      value: "fr-FR",
      domain: ".progmasoft.com",
      path: "/",
    },
  ]);
  await page.goto("http://progmasoft.com/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr-FR");
  await page.goto("http://product.progmasoft.com/nope");
  await expect(page.locator("h1")).toHaveText(
    "Nous sommes désolés, la page demandée est introuvable.",
  );
});
