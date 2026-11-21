// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { getMcpMessages } from "@/lib/mcp-messages";
import "../site.css";

export async function generateMetadata(): Promise<Metadata> {
  const text = getMcpMessages(await getLocale());
  return {
    title: text.metadataTitle,
    description: text.metadataDescription,
    alternates: { canonical: "https://agencelandmcp.progmasoft.com/" },
  };
}

/** agencelandmcp.progmasoft.com: the Agenceland MCP Marketplace, empty and closed to uploads. */
export default async function McpMarketplacePage() {
  const locale = await getLocale();
  const text = getMcpMessages(locale);
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            <p className="eyebrow">{text.eyebrow}</p>
            <h1>{text.title}</h1>
            <p className="pm-lede">{text.description}</p>
          </div>
        </section>
        <section className="pm-section">
          <div className="pm-shell pm-policy">
            <section aria-labelledby="mcp-servers">
              <h2 id="mcp-servers">{text.serversHeading}</h2>
              <p>{text.noServers}</p>
            </section>
            <section aria-labelledby="mcp-publishing">
              <h2 id="mcp-publishing">{text.uploadsHeading}</h2>
              <p>{text.uploadsClosed}</p>
            </section>
            <section aria-labelledby="mcp-installing">
              <h2 id="mcp-installing">{text.installHeading}</h2>
              <p>{text.install}</p>
            </section>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
