// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { forwardArrow } from "@/lib/localization";
import { getCatalogMessages, productSlugs, products } from "@/lib/products";

export async function generateMetadata(): Promise<Metadata> {
  const catalog = getCatalogMessages(await getLocale());
  return {
    title: catalog.metadataTitle,
    description: catalog.metadataDescription,
    alternates: { canonical: "https://product.progmasoft.com/" },
  };
}

/** product.progmasoft.com: every product, each leading to its own page. */
export default async function ProductsPage() {
  const locale = await getLocale();
  const catalog = getCatalogMessages(locale);
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            <p className="eyebrow">{catalog.eyebrow}</p>
            <h1>{catalog.title}</h1>
            <p className="pm-lede">{catalog.description}</p>
          </div>
        </section>
        <section className="pm-section">
          <div className="pm-shell pm-product-grid">
            {productSlugs.map((slug) => {
              const product = products[slug];
              const text = catalog.products[slug];
              return (
                <a
                  className="pm-card pm-product-card"
                  href={`/${slug}`}
                  key={slug}
                >
                  <span className={`pm-accent pm-accent-${product.accent}`} />
                  <span className="pm-tag">{text.category}</span>
                  <h3>{product.name}</h3>
                  <p>{text.tagline}</p>
                  <span className="pm-more">
                    {catalog.details} {forwardArrow(locale)}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
