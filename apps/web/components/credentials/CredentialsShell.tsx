// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { ReactNode } from "react";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { siteOrigin, type OAuthSite } from "@/lib/hosts.server";
import { getMessages, type Locale } from "@/lib/localization";
import { Brand } from "../Brand";
import { PreferenceControls } from "../PreferenceControls";

interface CredentialsShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
  locale: Locale;
  /** authorize.progmasoft.com (sign-in, consent) or console.progmasoft.com (tokens). */
  site: OAuthSite;
  /**
   * `split` puts the introduction beside a panel, as the account sign-in
   * does; `column` stacks a heading above the content of a console page.
   */
  layout?: "split" | "column";
}

/**
 * The frame of every page of Progmasoft OAuth and the Progmasoft Console. Its
 * addresses are the public ones of each host; the proxy maps them to the
 * internal `/authorize`, `/issuer` and `/console` trees.
 */
export async function CredentialsShell({
  children,
  eyebrow,
  title,
  description,
  locale,
  site,
  layout = "column",
}: CredentialsShellProps) {
  const { navigation } = getMessages(locale);
  const { common } = getCredentialsMessages(locale);
  const authorizeOrigin =
    site === "authorize" ? "" : await siteOrigin("authorize");
  const consoleOrigin = site === "console" ? "" : await siteOrigin("console");
  const heading = (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </>
  );
  return (
    <div className="account-page">
      <header className="site-header">
        <div className="shell header-inner">
          <Brand
            account
            accountLabel={site === "console" ? common.console : "OAuth"}
            home="/"
          />
          <nav className="primary-nav" aria-label={navigation.primary}>
            <a href="https://progmasoft.com/">{common.organization}</a>
            <a href={`${authorizeOrigin}/account/applications`}>
              {common.allowedApplications}
            </a>
            <a
              className="button button-small"
              href={`${consoleOrigin}/credentials`}
            >
              {common.developers}
            </a>
            <PreferenceControls locale={locale} labels={navigation} />
          </nav>
        </div>
      </header>
      {layout === "split" ? (
        <main className="account-main">
          <section className="account-intro">{heading}</section>
          <section className="account-panel">{children}</section>
        </main>
      ) : (
        <main className="credentials-main">
          <section className="credentials-heading">{heading}</section>
          <div>{children}</div>
        </main>
      )}
    </div>
  );
}
