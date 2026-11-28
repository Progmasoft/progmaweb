// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { JsonLd } from "@/components/JsonLd";
import { catalogData } from "@/lib/structured-data";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CatalogPage,
  formatDay,
  ProductCards,
} from "@/components/ProductCatalog";
import { accentStyle } from "@/lib/brand-colours";
import { getLocale } from "@/lib/locale.server";
import {
  filterProducts,
  getCatalogMessages,
  parseProductFilter,
  productCategories,
  productLanguages,
  productSlugs,
  productStatuses,
  products,
  releases,
} from "@/lib/products";

export async function generateMetadata(): Promise<Metadata> {
  const catalog = getCatalogMessages(await getLocale());
  return {
    title: catalog.metadataTitle,
    description: catalog.metadataDescription,
    alternates: { canonical: "https://product.progmasoft.com/" },
  };
}

interface CatalogProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * product.progmasoft.com: every project in numbers and in one table, which
 * the search form narrows without any script, and the latest releases.
 */
export default async function ProductsPage({ searchParams }: CatalogProps) {
  const locale = await getLocale();
  const catalog = getCatalogMessages(locale);
  const filter = parseProductFilter(await searchParams);
  const found = filterProducts(locale, filter);
  const all = productSlugs.map((slug) => products[slug]);
  const stats: [string, number][] = [
    [catalog.stats.projects, all.length],
    [catalog.stats.released, all.filter((p) => p.status === "released").length],
    [
      catalog.stats.development,
      all.filter((p) => p.status === "development").length,
    ],
    [catalog.stats.languages, new Set(all.map((p) => p.language)).size],
  ];
  const latest = releases().slice(0, 5);
  return (
    <CatalogPage
      locale={locale}
      catalog={catalog}
      view="all"
      title={catalog.title}
      description={catalog.description}
    >
      <JsonLd data={catalogData(locale)} />
      <section className="pm-section">
        <div className="pm-shell pm-index">
          <dl className="pm-stats">
            {stats.map(([label, value]) => (
              <div key={label}>
                <dd>{value}</dd>
                <dt>{label}</dt>
              </div>
            ))}
          </dl>

          <form className="pm-filter" method="get" action="/" role="search">
            <label className="pm-filter-query">
              <span>{catalog.search.label}</span>
              <input
                type="search"
                name="q"
                defaultValue={filter.query}
                placeholder={catalog.search.placeholder}
                maxLength={100}
              />
            </label>
            <label>
              <span>{catalog.search.category}</span>
              <select name="category" defaultValue={filter.category ?? ""}>
                <option value="">{catalog.search.any}</option>
                {productCategories.map((category) => (
                  <option key={category} value={category}>
                    {catalog.categories[category]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{catalog.search.language}</span>
              <select name="language" defaultValue={filter.language ?? ""}>
                <option value="">{catalog.search.any}</option>
                {productLanguages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{catalog.search.status}</span>
              <select name="status" defaultValue={filter.status ?? ""}>
                <option value="">{catalog.search.any}</option>
                {productStatuses.map((status) => (
                  <option key={status} value={status}>
                    {catalog.statuses[status]}
                  </option>
                ))}
              </select>
            </label>
            <div className="pm-filter-actions">
              <button className="button" type="submit">
                {catalog.search.submit}
              </button>
              <Link className="button button-secondary" href="/">
                {catalog.search.reset}
              </Link>
            </div>
          </form>

          <p className="pm-results" role="status">
            {found.length === 0
              ? catalog.search.none
              : catalog.search.results.replace("{count}", String(found.length))}
          </p>
          {found.length > 0 ? (
            <ProductCards slugs={found} locale={locale} catalog={catalog} />
          ) : null}

          <section className="pm-group">
            <h2 className="pm-serif">{catalog.latestReleases}</h2>
            {latest.length === 0 ? (
              <p>{catalog.noReleases}</p>
            ) : (
              <ul className="pm-releases">
                {latest.map(({ slug, release }) => (
                  <li key={`${slug}-${release.version}`}>
                    <span
                      className="pm-release-dot pm-live-accent"
                      style={accentStyle(products[slug].accent)}
                      aria-hidden="true"
                    />
                    <a href={release.url}>
                      {products[slug].name} <bdi>{release.version}</bdi>
                    </a>
                    <time dateTime={release.date}>
                      {formatDay(locale, release.date)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </CatalogPage>
  );
}
