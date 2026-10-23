// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { products } from "@/lib/products";
import { getSitesMessages } from "@/lib/product-sites";

export async function generateMetadata(): Promise<Metadata> {
  const { catch3 } = getSitesMessages(await getLocale());
  return {
    title: `Catch3 · ${catch3.tagline}`,
    description: catch3.description,
    alternates: { canonical: "https://catch3.progmasoft.com/" },
  };
}

// The example of the Catch3 documentation (docs/progmasoft-properties.md).
const example = `#include <Progmasoft/Catch3.hpp>

using namespace Progmasoft::Catch3;

TEST_CASE( "reversing twice gives the original", "[property]" ) {
    CATCH3_CHECK_FOR_ALL(
        Gen::Vectors( Gen::Integers<int>() ),
        []( const std::vector<int>& values ) {
            auto copy = values;
            std::reverse( copy.begin(), copy.end() );
            std::reverse( copy.begin(), copy.end() );
            return copy == values;
        } );
}`;

/** catch3.progmasoft.com: the site of Catch3. */
export default async function Catch3Page() {
  const locale = await getLocale();
  const { catch3, common } = getSitesMessages(locale);
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-hero-inner">
            <div>
              <p className="eyebrow">{catch3.eyebrow}</p>
              <h1>
                Catch3 <span>{catch3.tagline}</span>
              </h1>
              <p className="pm-lede">{catch3.description}</p>
              <div className="pm-actions">
                <a className="button" href={products.catch3.source}>
                  {common.source}
                </a>
                <a
                  className="button button-secondary"
                  href="https://product.progmasoft.com/catch3"
                >
                  {common.productPage}
                </a>
              </div>
              <p className="pm-note">{catch3.disclaimer}</p>
            </div>
            <div>
              <p className="eyebrow">{catch3.exampleTitle}</p>
              <pre className="pm-code pm-code-light" dir="ltr">
                <code>{example}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="pm-section">
          <div className="pm-shell">
            <div className="pm-heading">
              <h2>{catch3.featuresTitle}</h2>
            </div>
            <div className="pm-bento">
              {catch3.features.map(([title, description]) => (
                <article className="pm-card" key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pm-section pm-section-muted">
          <div className="pm-shell">
            <div className="pm-heading">
              <h2>{catch3.roadmapTitle}</h2>
            </div>
            <ul className="pm-features pm-roadmap">
              {catch3.roadmap.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
