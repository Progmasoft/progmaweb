// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { formatDay } from "@/components/ProductCatalog";
import { SiteHeader } from "@/components/SiteHeader";
import { Flow } from "@/components/site/Flow";
import { accentColours, accentFields } from "@/lib/brand-colours";
import { getLocale } from "@/lib/locale.server";
import {
  articleUrl,
  findArticle,
  newsMessages,
  releaseNotes,
} from "@/lib/news";
import { products } from "@/lib/products";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = findArticle((await params).slug);
  if (!article) {
    return {};
  }
  const text = article.text[await getLocale()];
  return {
    title: text.title,
    description: text.summary,
    alternates: { canonical: articleUrl(article) },
    openGraph: {
      type: "article",
      title: text.title,
      description: text.summary,
      url: articleUrl(article),
      publishedTime: article.date,
    },
  };
}

/** One article: its product and date, the headline, the summary, the text and where to go next. */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = findArticle((await params).slug);
  if (!article) {
    notFound();
  }
  const locale = await getLocale();
  const news = newsMessages[locale];
  const text = article.text[locale];
  const product = products[article.product];
  const notes = releaseNotes(article);
  return (
    <div className="pm-page pm-home pm-news-site">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: text.title,
            description: text.summary,
            datePublished: article.date,
            inLanguage: locale,
            url: articleUrl(article),
            publisher: {
              "@type": "Organization",
              name: "Progmasoft",
              url: "https://progmasoft.com/",
            },
            about: {
              "@type": "SoftwareApplication",
              name: product.name,
              url: `https://product.progmasoft.com/${article.product}`,
            },
          },
        ]}
      />
      <SiteHeader locale={locale} />
      <main>
        <article className="pm-article">
          <header className="pm-shell pm-article-head">
            <p className="pm-news-meta">
              <span
                className="pm-chip"
                style={{ background: accentColours[product.accent] }}
                aria-hidden="true"
              />
              <a href={`https://product.progmasoft.com/${article.product}`}>
                {product.name}
              </a>
              <time dateTime={article.date}>
                {formatDay(locale, article.date)}
              </time>
            </p>
            <h1 className="pm-serif">{text.title}</h1>
            <p className="pm-article-summary">{text.summary}</p>
          </header>
          <div className="pm-shell">
            <Flow
              colours={accentFields[product.accent]}
              seed={7.1}
              speed={0.5}
              className="pm-article-field"
            />
          </div>
          <div className="pm-shell pm-article-body">
            {text.body.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
            <p className="pm-pills pm-article-links">
              {notes ? (
                <a className="pm-pill pm-pill-dark" href={notes}>
                  {news.notes} ↗
                </a>
              ) : null}
              <a
                className="pm-pill pm-pill-outline"
                href={`https://product.progmasoft.com/${article.product}`}
              >
                {news.product.replace("{name}", product.name)}
              </a>
            </p>
            <p className="pm-article-back">
              <a href="https://news.progmasoft.com/">← {news.back}</a>
            </p>
          </div>
        </article>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
