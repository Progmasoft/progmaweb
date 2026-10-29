// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { ViGetFooter } from "@/components/ViGetFooter";
import { ViGetHeader } from "@/components/ViGetHeader";
import { getLocale } from "@/lib/locale.server";
import { forwardArrow, getMessages } from "@/lib/localization";
import { catalogText } from "@/lib/viget-catalogs";
import { pluginText, tazelPlugins } from "@/lib/viget-plugins";

// The catalog changes whenever a plugin is published.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { metadata } = getMessages(locale);
  return {
    title: `${catalogText(locale).tazelTitle} · ViGet`,
    description: metadata.dslPluginsDescription,
    alternates: {
      canonical: "https://viget.progmasoft.com/dslplugins/tazel",
    },
    robots: { index: true, follow: true },
  };
}

export default async function TazelPluginsPage() {
  const locale = await getLocale();
  const { viget } = getMessages(locale);
  const catalogs = catalogText(locale);
  const text = pluginText(locale);
  const plugins = await tazelPlugins();
  return (
    <div className="viget-surface">
      <ViGetHeader locale={locale} />
      <main>
        <section className="viget-plugin-hero">
          <div className="shell viget-plugin-grid">
            <div className="viget-hero-copy">
              <p className="eyebrow">ViGet · BUILD SYSTEM DSL PLUGINS</p>
              <h1>{catalogs.tazelTitle}</h1>
              <p>{catalogs.tazelDescription}</p>
              <div className="hero-actions">
                <a
                  className="button button-secondary"
                  href="https://viget.progmasoft.com/"
                >
                  {catalogs.backToRegistry}
                </a>
                <a className="viget-text-link" href="https://tazel.tala.run/">
                  Tazel {forwardArrow(locale)}
                </a>
              </div>
            </div>
            <aside
              className="viget-availability"
              aria-labelledby="plugin-availability-title"
            >
              <div className="viget-status">
                <span aria-hidden="true" />
                {viget.pluginAvailable}
              </div>
              <h2 id="plugin-availability-title">
                {plugins.length > 0
                  ? text.catalogTitle
                  : viget.pluginEmptyTitle}
              </h2>
              <p>
                {plugins.length > 0
                  ? plugins
                      .map((plugin) => `${plugin.publisher}.${plugin.name}`)
                      .join(", ")
                  : viget.pluginEmptyDescription}
              </p>
              <code>/dslplugins/tazel/&lt;Publisher&gt;/&lt;Name&gt;/</code>
            </aside>
          </div>
        </section>
        <section className="section" aria-labelledby="plugin-list-title">
          <div className="shell">
            <div className="section-heading">
              <div>
                <h2 id="plugin-list-title" className="viget-catalog-heading">
                  {text.catalogTitle}
                </h2>
              </div>
            </div>
            {plugins.length === 0 ? (
              <p className="viget-plugin-empty">{text.catalogEmpty}</p>
            ) : (
              <div className="viget-catalog-grid">
                {plugins.map((plugin) => (
                  <a
                    key={`${plugin.publisher}/${plugin.name}`}
                    className="viget-catalog-card viget-catalog-primary"
                    href={`https://viget.progmasoft.com/dslplugins/tazel/${plugin.publisher}/${plugin.name}`}
                  >
                    <span>{plugin.publisher}</span>
                    <h3>{plugin.name}</h3>
                    {plugin.description ? (
                      <small>{plugin.description}</small>
                    ) : null}
                    <strong>
                      {text.latest} {plugin.latestVersion}
                      {plugin.license ? ` · ${plugin.license}` : ""}{" "}
                      {forwardArrow(locale)}
                    </strong>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="section section-muted">
          <div className="shell viget-guidance-grid">
            {viget.guidance.map(([label, title, description]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{title}</strong>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <ViGetFooter locale={locale} />
    </div>
  );
}
