// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { forwardArrow } from "@/lib/localization";
import { getCatalogMessages, products } from "@/lib/products";
import { getSitesMessages } from "@/lib/product-sites";

export async function generateMetadata(): Promise<Metadata> {
  const { ides } = getSitesMessages(await getLocale());
  return {
    title: ides.title,
    description: ides.description,
    alternates: { canonical: "https://ides.progmasoft.com/" },
  };
}

/** ides.progmasoft.com: the development environments of Progmasoft. */
export default async function IdesPage() {
  const locale = await getLocale();
  const { ides } = getSitesMessages(locale);
  const xide = getCatalogMessages(locale).products.xide;
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            <h1>{ides.title}</h1>
            <p className="pm-lede">{ides.description}</p>
          </div>
        </section>
        <section className="pm-section">
          <div className="pm-shell pm-product-grid">
            <a className="pm-card pm-product-card" href="/xide">
              <span className={`pm-accent pm-accent-${products.xide.accent}`} />
              <span className="pm-tag">{xide.category}</span>
              <h3>{products.xide.name}</h3>
              <p>{xide.tagline}</p>
              <span className="pm-more">
                {ides.open} {forwardArrow(locale)}
              </span>
            </a>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
