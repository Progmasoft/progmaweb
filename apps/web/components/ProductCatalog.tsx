// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ReactNode } from "react";
import { accentStyle } from "@/lib/brand-colours";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import type { Locale } from "@/lib/localization";
import {
  type CatalogMessages,
  type ProductSlug,
  type ProductStatus,
  products,
} from "@/lib/products";

export type CatalogView = "all" | "categories" | "languages" | "releases";

// The catalog's own paths are those of product.progmasoft.com, which the proxy
// maps to /products/...; typed routes know only the internal ones, so the
// links between them are plain anchors.

const viewPaths: Record<CatalogView, string> = {
  all: "/",
  categories: "/categories",
  languages: "/languages",
  releases: "/releases",
};

/** A day of the catalog, YYYY-MM-DD, as the visitor's language writes it. */
export function formatDay(locale: Locale, day: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

export function StatusBadge({
  status,
  catalog,
}: {
  status: ProductStatus;
  catalog: CatalogMessages;
}) {
  return (
    <span className={`pm-status pm-status-${status}`}>
      {catalog.statuses[status]}
    </span>
  );
}

/** The page of one catalog view: header, hero, the links between views, content. */
export function CatalogPage({
  locale,
  catalog,
  view,
  title,
  description,
  children,
}: {
  locale: Locale;
  catalog: CatalogMessages;
  view: CatalogView;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="pm-page pm-catalog">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            <p className="eyebrow">{catalog.eyebrow}</p>
            <h1 className="pm-serif">{title}</h1>
            <p className="pm-lede">{description}</p>
            <nav className="pm-views" aria-label={catalog.views.label}>
              {(Object.keys(viewPaths) as CatalogView[]).map((name) => (
                <a
                  key={name}
                  href={viewPaths[name]}
                  aria-current={name === view ? "page" : undefined}
                >
                  {catalog.views[name]}
                </a>
              ))}
            </nav>
          </div>
        </section>
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}

/**
 * One project as a card: its moving colour, status, name and tagline, then its category, language and latest
 * release. The name links to the project's page and the whole card answers to it; the release has its own link.
 */
function ProductCard({
  slug,
  locale,
  catalog,
}: {
  slug: ProductSlug;
  locale: Locale;
  catalog: CatalogMessages;
}) {
  const product = products[slug];
  const release = product.latestRelease;
  return (
    <article className="pm-product-card">
      <span
        className="pm-product-field pm-live-accent"
        style={accentStyle(product.accent)}
        aria-hidden="true"
      />
      <div className="pm-product-body">
        <StatusBadge status={product.status} catalog={catalog} />
        <h3 className="pm-serif">
          <a className="pm-product-link" href={`/${slug}`}>
            {product.name}
          </a>
        </h3>
        <p>{catalog.products[slug].tagline}</p>
        <dl className="pm-product-facts">
          <div>
            <dt>{catalog.table.category}</dt>
            <dd>{catalog.categories[product.category]}</dd>
          </div>
          <div>
            <dt>{catalog.table.language}</dt>
            <dd>
              <bdi dir="ltr">{product.language}</bdi>
            </dd>
          </div>
          <div>
            <dt>{catalog.table.release}</dt>
            <dd>
              {release ? (
                <a className="pm-product-release" href={release.url}>
                  <bdi>{release.version}</bdi> ·{" "}
                  {formatDay(locale, release.date)}
                </a>
              ) : (
                catalog.facts.none
              )}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

/** Projects as a grid of cards. */
export function ProductCards({
  slugs,
  locale,
  catalog,
}: {
  slugs: readonly ProductSlug[];
  locale: Locale;
  catalog: CatalogMessages;
}) {
  return (
    <div className="pm-product-grid">
      {slugs.map((slug) => (
        <ProductCard key={slug} slug={slug} locale={locale} catalog={catalog} />
      ))}
    </div>
  );
}

/** Projects as cards, under a heading: one group of a grouped view. */
export function ProductGroup({
  title,
  slugs,
  locale,
  catalog,
}: {
  title: string;
  slugs: readonly ProductSlug[];
  locale: Locale;
  catalog: CatalogMessages;
}) {
  return (
    <section className="pm-group">
      <h2 className="pm-serif">
        {title} <span className="pm-count">{slugs.length}</span>
      </h2>
      <ProductCards slugs={slugs} locale={locale} catalog={catalog} />
    </section>
  );
}
