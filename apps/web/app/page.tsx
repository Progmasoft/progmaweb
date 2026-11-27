// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { formatDay } from "@/components/ProductCatalog";
import { SiteHeader } from "@/components/SiteHeader";
import {
  FeatureCarousel,
  type FeatureItem,
} from "@/components/site/FeatureCarousel";
import { Flow, type FlowColours } from "@/components/site/Flow";
import { Reveal } from "@/components/site/Reveal";
import { accentColours, accentFields } from "@/lib/brand-colours";
import { getHomeMessages } from "@/lib/home-messages";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";
import { articles, articleUrl, releaseNotes } from "@/lib/news";
import { policyUrls } from "@/lib/policies";
import { products, productSlugs } from "@/lib/products";
import { organizationData, websiteData } from "@/lib/structured-data";
import "./site.css";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = getMessages(await getLocale());
  return {
    title: metadata.homeTitle,
    description: metadata.homeDescription,
    alternates: { canonical: "https://progmasoft.com/" },
    robots: { index: true, follow: true },
  };
}

type Field = FlowColours;

/** One field per principle, each from one colour of the mark. */
const principleFields: Field[] = [
  ["#1f2733", "#3b4658", "#8b98ad", "#e8e4da"],
  ["#0f3440", "#1e7188", "#7fb8c4", "#efe9dc"],
  ["#2a1d63", "#7655fa", "#c2b4ff", "#f1ece2"],
  ["#5a2a12", "#dc7644", "#f2c39c", "#f6efe3"],
];

/** Where each product lands as the page scrolls; the sequence repeats. */
const placements = [
  "left",
  "right",
  "centre",
  "far-right",
  "left-low",
  "right-high",
];

const step = (index: number) => ({ "--i": index }) as CSSProperties;
const fill = (text: string, values: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

/**
 * progmasoft.com: a statement of what Progmasoft is, every product in turn over
 * a moving field, the news, what it makes, how it works and how to reach it.
 */
export default async function Homepage() {
  const locale = await getLocale();
  const home = getHomeMessages(locale);
  const news = articles.slice(0, 3);
  const made = [
    ...productSlugs.filter((slug) => products[slug].status === "released"),
    ...productSlugs.filter((slug) => products[slug].status !== "released"),
  ];
  const feature: FeatureItem[] = made.map((slug) => {
    const product = products[slug];
    const release = product.latestRelease;
    return {
      slug,
      name: product.name,
      line: home.lines[slug],
      colours: accentFields[product.accent],
      more: {
        label: home.feature.readMore,
        href: `https://product.progmasoft.com/${slug}`,
      },
      action: release
        ? {
            label: fill(home.feature.get, { name: product.name }),
            href: release.url,
          }
        : { label: home.feature.follow, href: product.source },
    };
  });
  const contactLinks = [
    "mailto:support@progmasoft.com",
    policyUrls.security,
    "https://github.com/Progmasoft",
  ];

  return (
    <div className="pm-page pm-home">
      <JsonLd data={[organizationData(), websiteData(locale)]} />
      <SiteHeader locale={locale} />
      <Reveal />
      <main>
        <section className="pm-shell pm-opening">
          <h1 className="pm-statement-text">
            <strong>{home.statement.lead}</strong> {home.statement.rest}
          </h1>
        </section>

        <section className="pm-shell pm-feature-wrap">
          <FeatureCarousel
            items={feature}
            label={home.feature.label}
            pause={home.feature.pause}
            play={home.feature.play}
          />
        </section>

        <section
          className="pm-shell pm-news"
          id="news"
          aria-labelledby="pm-news-title"
        >
          <div className="pm-row-head">
            <h2 id="pm-news-title" className="pm-section-title">
              {home.news.title}
            </h2>
            <a className="pm-text-link" href="https://news.progmasoft.com/">
              {home.news.all} →
            </a>
          </div>
          <ul className="pm-news-cards">
            {news.map((article, index) => {
              const text = article.text[locale];
              const notes = releaseNotes(article);
              return (
                <li
                  key={article.slug}
                  className="pm-news-card"
                  data-reveal
                  style={step(index)}
                >
                  <p className="pm-news-meta">
                    <span
                      className="pm-chip"
                      style={{
                        background:
                          accentColours[products[article.product].accent],
                      }}
                      aria-hidden="true"
                    />
                    <span>{home.news.category}</span>
                    <time dateTime={article.date}>
                      {formatDay(locale, article.date)}
                    </time>
                  </p>
                  <h3>
                    <a href={articleUrl(article)}>{text.title}</a>
                  </h3>
                  <p className="pm-news-text">{text.summary}</p>
                  <dl className="pm-news-rows">
                    <div>
                      <dt>{home.news.product}</dt>
                      <dd>
                        <a
                          href={`https://product.progmasoft.com/${article.product}`}
                        >
                          {products[article.product].name} →
                        </a>
                      </dd>
                    </div>
                    {notes ? (
                      <div>
                        <dt>{home.news.notes}</dt>
                        <dd>
                          <a href={notes}>GitHub ↗</a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  <a className="pm-news-button" href={articleUrl(article)}>
                    {home.news.read} →
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          className="pm-shell pm-made"
          id="products"
          aria-labelledby="pm-made-title"
        >
          <h2 id="pm-made-title" className="pm-section-title" data-reveal>
            {home.showcase.title}
          </h2>
          <ol className="pm-scatter">
            {made.map((slug, index) => (
              <li
                key={slug}
                className={`pm-scatter-item pm-scatter-${placements[index % placements.length]}`}
                data-reveal
                style={
                  {
                    "--colour": accentColours[products[slug].accent],
                  } as CSSProperties
                }
              >
                <h3 className="pm-scatter-name pm-serif">
                  {products[slug].name}
                </h3>
                <p className="pm-scatter-line">{home.lines[slug]}</p>
                <p className="pm-more">
                  <a href={`https://product.progmasoft.com/${slug}`}>
                    {home.showcase.learnMore} →
                  </a>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pm-shell pm-learn" aria-labelledby="pm-learn-title">
          <h2 id="pm-learn-title" className="pm-section-title" data-reveal>
            {home.principles.title}
          </h2>
          <ul className="pm-learn-cards">
            {home.principles.items.map(([title, text], index) => (
              <li key={title} data-reveal style={step(index)}>
                <Flow
                  colours={
                    principleFields[index % principleFields.length] ??
                    accentFields.slate
                  }
                  seed={index * 3.7 + 1}
                  speed={0.35}
                  className="pm-learn-art"
                />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="pm-contact"
          id="developers"
          aria-labelledby="pm-contact-title"
        >
          <div className="pm-shell">
            <h2 id="pm-contact-title" className="pm-section-title" data-reveal>
              {home.contact.title}
            </h2>
            <ul className="pm-contact-cards">
              {home.contact.items.map(([title, text, action], index) => (
                <li key={title} data-reveal style={step(index)}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <a
                    className="pm-pill pm-pill-outline"
                    href={contactLinks[index]}
                  >
                    {action} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
