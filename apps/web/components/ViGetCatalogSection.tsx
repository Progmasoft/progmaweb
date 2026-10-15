// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import { forwardArrow, type Locale } from "@/lib/localization";
import { catalogText, type Catalog } from "@/lib/viget-catalogs";

/**
 * One group of catalogs on the ViGet home page. An open catalog is a link to its page; a catalog
 * that is not offered yet is a disabled button: gray, not pressable and leading nowhere.
 */
export function ViGetCatalogSection({
  id,
  heading,
  description,
  catalogs,
  locale,
  muted = false,
}: {
  id: string;
  heading: string;
  description: string;
  catalogs: readonly Catalog[];
  locale: Locale;
  muted?: boolean;
}) {
  const text = catalogText(locale);
  return (
    <section
      className={muted ? "section section-muted" : "section"}
      aria-labelledby={`${id}-title`}
    >
      <div className="shell">
        <div className="section-heading">
          <div>
            <h2 id={`${id}-title`} className="viget-catalog-heading">
              {heading}
            </h2>
          </div>
          <p>{description}</p>
        </div>
        <div className="viget-catalog-grid">
          {catalogs.map((catalog) =>
            catalog.path ? (
              <a
                key={catalog.name}
                className="viget-catalog-card viget-catalog-primary"
                href={`https://viget.progmasoft.com${catalog.path}`}
              >
                <h3>{catalog.name}</h3>
                <small>{text.holds[catalog.name]}</small>
                <strong>
                  {text.open} {forwardArrow(locale)}
                </strong>
              </a>
            ) : (
              <button
                key={catalog.name}
                className="viget-catalog-card viget-catalog-disabled"
                type="button"
                disabled
              >
                <h3>{catalog.name}</h3>
                <small>{text.notAvailable}</small>
              </button>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
