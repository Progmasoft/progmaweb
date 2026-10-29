// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { ViGetFooter } from "@/components/ViGetFooter";
import { ViGetHeader } from "@/components/ViGetHeader";
import { getLocale } from "@/lib/locale.server";
import { forwardArrow } from "@/lib/localization";
import { catalogText } from "@/lib/viget-catalogs";
import { gradlePlugins, pluginText } from "@/lib/viget-plugins";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = pluginText(locale);
  return {
    title: `${text.gradleTitle} · ViGet`,
    description: text.gradleDescription,
    alternates: {
      canonical: "https://viget.progmasoft.com/dslplugins/gradle",
    },
    robots: { index: true, follow: true },
  };
}

/** The Gradle catalog: a list only; Gradle downloads the plugins from the Gradle Plugin Portal. */
export default async function GradlePluginsPage() {
  const locale = await getLocale();
  const text = pluginText(locale);
  const catalogs = catalogText(locale);
  return (
    <div className="viget-surface">
      <ViGetHeader locale={locale} />
      <main>
        <section className="viget-plugin-hero">
          <div className="shell viget-plugin-grid">
            <div className="viget-hero-copy">
              <p className="eyebrow">ViGet · BUILD SYSTEM DSL PLUGINS</p>
              <h1>{text.gradleTitle}</h1>
              <p>{text.gradleDescription}</p>
              <div className="hero-actions">
                <a
                  className="button button-secondary"
                  href="https://viget.progmasoft.com/"
                >
                  {catalogs.backToRegistry}
                </a>
                <a
                  className="viget-text-link"
                  href="https://plugins.gradle.org/"
                  rel="noopener"
                >
                  {text.gradlePortal} {forwardArrow(locale)}
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="section" aria-labelledby="gradle-list-title">
          <div className="shell">
            <div className="section-heading">
              <div>
                <h2 id="gradle-list-title" className="viget-catalog-heading">
                  {text.catalogTitle}
                </h2>
              </div>
            </div>
            <div className="viget-catalog-grid">
              {gradlePlugins.map((plugin) => (
                <article key={plugin.id} className="viget-catalog-card">
                  <span>Gradle</span>
                  <h3>{plugin.id}</h3>
                  <small>{plugin.description[locale]}</small>
                  <pre className="viget-snippet">
                    <code>{plugin.usage}</code>
                  </pre>
                  <strong>
                    <a
                      href={`https://plugins.gradle.org/plugin/${plugin.id}`}
                      rel="noopener"
                    >
                      {text.gradlePortal} {forwardArrow(locale)}
                    </a>
                  </strong>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ViGetFooter locale={locale} />
    </div>
  );
}
