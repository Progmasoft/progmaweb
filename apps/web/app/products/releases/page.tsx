// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import {
  CatalogPage,
  formatDay,
  StatusBadge,
} from "@/components/ProductCatalog";
import { getLocale } from "@/lib/locale.server";
import {
  getCatalogMessages,
  productSlugs,
  products,
  releases,
} from "@/lib/products";

export async function generateMetadata(): Promise<Metadata> {
  const catalog = getCatalogMessages(await getLocale());
  return {
    title: catalog.releasesTitle,
    description: catalog.releasesDescription,
    alternates: { canonical: "https://product.progmasoft.com/releases" },
  };
}

/** The latest release of each project, newest first, then those still without one. */
export default async function ReleasesPage() {
  const locale = await getLocale();
  const catalog = getCatalogMessages(locale);
  const released = releases();
  const waiting = productSlugs.filter((slug) => !products[slug].latestRelease);
  return (
    <CatalogPage
      locale={locale}
      catalog={catalog}
      view="releases"
      title={catalog.releasesTitle}
      description={catalog.releasesDescription}
    >
      <section className="pm-section">
        <div className="pm-shell pm-catalog">
          {released.length === 0 ? (
            <p>{catalog.noReleases}</p>
          ) : (
            <ul className="pm-releases">
              {released.map(({ slug, release }) => (
                <li key={`${slug}-${release.version}`}>
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
          {waiting.length > 0 ? (
            <section className="pm-group">
              <h2>{catalog.statuses.development}</h2>
              <ul className="pm-releases">
                {waiting.map((slug) => (
                  <li key={slug}>
                    <a href={`/${slug}`}>{products[slug].name}</a>
                    <StatusBadge
                      status={products[slug].status}
                      catalog={catalog}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </section>
    </CatalogPage>
  );
}
