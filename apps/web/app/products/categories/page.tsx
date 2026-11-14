// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { CatalogPage, ProductGroup } from "@/components/ProductCatalog";
import { getLocale } from "@/lib/locale.server";
import {
  getCatalogMessages,
  productCategories,
  productSlugs,
  products,
} from "@/lib/products";

export async function generateMetadata(): Promise<Metadata> {
  const catalog = getCatalogMessages(await getLocale());
  return {
    title: catalog.categoriesTitle,
    description: catalog.categoriesDescription,
    alternates: { canonical: "https://product.progmasoft.com/categories" },
  };
}

/** The projects grouped by what they are for; a category without one is left out. */
export default async function CategoriesPage() {
  const locale = await getLocale();
  const catalog = getCatalogMessages(locale);
  return (
    <CatalogPage
      locale={locale}
      catalog={catalog}
      view="categories"
      title={catalog.categoriesTitle}
      description={catalog.categoriesDescription}
    >
      <section className="pm-section">
        <div className="pm-shell pm-catalog">
          {productCategories.map((category) => {
            const slugs = productSlugs.filter(
              (slug) => products[slug].category === category,
            );
            return slugs.length === 0 ? null : (
              <ProductGroup
                key={category}
                title={catalog.categories[category]}
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
