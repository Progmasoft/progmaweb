// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { ViGetFooter } from "@/components/ViGetFooter";
import { ViGetHeader } from "@/components/ViGetHeader";
import { getLocale } from "@/lib/locale.server";
import { forwardArrow, getMessages } from "@/lib/localization";
import { catalogText } from "@/lib/viget-catalogs";

export async function generateMetadata(): Promise<Metadata> {
  const catalogs = catalogText(await getLocale());
  return {
    title: `${catalogs.talaTitle} · ViGet`,
    description: catalogs.talaDescription,
    alternates: { canonical: "https://viget.progmasoft.com/langs/tala" },
    robots: { index: true, follow: true },
  };
}

export default async function TalaPackagesPage() {
  const locale = await getLocale();
  const { viget } = getMessages(locale);
  const catalogs = catalogText(locale);
  return (
    <div className="viget-surface">
      <ViGetHeader locale={locale} />
      <main>
        <section className="viget-plugin-hero">
          <div className="shell viget-plugin-grid">
            <div className="viget-hero-copy">
              <p className="eyebrow">ViGet · LANGUAGES</p>
              <h1>{catalogs.talaTitle}</h1>
              <p>{catalogs.talaDescription}</p>
              <div className="hero-actions">
                <a
                  className="button button-secondary"
                  href="https://viget.progmasoft.com/"
                >
                  {catalogs.backToRegistry}
                </a>
                <a className="viget-text-link" href="https://tala.run/">
                  Tala {forwardArrow(locale)}
                </a>
              </div>
            </div>
            <aside
              className="viget-availability"
              aria-labelledby="package-availability-title"
            >
              <div className="viget-status">
                <span aria-hidden="true" />
                {viget.available}
              </div>
              <h2 id="package-availability-title">{catalogs.talaEmptyTitle}</h2>
              <p>{catalogs.talaEmptyDescription}</p>
              <dl>
                <div>
                  <dt>{viget.packageFormat}</dt>
                  <dd>.vipkg</dd>
                </div>
                <div>
                  <dt>{viget.publisherIdentity}</dt>
                  <dd>Progmasoft Account</dd>
                </div>
                <div>
                  <dt>{viget.publishing}</dt>
                  <dd>{viget.publishingClosed}</dd>
                </div>
              </dl>
              <code>/langs/tala/&lt;Publisher&gt;/&lt;Name&gt;/</code>
            </aside>
          </div>
        </section>
      </main>
      <ViGetFooter locale={locale} />
    </div>
  );
}
