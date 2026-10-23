// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { products } from "@/lib/products";
import { getSitesMessages } from "@/lib/product-sites";

export async function generateMetadata(): Promise<Metadata> {
  const { xide } = getSitesMessages(await getLocale());
  return {
    title: `Xide · ${xide.tagline}`,
    description: xide.description,
    alternates: { canonical: "https://ides.progmasoft.com/xide" },
  };
}

/** ides.progmasoft.com/xide: the site of Xide. */
export default async function XidePage() {
  const locale = await getLocale();
  const { xide, common } = getSitesMessages(locale);
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-hero-inner">
            <div>
              <p className="eyebrow">{xide.eyebrow}</p>
              <h1>
                Xide <span>{xide.tagline}</span>
              </h1>
              <p className="pm-lede">{xide.description}</p>
              <div className="pm-actions">
                <a className="button" href={products.xide.source}>
                  {common.source}
                </a>
                <a
                  className="button button-secondary"
                  href="https://product.progmasoft.com/xide"
                >
                  {common.productPage}
                </a>
              </div>
            </div>
            <aside className="pm-aside">
              <span className="pm-tag">{common.status}</span>
              <p>{xide.status}</p>
            </aside>
          </div>
        </section>

        <section className="pm-section">
          <div className="pm-shell">
            <div className="pm-heading">
              <h2>{xide.layoutTitle}</h2>
            </div>
            <div className="pm-bento">
              {xide.layout.map(([title, description]) => (
                <article className="pm-card" key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pm-section pm-section-muted">
          <div className="pm-shell pm-detail">
            <div className="pm-heading">
              <h2>{xide.languagesTitle}</h2>
              <p>{xide.languagesDescription}</p>
            </div>
            <div>
              <div className="pm-heading">
                <h2>{xide.architectureTitle}</h2>
              </div>
              <ul className="pm-features">
                {xide.architecture.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
