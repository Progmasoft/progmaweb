// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { ViGetFooter } from "@/components/ViGetFooter";
import { ViGetHeader } from "@/components/ViGetHeader";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = getMessages(await getLocale());
  return {
    title: metadata.vigetTitle,
    description: metadata.vigetDescription,
    alternates: { canonical: "https://viget.progmasoft.com/" },
    robots: { index: true, follow: true },
  };
}

export default async function ViGetPage() {
  const locale = await getLocale();
  const { viget } = getMessages(locale);
  return (
    <div className="viget-surface">
      <ViGetHeader locale={locale} />
      <main>
        <section className="viget-hero">
          <div className="shell viget-hero-grid">
            <div className="viget-hero-copy">
              <p className="eyebrow">{viget.homeEyebrow}</p>
              <h1>{viget.homeTitle}</h1>
              <p>{viget.homeDescription}</p>
              <div className="hero-actions">
                <a
                  className="button"
                  href="https://account.progmasoft.com/register"
                >
                  {viget.createAccount}
                </a>
                <a
                  className="button button-secondary"
                  href="https://xsharp-lang.xyz/"
                >
                  {viget.exploreVisualXSharp}
                </a>
              </div>
            </div>
            <aside
              className="viget-availability"
              aria-labelledby="viget-availability-title"
            >
              <div className="viget-status">
                <span aria-hidden="true" />
                {viget.available}
              </div>
              <h2 id="viget-availability-title">{viget.emptyTitle}</h2>
              <p>{viget.emptyDescription}</p>
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
            </aside>
          </div>
        </section>

        <section className="section section-muted">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{viget.catalogsEyebrow}</p>
                <h2>{viget.catalogsTitle}</h2>
              </div>
              <p>{viget.catalogsDescription}</p>
            </div>
            <div className="viget-catalog-grid">
              <article className="viget-catalog-card viget-catalog-primary">
                <span>01</span>
                <p>{viget.visualPackages}</p>
                <h3>{viget.vipkgCatalog}</h3>
                <code>
                  viget.progmasoft.com/&lt;Publisher&gt;/&lt;Name&gt;/
                </code>
                <small>{viget.vipkgDescription}</small>
              </article>
              <a
                className="viget-catalog-card"
                href="https://viget.progmasoft.com/dslplugins/"
              >
                <span>02</span>
                <p>{viget.projectExtensions}</p>
                <h3>{viget.kotlinPlugins}</h3>
                <code>
                  viget.progmasoft.com/dslplugins/&lt;Publisher&gt;/&lt;Name&gt;/
                </code>
                <small>{viget.kotlinDescription}</small>
                <strong>{viget.openCatalog} →</strong>
              </a>
            </div>
          </div>
        </section>

        <section className="section viget-contract">
          <div className="shell viget-contract-grid">
            <div>
              <p className="eyebrow">{viget.contractEyebrow}</p>
              <h2>{viget.contractTitle}</h2>
            </div>
            <ol>
              {viget.principles.map(([title, description], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <ViGetFooter locale={locale} />
    </div>
  );
}
