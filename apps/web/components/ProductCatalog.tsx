// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { ReactNode } from "react";
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
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            <p className="eyebrow">{catalog.eyebrow}</p>
            <h1>{title}</h1>
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

/** Projects as a table: name and tagline, category, language, status, latest release. */
export function ProductTable({
  slugs,
  locale,
  catalog,
}: {
  slugs: readonly ProductSlug[];
  locale: Locale;
  catalog: CatalogMessages;
}) {
  return (
    <div className="pm-table-wrap">
      <table className="pm-table">
        <thead>
          <tr>
            <th scope="col">{catalog.table.name}</th>
            <th scope="col">{catalog.table.category}</th>
            <th scope="col">{catalog.table.language}</th>
            <th scope="col">{catalog.table.status}</th>
            <th scope="col">{catalog.table.release}</th>
          </tr>
        </thead>
        <tbody>
          {slugs.map((slug) => {
            const product = products[slug];
            const release = product.latestRelease;
            return (
              <tr key={slug}>
                <th scope="row">
                  <a href={`/${slug}`}>{product.name}</a>
                  <span>{catalog.products[slug].tagline}</span>
                </th>
                <td>{catalog.categories[product.category]}</td>
                <td dir="ltr">{product.language}</td>
                <td>
                  <StatusBadge status={product.status} catalog={catalog} />
                </td>
                <td>
                  {release ? (
                    <a href={release.url}>
                      <bdi>{release.version}</bdi> ·{" "}
                      {formatDay(locale, release.date)}
                    </a>
                  ) : (
                    catalog.facts.none
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Projects as cards, under a heading: one group of a grouped view. */
export function ProductGroup({
  title,
  slugs,
  catalog,
}: {
  title: string;
  slugs: readonly ProductSlug[];
  catalog: CatalogMessages;
}) {
  return (
    <section className="pm-group">
      <h2>
        {title} <span className="pm-count">{slugs.length}</span>
      </h2>
      <div className="pm-product-grid">
        {slugs.map((slug) => {
          const product = products[slug];
          return (
            <a className="pm-card pm-product-card" href={`/${slug}`} key={slug}>
              <span className={`pm-accent pm-accent-${product.accent}`} />
              <StatusBadge status={product.status} catalog={catalog} />
              <h3>{product.name}</h3>
              <p>{catalog.products[slug].tagline}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
