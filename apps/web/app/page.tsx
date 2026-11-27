// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { formatDay } from "@/components/ProductCatalog";
import { SiteHeader } from "@/components/SiteHeader";
import { getHomeMessages } from "@/lib/home-messages";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";
import { policyUrls } from "@/lib/policies";
import { getCatalogMessages, products, releases } from "@/lib/products";
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

const discovery =
  "https://credentials.progmasoft.com/.well-known/openid-configuration";

/**
 * progmasoft.com: the areas Progmasoft works in, the newest releases of the
 * catalog, and where developers and everyone else go next. Plain text and
 * rules, no decoration: the page says what is there.
 */
export default async function Homepage() {
  const locale = await getLocale();
  const home = getHomeMessages(locale);
  const catalog = getCatalogMessages(locale);
  const recent = releases().slice(0, 5);
  return (
    <div className="pm-page">
      <JsonLd data={[organizationData(), websiteData(locale)]} />
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-intro">
          <div className="pm-shell">
            <h1>{home.hero.title}</h1>
            <p className="pm-lede">{home.hero.description}</p>
            <p className="pm-actions">
              <a className="button" href="https://product.progmasoft.com/">
                {home.hero.catalog}
              </a>
              <a className="pm-link" href="https://github.com/Progmasoft">
                {home.hero.source}
              </a>
            </p>
          </div>
        </section>

        <section className="pm-section" id="technology">
          <div className="pm-shell pm-split">
            <h2>{home.areas.title}</h2>
            <dl className="pm-areas">
              {home.areas.items.map(([title, description]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="pm-section" id="releases">
          <div className="pm-shell pm-split">
            <h2>{home.releases.title}</h2>
            <div>
              <ul className="pm-releases">
                {recent.map(({ slug, release }) => (
                  <li key={slug}>
                    <time dateTime={release.date}>
                      {formatDay(locale, release.date)}
                    </time>
                    <a href={`https://product.progmasoft.com/${slug}`}>
                      {products[slug].name} {release.version}
                    </a>
                    <span>{catalog.products[slug].tagline}</span>
                  </li>
                ))}
              </ul>
              <a
                className="pm-link"
                href="https://product.progmasoft.com/releases"
              >
                {home.releases.all}
              </a>
            </div>
          </div>
        </section>

        <section className="pm-section" id="developers">
          <div className="pm-shell pm-split">
            <h2>{home.developers.title}</h2>
            <div>
              <p className="pm-text">{home.developers.description}</p>
              <p className="pm-discovery">
                <span>{home.developers.discovery}</span>
                <code dir="ltr">{discovery}</code>
              </p>
              <p className="pm-actions">
                <a className="button" href="https://console.progmasoft.com/">
                  {home.developers.console}
                </a>
                <a className="pm-link" href="https://account.progmasoft.com/">
                  {home.developers.account}
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="pm-section" id="contact">
          <div className="pm-shell pm-split">
            <h2>{home.contact.title}</h2>
            <dl className="pm-contact">
              <div>
                <dt>{home.contact.support}</dt>
                <dd>
                  <a href="mailto:support@progmasoft.com">
                    support@progmasoft.com
                  </a>
                </dd>
              </div>
              <div>
                <dt>{home.contact.security}</dt>
                <dd>
                  <a href={policyUrls.security}>{policyUrls.security}</a>
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
