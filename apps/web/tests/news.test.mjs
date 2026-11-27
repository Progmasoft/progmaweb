// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { expect, test } from "vitest";
import { supportedLocales } from "../lib/localization.ts";
import {
  articles,
  articleUrl,
  findArticle,
  newsMessages,
  newsRoute,
  releaseNotes,
  slugOf,
} from "../lib/news.ts";
import { products } from "../lib/products.ts";

test("an article's address is its English title in kebab case", () => {
  expect(slugOf("Tazel 0.2.0 shares results through a remote cache")).toBe(
    "tazel-0-2-0-shares-results-through-a-remote-cache",
  );
  expect(slugOf("  C++ & Zig: ready!  ")).toBe("c-zig-ready");
  for (const article of articles) {
    expect(article.slug).toBe(slugOf(article.text["en-US"].title));
    expect(articleUrl(article)).toBe(
      `https://news.progmasoft.com/${article.slug}`,
    );
  }
});

test("every address names one article", () => {
  const slugs = articles.map((article) => article.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});

test("articles are newest first", () => {
  const dates = articles.map((article) => article.date);
  expect(dates).toStrictEqual([...dates].sort().reverse());
});

test("every article is written in every language", () => {
  for (const article of articles) {
    for (const locale of supportedLocales) {
      const text = article.text[locale];
      expect(
        text?.title && text.summary,
        `${article.slug} ${locale}`,
      ).toBeTruthy();
      expect(text.body.length, `${article.slug} ${locale}`).toBe(
        article.text["en-US"].body.length,
      );
    }
  }
  for (const locale of supportedLocales) {
    expect(newsMessages[locale].title, locale).toBeTruthy();
  }
});

test("an article that announces a release points to its notes", () => {
  for (const article of articles.filter((entry) => entry.release)) {
    expect(releaseNotes(article)).toBe(
      products[article.product].latestRelease?.url,
    );
  }
});

test("news.progmasoft.com serves the list and each article", () => {
  expect(newsRoute("/")).toBe("/news");
  const [first] = articles;
  expect(newsRoute(`/${first.slug}`)).toBe(`/news/${first.slug}`);
  expect(newsRoute(`/${first.slug}/`)).toBe(`/news/${first.slug}`);
  expect(newsRoute("/no-such-article")).toBe(null);
  expect(newsRoute("/a/b")).toBe(null);
  expect(newsRoute("/Tazel")).toBe(null);
  expect(findArticle(first.slug)).toBe(first);
});
