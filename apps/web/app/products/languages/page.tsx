// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { CatalogPage, ProductGroup } from "@/components/ProductCatalog";
import { getLocale } from "@/lib/locale.server";
import {
  getCatalogMessages,
  productLanguages,
  productSlugs,
  products,
} from "@/lib/products";

export async function generateMetadata(): Promise<Metadata> {
  const catalog = getCatalogMessages(await getLocale());
  return {
    title: catalog.languagesTitle,
    description: catalog.languagesDescription,
    alternates: { canonical: "https://product.progmasoft.com/languages" },
  };
}

/** The projects grouped by the language they are written in. */
export default async function LanguagesPage() {
  const locale = await getLocale();
  const catalog = getCatalogMessages(locale);
  return (
    <CatalogPage
      locale={locale}
      catalog={catalog}
      view="languages"
      title={catalog.languagesTitle}
      description={catalog.languagesDescription}
    >
      <section className="pm-section">
        <div className="pm-shell pm-index">
          {productLanguages.map((language) => {
            const slugs = productSlugs.filter(
              (slug) => products[slug].language === language,
            );
            return slugs.length === 0 ? null : (
              <ProductGroup
                key={language}
                title={language}
                slugs={slugs}
                catalog={catalog}
              />
            );
          })}
        </div>
      </section>
    </CatalogPage>
  );
}
