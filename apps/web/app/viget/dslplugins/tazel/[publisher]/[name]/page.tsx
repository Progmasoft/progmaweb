// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViGetFooter } from "@/components/ViGetFooter";
import { ViGetHeader } from "@/components/ViGetHeader";
import { getLocale } from "@/lib/locale.server";
import { forwardArrow } from "@/lib/localization";
import {
  pluginDeclaration,
  pluginText,
  tazelPlugin,
} from "@/lib/viget-plugins";

// A page shows the versions as they are published and yanked.
export const dynamic = "force-dynamic";

type Parameters = { params: Promise<{ publisher: string; name: string }> };

export async function generateMetadata({
  params,
}: Parameters): Promise<Metadata> {
  const { publisher, name } = await params;
  const plugin = await tazelPlugin(publisher, name);
  if (!plugin)
    return { title: "ViGet", robots: { index: false, follow: false } };
  return {
    title: `${plugin.publisher}.${plugin.name} · Tazel DSL plugins · ViGet`,
    description: plugin.description ?? undefined,
    alternates: {
      canonical: `https://viget.progmasoft.com/dslplugins/tazel/${plugin.publisher}/${plugin.name}`,
    },
    robots: { index: true, follow: true },
  };
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KiB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

export default async function TazelPluginPage({ params }: Parameters) {
  const { publisher, name } = await params;
  const plugin = await tazelPlugin(publisher, name);
  if (!plugin) notFound();
  const locale = await getLocale();
  const text = pluginText(locale);
  const dates = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  return (
    <div className="viget-surface">
      <ViGetHeader locale={locale} />
      <main>
        <section className="viget-plugin-hero">
          <div className="shell viget-plugin-grid">
            <div className="viget-hero-copy">
              <p className="eyebrow">ViGet · TAZEL DSL PLUGIN</p>
              <h1>{plugin.name}</h1>
              {plugin.description ? <p>{plugin.description}</p> : null}
              <div className="hero-actions">
                <a
                  className="button button-secondary"
                  href="https://viget.progmasoft.com/dslplugins/tazel"
                >
                  {text.backToCatalog}
                </a>
                {plugin.homepage ? (
                  <a
                    className="viget-text-link"
                    href={plugin.homepage}
                    rel="noopener"
                  >
                    {text.homepage} {forwardArrow(locale)}
                  </a>
                ) : null}
                {plugin.repository ? (
                  <a
                    className="viget-text-link"
                    href={plugin.repository}
                    rel="noopener"
                  >
                    {text.repository} {forwardArrow(locale)}
                  </a>
                ) : null}
              </div>
            </div>
            <aside
              className="viget-availability"
              aria-labelledby="plugin-facts-title"
            >
              <h2 id="plugin-facts-title">
                {plugin.publisher}.{plugin.name}
              </h2>
              <dl>
                <div>
                  <dt>{text.publisherLabel}</dt>
                  <dd>{plugin.publisher}</dd>
                </div>
                <div>
                  <dt>{text.latest}</dt>
                  <dd>{plugin.latestVersion}</dd>
                </div>
                {plugin.license ? (
                  <div>
                    <dt>{text.license}</dt>
                    <dd>{plugin.license}</dd>
                  </div>
                ) : null}
                {plugin.authors.length > 0 ? (
                  <div>
                    <dt>{text.authors}</dt>
                    <dd>{plugin.authors.join(", ")}</dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>
        </section>
        <section className="section" aria-labelledby="plugin-usage-title">
          <div className="shell">
            <div className="section-heading">
              <div>
                <h2 id="plugin-usage-title" className="viget-catalog-heading">
                  {text.usage}
                </h2>
              </div>
              <p>{text.usageDescription}</p>
            </div>
            <pre className="viget-snippet">
              <code>{pluginDeclaration(plugin, plugin.latestVersion)}</code>
            </pre>
          </div>
        </section>
        <section
          className="section section-muted"
          aria-labelledby="plugin-versions-title"
        >
          <div className="shell">
            <div className="section-heading">
              <div>
                <h2
                  id="plugin-versions-title"
                  className="viget-catalog-heading"
                >
                  {text.versions}
                </h2>
              </div>
            </div>
            <div className="viget-table-scroll">
              <table className="viget-versions">
                <thead>
                  <tr>
                    <th scope="col">{text.version}</th>
                    <th scope="col">{text.published}</th>
                    <th scope="col">{text.api}</th>
                    <th scope="col">{text.size}</th>
                    <th scope="col">SHA-256</th>
                    <th scope="col">{text.download}</th>
                  </tr>
                </thead>
                <tbody>
                  {plugin.versions.map((version) => (
                    <tr
                      key={version.version}
                      className={version.yanked ? "viget-yanked" : undefined}
                    >
                      <td>
                        {version.version}
                        {version.yanked ? (
                          <span className="viget-badge">{text.yanked}</span>
                        ) : null}
                      </td>
                      <td>{dates.format(new Date(version.publishedAt))}</td>
                      <td>{version.apiVersion}</td>
                      <td>{formatSize(version.size)}</td>
                      <td>
                        <code title={version.sha256}>
                          {version.sha256.slice(0, 16)}…
                        </code>
                      </td>
                      <td>
                        <a href={`https://viget.progmasoft.com${version.path}`}>
                          {plugin.name}-{version.version}.jar
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <ViGetFooter locale={locale} />
    </div>
  );
}
