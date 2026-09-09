// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { Fragment } from "react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = getMessages(await getLocale());
  return {
    title: metadata.homeTitle,
    description: metadata.homeDescription,
    alternates: { canonical: "https://progmasoft.com/" },
    robots: { index: true, follow: true },
  };
}

const productLinks = [
  {
    href: "https://xsharp-lang.xyz/",
    accent: "violet",
  },
  {
    href: "https://viget.progmasoft.com/",
    accent: "blue",
  },
  {
    href: "https://github.com/Progmasoft",
    accent: "green",
  },
] as const;

export default async function Homepage() {
  const locale = await getLocale();
  const { home } = getMessages(locale);
  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="hero organization-hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">{home.heroEyebrow}</p>
              <h1>
                {home.heroTitleStart} <span>{home.heroTitleAccent}</span>
              </h1>
              <p className="hero-lede">{home.heroDescription}</p>
              <div className="hero-actions">
                <a className="button" href="#products">
                  {home.exploreProducts}
                </a>
                <a
                  className="button button-secondary"
                  href="https://github.com/Progmasoft"
                >
                  {home.browseSource}
                </a>
              </div>
              <dl className="hero-facts">
                {home.facts.map(([term, description]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{description}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="hero-visual" aria-label={home.visualLabel}>
              <div className="system-window">
                <div className="window-bar">
                  <span></span>
                  <span></span>
                  <span></span>
                  <code>progmasoft/organization</code>
                </div>
                <div className="system-stack">
                  {home.stack.map(([label, title, description], index) => (
                    <Fragment key={label}>
                      {index > 0 && (
                        <div className="stack-arrow" aria-hidden="true">
                          ↓
                        </div>
                      )}
                      <div
                        className={`stack-row ${["stack-language", "stack-project", "stack-native"][index]}`}
                      >
                        <span>{label}</span>
                        <strong>{title}</strong>
                        <small>{description}</small>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="products">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{home.productsEyebrow}</p>
                <h2>{home.productsTitle}</h2>
              </div>
              <p>{home.productsDescription}</p>
            </div>
            <div className="product-grid">
              {home.products.map(
                ([eyebrow, name, description, action], index) => (
                  <article
                    className={`product-card accent-${productLinks[index]?.accent}`}
                    key={name}
                  >
                    <p className="eyebrow">{eyebrow}</p>
                    <h3>{name}</h3>
                    <p>{description}</p>
                    <a href={productLinks[index]?.href}>{action} →</a>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="section section-muted" id="principles">
          <div className="shell principles-grid">
            <div className="section-heading vertical">
              <p className="eyebrow">{home.principlesEyebrow}</p>
              <h2>{home.principlesTitle}</h2>
              <p>{home.principlesDescription}</p>
            </div>
            <div className="principle-list">
              {home.principles.map(([title, description], index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section callout-section">
          <div className="shell callout">
            <div>
              <p className="eyebrow">{home.accountEyebrow}</p>
              <h2>{home.accountTitle}</h2>
              <p>{home.accountDescription}</p>
            </div>
            <a
              className="button button-light"
              href="https://account.progmasoft.com/"
            >
              {home.openAccount}
            </a>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
