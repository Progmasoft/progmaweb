// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import assert from "node:assert/strict";
import { test } from "node:test";
import { supportedLocales } from "../lib/localization.ts";
import {
  articles,
  articleUrl,
  findArticle,
  getNewsMessages,
  newsRoute,
  releaseNotes,
  slugOf,
} from "../lib/news.ts";
import { products } from "../lib/products.ts";

test("an article's address is its English title in kebab case", () => {
  assert.equal(
    slugOf("Tazel 0.2.0 shares results through a remote cache"),
    "tazel-0-2-0-shares-results-through-a-remote-cache",
  );
  assert.equal(slugOf("  C++ & Zig: ready!  "), "c-zig-ready");
  for (const article of articles) {
    assert.equal(article.slug, slugOf(article.text["en-US"].title));
    assert.equal(
      articleUrl(article),
      `https://news.progmasoft.com/${article.slug}`,
    );
  }
});

test("every address names one article", () => {
  const slugs = articles.map((article) => article.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("articles are newest first", () => {
  const dates = articles.map((article) => article.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

test("every article is written in every language", () => {
  for (const article of articles) {
    for (const locale of supportedLocales) {
      const text = article.text[locale];
      assert.ok(text?.title && text.summary, `${article.slug} ${locale}`);
      assert.equal(
        text.body.length,
        article.text["en-US"].body.length,
        `${article.slug} ${locale}`,
      );
    }
  }
  for (const locale of supportedLocales) {
    assert.ok(getNewsMessages(locale).title, locale);
  }
});

test("an article that announces a release points to its notes", () => {
  for (const article of articles.filter((entry) => entry.release)) {
    assert.equal(
      releaseNotes(article),
      products[article.product].latestRelease?.url,
    );
  }
});

test("news.progmasoft.com serves the list and each article", () => {
  assert.equal(newsRoute("/"), "/news");
  const [first] = articles;
  assert.equal(newsRoute(`/${first.slug}`), `/news/${first.slug}`);
  assert.equal(newsRoute(`/${first.slug}/`), `/news/${first.slug}`);
  assert.equal(newsRoute("/no-such-article"), null);
  assert.equal(newsRoute("/a/b"), null);
  assert.equal(newsRoute("/Tazel"), null);
  assert.equal(findArticle(first.slug), first);
});
