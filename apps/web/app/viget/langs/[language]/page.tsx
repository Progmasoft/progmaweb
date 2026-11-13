// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViGetFooter } from "@/components/ViGetFooter";
import { ViGetHeader } from "@/components/ViGetHeader";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";
import {
  catalogText,
  isLanguageSlug,
  languageSlugs,
} from "@/lib/viget-catalogs";

type Parameters = { params: Promise<{ language: string }> };

// The languages are fixed; any other segment is no catalog.
export const dynamicParams = false;

export function generateStaticParams() {
  return languageSlugs.map((language) => ({ language }));
}

export async function generateMetadata({
  params,
}: Parameters): Promise<Metadata> {
  const { language } = await params;
  if (!isLanguageSlug(language)) return { title: "ViGet" };
  const page = catalogText(await getLocale()).languages[language];
  return {
    title: `${page.title} · ViGet`,
    description: page.description,
    alternates: {
      canonical: `https://viget.progmasoft.com/langs/${language}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LanguagePackagesPage({ params }: Parameters) {
  const { language } = await params;
  if (!isLanguageSlug(language)) notFound();
  const locale = await getLocale();
  const { viget } = getMessages(locale);
  const catalogs = catalogText(locale);
  const page = catalogs.languages[language];
  return (
    <div className="viget-surface">
      <ViGetHeader locale={locale} />
      <main>
        <section className="viget-plugin-hero">
          <div className="shell viget-plugin-grid">
            <div className="viget-hero-copy">
              <p className="eyebrow">ViGet · LANGUAGES</p>
              <h1>{page.title}</h1>
              <p>{page.description}</p>
              <div className="hero-actions">
                <a
                  className="button button-secondary"
                  href="https://viget.progmasoft.com/"
                >
                  {catalogs.backToRegistry}
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
              <h2 id="package-availability-title">{page.emptyTitle}</h2>
              <p>{catalogs.languageEmptyDescription}</p>
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
              <code>/langs/{language}/&lt;Publisher&gt;/&lt;Name&gt;/</code>
            </aside>
          </div>
        </section>
      </main>
      <ViGetFooter locale={locale} />
    </div>
  );
}
