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
    title: metadata.dslPluginsTitle,
    description: metadata.dslPluginsDescription,
    alternates: {
      canonical: "https://viget.progmasoft.com/dslplugins/",
    },
    robots: { index: true, follow: true },
  };
}

export default async function DslPluginsPage() {
  const locale = await getLocale();
  const { viget } = getMessages(locale);
  return (
    <div className="viget-surface">
      <ViGetHeader locale={locale} />
      <main>
        <section className="viget-plugin-hero">
          <div className="shell viget-plugin-grid">
            <div className="viget-hero-copy">
              <p className="eyebrow">{viget.pluginEyebrow}</p>
              <h1>{viget.pluginTitle}</h1>
              <p>{viget.pluginDescription}</p>
              <div className="hero-actions">
                <a
                  className="button button-secondary"
                  href="https://viget.progmasoft.com/"
                >
                  {viget.backToPackages}
                </a>
                <a
                  className="viget-text-link"
                  href="https://github.com/Progmasoft/visual-xsharp"
                >
                  {viget.followDevelopment} →
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
              <h2 id="plugin-availability-title">{viget.pluginEmptyTitle}</h2>
              <p>{viget.pluginEmptyDescription}</p>
              <code>/dslplugins/&lt;Publisher&gt;/&lt;Name&gt;/</code>
            </aside>
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
