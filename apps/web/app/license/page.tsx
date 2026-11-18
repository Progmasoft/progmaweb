// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { getLocale } from "@/lib/locale.server";
import {
  getLicenseMessages,
  licensePages,
  licensePageTitle,
  pmSplIdentifiers,
} from "@/lib/license-messages";
import { LicenseFrame, LicenseTexts } from "./LicenseFrame";

export async function generateMetadata(): Promise<Metadata> {
  const text = getLicenseMessages(await getLocale());
  return {
    title: text.metadataTitle,
    description: text.metadataDescription,
    alternates: { canonical: "https://license.progmasoft.com/" },
  };
}

/** license.progmasoft.com: the licenses Progmasoft wrote. */
export default async function LicensesPage() {
  const locale = await getLocale();
  const text = getLicenseMessages(locale);
  return (
    <LicenseFrame
      locale={locale}
      title={text.index.title}
      description={text.index.description}
    >
      <section>
        <h2>{text.name}</h2>
        <p>{text.index.pmSpl}</p>
        <p className="pm-license-ids">
          {text.identifiers}{" "}
          {pmSplIdentifiers.map((id, index) => (
            <span key={id}>
              {index > 0 ? ", " : null}
              <code>{id}</code>
            </span>
          ))}
        </p>
        <nav className="pm-license-nav" aria-label={text.short}>
          {licensePages.map((page) => (
            <a key={page} href={`/pm-spl/1.0/${page}/`}>
              {licensePageTitle(text, page)}
            </a>
          ))}
        </nav>
      </section>
      <section>
        <h2>{text.texts}</h2>
        <LicenseTexts locale={locale} />
      </section>
    </LicenseFrame>
  );
}
