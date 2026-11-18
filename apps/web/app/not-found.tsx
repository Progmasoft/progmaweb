// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";
import "./site.css";

export async function generateMetadata(): Promise<Metadata> {
  const { notFound } = getMessages(await getLocale());
  return { title: notFound.pageTitle, robots: { index: false } };
}

/**
 * What every host of the site shows for an address it has no page for: the
 * header and the footer of the site around one sentence, in the language of
 * the visitor, with the status 404.
 */
export default async function NotFound() {
  const locale = await getLocale();
  const { notFound } = getMessages(locale);
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main className="pm-not-found">
        <div className="pm-shell">
          <h1>{notFound.title}</h1>
          <p>{notFound.text}</p>
        </div>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
