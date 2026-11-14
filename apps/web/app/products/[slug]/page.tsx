// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CatalogPage,
  formatDay,
  StatusBadge,
} from "@/components/ProductCatalog";
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
  const catalog = getCatalogMessages(await getLocale());
  return {
    title: `${products[slug].name} · ${catalog.categories[products[slug].category]}`,
    description: catalog.products[slug].description,
    alternates: { canonical: `https://product.progmasoft.com/${slug}` },
  };
}

/** One project: what it is, what it does, its facts, and where it lives. */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  if (!isProductSlug(slug)) {
    notFound();
  }
  const locale = await getLocale();
  const catalog = getCatalogMessages(locale);
  const product = products[slug];
  const text = catalog.products[slug];
  const release = product.latestRelease;
  const arrow = forwardArrow(locale);
  return (
    <CatalogPage
      locale={locale}
      catalog={catalog}
      view="all"
      title={product.name}
      description={text.tagline}
    >
      <section className="pm-section">
        <div className="pm-shell pm-detail">
          <div>
            <p className="pm-lede">{text.description}</p>
            <div className="pm-heading">
              <h2>
                {product.status === "released"
                  ? catalog.features
                  : catalog.featuresPlanned}
              </h2>
            </div>
            <ul className="pm-features">
              {text.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
          <aside className="pm-aside">
            <span className={`pm-accent pm-accent-${product.accent}`} />
            <dl className="pm-facts">
              <div>
                <dt>{catalog.facts.status}</dt>
                <dd>
                  <StatusBadge status={product.status} catalog={catalog} />
                </dd>
              </div>
              <div>
                <dt>{catalog.facts.category}</dt>
                <dd>{catalog.categories[product.category]}</dd>
              </div>
              <div>
                <dt>{catalog.facts.language}</dt>
                <dd dir="ltr">{product.language}</dd>
              </div>
              <div>
                <dt>{catalog.facts.license}</dt>
                <dd dir="ltr">{product.license}</dd>
              </div>
              <div>
                <dt>{catalog.facts.release}</dt>
                <dd>
                  {release ? (
                    <a href={release.url}>
                      <bdi>{release.version}</bdi> ·{" "}
                      {formatDay(locale, release.date)}
                    </a>
                  ) : (
                    catalog.facts.none
                  )}
                </dd>
              </div>
              <div>
                <dt>{catalog.facts.started}</dt>
                <dd>
                  <time dateTime={product.started}>
                    {formatDay(locale, product.started)}
                  </time>
                </dd>
              </div>
            </dl>
            {product.site ? (
              <a className="button" href={product.site}>
                {catalog.site} {arrow}
              </a>
            ) : null}
            <a className="button button-secondary" href={product.source}>
              {catalog.source}
            </a>
            <a className="pm-link" href={product.issues}>
              {catalog.issues}
            </a>
            <Link className="pm-link" href="/">
              {catalog.back}
            </Link>
          </aside>
        </div>
      </section>
    </CatalogPage>
  );
}
