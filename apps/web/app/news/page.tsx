// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { formatDay } from "@/components/ProductCatalog";
import { SiteHeader } from "@/components/SiteHeader";
import { Flow } from "@/components/site/Flow";
import { Reveal } from "@/components/site/Reveal";
import { accentField, accentStyle } from "@/lib/brand-colours";
import { getLocale } from "@/lib/locale.server";
import { articles, articleUrl, getNewsMessages, articleText } from "@/lib/news";
import { productFacts } from "@/lib/products";

export async function generateMetadata(): Promise<Metadata> {
  const news = getNewsMessages(await getLocale());
  return {
    title: news.title,
    description: news.description,
    alternates: { canonical: "https://news.progmasoft.com/" },
  };
}

/**
 * news.progmasoft.com: the newest article large, over a field in the colour
 * of its product, then every other article as a card.
 */
export default async function NewsPage() {
  const locale = await getLocale();
  const news = getNewsMessages(locale);
  const [first, ...rest] = articles;
  return (
    <div className="pm-page pm-home pm-news-site">
      <SiteHeader locale={locale} />
      <Reveal />
      <main>
        <section className="pm-shell pm-news-head">
          <h1 className="pm-serif">{news.title}</h1>
          <p>{news.description}</p>
        </section>

        {first ? (
          <section className="pm-shell">
            <a className="pm-news-lead" href={articleUrl(first)}>
              <Flow
                colours={accentField(productFacts(first.product).accent)}
                seed={4.2}
                speed={0.6}
                className="pm-news-lead-field"
              />
              <span className="pm-news-lead-copy">
                <time dateTime={first.date}>
                  {formatDay(locale, first.date)}
                </time>
                <strong className="pm-serif">
                  {articleText(first, locale).title}
                </strong>
                <span>{articleText(first, locale).summary}</span>
              </span>
            </a>
          </section>
        ) : null}

        <section className="pm-shell pm-news-list" aria-label={news.latest}>
          <ul>
            {rest.map((article, index) => (
              <li
                key={article.slug}
                data-reveal
                style={{ "--i": index } as React.CSSProperties}
              >
                <a href={articleUrl(article)}>
                  <span className="pm-news-meta">
                    <span
                      className="pm-chip pm-live-accent"
                      style={accentStyle(productFacts(article.product).accent)}
                      aria-hidden="true"
                    />
                    <span>{productFacts(article.product).name}</span>
                    <time dateTime={article.date}>
                      {formatDay(locale, article.date)}
                    </time>
                  </span>
                  <strong className="pm-serif">
                    {articleText(article, locale).title}
                  </strong>
                  <span className="pm-news-text">
                    {articleText(article, locale).summary}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
