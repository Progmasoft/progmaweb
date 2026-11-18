// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test, type Page } from "@playwright/test";
import { layoutPages } from "./pages";

/** The widest screen that shows the header menu button instead of the links. */
const menuWidth = 980;

async function open(page: Page, target: string) {
  const response = await page.goto(`http://${target}`);
  expect(response?.status(), `status of ${target}`).toBeLessThan(400);
}

/**
 * Elements that reach past either edge of the viewport, outside any box that
 * scrolls or clips them. One such element is enough for a phone to scroll
 * sideways or to cut text off.
 */
function elementsPastTheEdges(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const clipped = (element: Element) => {
      for (
        let p = element.parentElement;
        p && p !== document.body;
        p = p.parentElement
      ) {
        if (getComputedStyle(p).overflowX !== "visible") return true;
      }
      return false;
    };
    const found: string[] = [];
    for (const element of document.body.querySelectorAll("*")) {
      const box = element.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.right <= width + 1 && box.left >= -1) continue;
      if (clipped(element)) continue;
      found.push(
        `${element.tagName.toLowerCase()}.${String(element.className)} ${Math.round(box.left)}..${Math.round(box.right)}`,
      );
    }
    return found;
  });
}

/**
 * Controls smaller than 24 by 24 CSS pixels, the minimum target size of WCAG
 * 2.2 (2.5.8). Links inside running text are exempt, as WCAG exempts them.
 */
function smallControls(page: Page) {
  return page.evaluate(() => {
    const controls = document.querySelectorAll(
      "button, select, input:not([type=hidden]), .button, header a, .primary-nav a",
    );
    const found: string[] = [];
    for (const control of controls) {
      const box = control.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.width < 24 || box.height < 24) {
        found.push(
          `${control.tagName.toLowerCase()} "${control.textContent?.trim().slice(0, 24)}" ${Math.round(box.width)}x${Math.round(box.height)}`,
        );
      }
    }
    return found;
  });
}

// Every page in every published language: German, Russian and French words
// run longer than English ones and must fit as well.
const locales = ["en-US", "de-DE", "ru-RU", "fr-FR"] as const;

for (const locale of locales) {
  test.describe(locale, () => {
    test.beforeEach(async ({ context }) => {
      await context.addCookies([
        {
          name: "progmasoft_locale",
          value: locale,
          domain: ".progmasoft.com",
          path: "/",
        },
      ]);
    });

    for (const target of layoutPages) {
      test(`${target} fits the screen`, async ({ page }) => {
        await open(page, target);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow, "horizontal scroll").toBe(0);
        expect(await elementsPastTheEdges(page)).toEqual([]);
        expect(await smallControls(page)).toEqual([]);
      });

      test(`${target} keeps its header on one line`, async ({ page }) => {
        await open(page, target);
        const header = page.locator("header.site-header").first();
        test.skip((await header.count()) === 0, "the page has no site header");
        const box = await header.boundingBox();
        expect(box?.height ?? 0).toBeLessThanOrEqual(80);
        // The brand and the controls beside it must not cover each other.
        const overlaps = await header.evaluate((element) => {
          // The words of the brand are measured themselves: a squeezed brand box
          // can be narrower than the text that spills out of it.
          const parts = [
            ...element.querySelectorAll(
              ".brand-name, .brand-product, .menu-toggle, .primary-nav > *",
            ),
          ]
            .map((part) => ({ part, box: part.getBoundingClientRect() }))
            .filter(({ box }) => box.width > 0 && box.height > 0);
          const found: string[] = [];
          for (const [i, a] of parts.entries()) {
            for (const b of parts.slice(i + 1)) {
              if (a.part.contains(b.part) || b.part.contains(a.part)) continue;
              const x =
                Math.min(a.box.right, b.box.right) -
                Math.max(a.box.left, b.box.left);
              const y =
                Math.min(a.box.bottom, b.box.bottom) -
                Math.max(a.box.top, b.box.top);
              if (x > 1 && y > 1)
                found.push(`${a.part.className} / ${b.part.className}`);
            }
          }
          return found;
        });
        expect(overlaps).toEqual([]);
      });
    }
  });
}

test("the header menu opens and closes on a phone", async ({ page }) => {
  const width = page.viewportSize()?.width ?? 0;
  test.skip(width > menuWidth, "wide screens show the links in the header");
  await open(page, "progmasoft.com/");
  const toggle = page.locator(".menu-toggle");
  const links = page.locator(".primary-nav a").first();
  await expect(toggle).toBeVisible();
  await expect(links).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(links).toBeVisible();
  expect(await elementsPastTheEdges(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(links).toBeHidden();
});

test("wide screens show the links without a menu button", async ({ page }) => {
  const width = page.viewportSize()?.width ?? 0;
  test.skip(width <= menuWidth, "phones and tablets use the menu");
  await open(page, "progmasoft.com/");
  await expect(page.locator(".menu-toggle")).toBeHidden();
  await expect(page.locator(".primary-nav a").first()).toBeVisible();
});
