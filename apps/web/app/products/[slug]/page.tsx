// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { forwardArrow } from "@/lib/localization";
import { getCatalogMessages, isProductSlug, products } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isProductSlug(slug)) {
    return {};
  }
  const text = getCatalogMessages(await getLocale()).products[slug];
  return {
    title: `${products[slug].name} · ${text.category}`,
    description: text.description,
    alternates: { canonical: `https://product.progmasoft.com/${slug}` },
  };
}

/** One product: what it is, what it does, and where it lives. */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  if (!isProductSlug(slug)) {
    notFound();
  }
  const locale = await getLocale();
  const catalog = getCatalogMessages(locale);
  const product = products[slug];
  const text = catalog.products[slug];
  const arrow = forwardArrow(locale);
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            <p className="eyebrow">{text.category}</p>
            <h1>
              {product.name} <span>{text.tagline}</span>
            </h1>
            <p className="pm-lede">{text.description}</p>
          </div>
        </section>
        <section className="pm-section">
          <div className="pm-shell pm-detail">
            <div>
              <div className="pm-heading">
                <h2>{catalog.features}</h2>
              </div>
              <ul className="pm-features">
                {text.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <aside className="pm-aside">
              <span className={`pm-accent pm-accent-${product.accent}`} />
              <a className="button" href={product.site}>
                {catalog.site} {arrow}
              </a>
              <a className="button button-secondary" href={product.source}>
                {catalog.source}
              </a>
              <span className="pm-note" dir="ltr">
                {product.site.replace(/^https:\/\//, "").replace(/\/$/, "")}
              </span>
              <Link className="pm-link" href="/">
                {catalog.back}
              </Link>
            </aside>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
