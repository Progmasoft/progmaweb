// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getLicenseMessages,
  type LicensePage,
  licensePages,
  pmSplTexts,
} from "@/lib/license-messages";
import type { Locale } from "@/lib/localization";

/** The frame of every page of license.progmasoft.com. */
export function LicenseFrame({
  locale,
  title,
  description,
  current,
  children,
}: Readonly<{
  locale: Locale;
  title: string;
  description: string;
  /** The page of PM-SPL 1.0 being shown, or nothing for the list. */
  current?: LicensePage;
  children: ReactNode;
}>) {
  const text = getLicenseMessages(locale);
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            {current ? <p className="eyebrow">{text.short}</p> : null}
            <h1>{title}</h1>
            <p className="pm-lede">{description}</p>
            {current ? (
              <nav className="pm-license-nav" aria-label={text.short}>
                {licensePages.map((page) => (
                  <a
                    key={page}
                    href={`/pm-spl/1.0/${page}/`}
                    aria-current={page === current ? "page" : undefined}
                  >
                    {text.pages[page]}
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
        </section>
        <section className="pm-section">
          <div className="pm-shell pm-policy">
            {children}
            <p className="pm-license-notice">{text.notice}</p>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}

/** The published texts of PM-SPL 1.0, each with its SHA-256 sums. */
export function LicenseTexts({ locale }: Readonly<{ locale: Locale }>) {
  const text = getLicenseMessages(locale);
  return (
    <ul className="pm-license-texts">
      {pmSplTexts.map(([format, url]) => (
        <li key={format}>
          <a href={url}>{format}</a>
          <a href={`${url}.sha256sums`}>{text.sums}</a>
        </li>
      ))}
    </ul>
  );
}
