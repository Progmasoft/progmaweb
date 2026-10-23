// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import Link from "next/link";
import { getHomeMessages } from "@/lib/home-messages";
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
  const site = getHomeMessages(locale).navigation;
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand account={account} accountLabel={navigation.account} />
        <nav className="primary-nav" aria-label={navigation.primary}>
          {account ? (
            <>
              <Link href="https://progmasoft.com/">
                {navigation.organization}
              </Link>
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
              <a href="https://progmasoft.com/#technology">{site.technology}</a>
              <a href="https://product.progmasoft.com/">{site.products}</a>
              <a href="https://console.progmasoft.com/">{site.developers}</a>
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
