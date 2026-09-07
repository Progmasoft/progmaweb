// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import Link from "next/link";
import { getMessages, type Locale } from "@/lib/localization";
import { Brand } from "./Brand";
import { PreferenceControls } from "./PreferenceControls";

interface SiteHeaderProps {
  account?: boolean;
  locale: Locale;
  signedInName?: string;
}

export function SiteHeader({
  account = false,
  locale,
  signedInName,
}: SiteHeaderProps) {
  const { navigation } = getMessages(locale);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand account={account} />
        <nav className="primary-nav" aria-label={navigation.primary}>
          {account ? (
            <>
              <Link href="https://progmasoft.com/">{navigation.company}</Link>
              {signedInName ? (
                <Link
                  className="button button-small"
                  href={`/${signedInName}/dashboard`}
                >
                  {navigation.dashboard}
                </Link>
              ) : (
                <>
                  <Link href="/login">{navigation.signIn}</Link>
                  <Link className="button button-small" href="/register">
                    {navigation.createAccount}
                  </Link>
                </>
              )}
            </>
          ) : (
            <>
              <a href="#products">{navigation.products}</a>
              <a href="#principles">{navigation.principles}</a>
              <a href="https://github.com/Progmasoft">GitHub</a>
              <Link
                className="button button-small"
                href="https://account.progmasoft.com/"
              >
                {navigation.account}
              </Link>
            </>
          )}
          <PreferenceControls locale={locale} labels={navigation} />
        </nav>
      </div>
    </header>
  );
}
