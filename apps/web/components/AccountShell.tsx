// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { ReactNode } from "react";
import { getMessages, type Locale } from "@/lib/localization";
import { SiteHeader } from "./SiteHeader";

interface AccountShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  locale: Locale;
}

export function AccountShell({
  children,
  eyebrow,
  title,
  description,
  locale,
}: AccountShellProps) {
  const { account } = getMessages(locale);
  return (
    <div className="account-page">
      <SiteHeader account locale={locale} />
      <main className="account-main">
        <section className="account-intro">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="account-trust" aria-label={account.securityLabel}>
            {account.trust.map((property) => (
              <span key={property}>{property}</span>
            ))}
          </div>
        </section>
        <section className="account-panel">{children}</section>
      </main>
    </div>
  );
}
