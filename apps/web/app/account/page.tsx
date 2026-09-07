// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";

export const metadata: Metadata = {
  title: "Account",
  description: "Access and manage your Progmasoft account.",
  robots: { index: false, follow: false },
};

export default async function AccountHomepage() {
  const locale = await getLocale();
  const { account, navigation } = getMessages(locale);
  return (
    <>
      <SiteHeader account locale={locale} />
      <main className="account-landing">
        <section className="account-landing-hero">
          <div className="shell account-landing-grid">
            <div>
              <p className="eyebrow">{account.landingEyebrow}</p>
              <h1>{account.landingTitle}</h1>
              <p>{account.landingDescription}</p>
              <div className="hero-actions">
                <Link className="button" href="/login">
                  {navigation.signIn}
                </Link>
                <Link className="button button-secondary" href="/register">
                  {navigation.createAccount}
                </Link>
              </div>
            </div>
            <div className="identity-card">
              <div className="identity-icon" aria-hidden="true">
                P
              </div>
              {account.identity.map(([label, description]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{description}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="shell feature-grid">
            {account.features.map(([title, description], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{title}</h2>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
