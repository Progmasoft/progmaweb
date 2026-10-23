// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { AreaIcon, areaKinds } from "@/components/site/AreaIcon";
import { getHomeMessages } from "@/lib/home-messages";
import { getLocale } from "@/lib/locale.server";
import { forwardArrow, getMessages } from "@/lib/localization";
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

/**
 * progmasoft.com. Progmasoft is presented as a pool of technology areas; the
 * products have their own catalog on product.progmasoft.com.
 */
export default async function Homepage() {
  const locale = await getLocale();
  const { hero, pool, principles, developers } = getHomeMessages(locale);
  const arrow = forwardArrow(locale);
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-hero-inner">
            <div>
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1>
                {hero.titleStart} <span>{hero.titleAccent}</span>
              </h1>
              <p className="pm-lede">{hero.description}</p>
              <div className="pm-actions">
                <a className="button" href="#technology">
                  {hero.explore}
                </a>
                <a
                  className="button button-secondary"
                  href="https://product.progmasoft.com/"
                >
                  {hero.products} {arrow}
                </a>
              </div>
            </div>
            <div className="pm-pool-visual" aria-label={hero.poolLabel}>
              {pool.areas.map(([title], index) => (
                <div className="pm-pool-tile" key={title}>
                  <span className={`pm-icon pm-icon-${areaKinds[index]}`}>
                    <AreaIcon kind={areaKinds[index] ?? "languages"} />
                  </span>
                  <strong>{title}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pm-section" id="technology">
          <div className="pm-shell">
            <div className="pm-heading">
              <p className="eyebrow">{pool.eyebrow}</p>
              <h2>{pool.title}</h2>
              <p>{pool.description}</p>
            </div>
            <div className="pm-bento">
              {pool.areas.map(([title, description], index) => (
                <article
                  className={`pm-card${[0, 3, 4].includes(index) ? " pm-card-wide" : ""}`}
                  key={title}
                >
                  <span className={`pm-icon pm-icon-${areaKinds[index]}`}>
                    <AreaIcon kind={areaKinds[index] ?? "languages"} />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <div className="pm-catalog">
              <p>{pool.catalog}</p>
              <a className="pm-link" href="https://product.progmasoft.com/">
                {pool.catalogLink} {arrow}
              </a>
            </div>
          </div>
        </section>

        <section className="pm-section pm-section-muted" id="principles">
          <div className="pm-shell">
            <div className="pm-heading">
              <p className="eyebrow">{principles.eyebrow}</p>
              <h2>{principles.title}</h2>
            </div>
            <div className="pm-principles">
              {principles.items.map(([title, description], index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pm-section" id="developers">
          <div className="pm-shell pm-band">
            <div>
              <p className="eyebrow">{developers.eyebrow}</p>
              <h2>{developers.title}</h2>
              <p>{developers.description}</p>
              <div className="pm-actions">
                <a
                  className="button button-light"
                  href="https://console.progmasoft.com/"
                >
                  {developers.console}
                </a>
                <a
                  className="button button-secondary"
                  href="https://account.progmasoft.com/"
                >
                  {developers.account}
                </a>
              </div>
            </div>
            <pre className="pm-code" dir="ltr">
              <code>
                <b>GET</b> https://credentials.progmasoft.com
                {"\n"}
                {"    "}/.well-known/openid-configuration
                {"\n\n"}
                <b>scope</b> openid profile email
                {"\n"}
                {"      "}viget.packages.read
              </code>
            </pre>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
