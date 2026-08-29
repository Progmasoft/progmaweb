// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";

interface AccountShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export function AccountShell({
  children,
  eyebrow,
  title,
  description,
}: AccountShellProps) {
  return (
    <div className="account-page">
      <SiteHeader account />
      <main className="account-main">
        <section className="account-intro">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <div
            className="account-trust"
            aria-label="Account security properties"
          >
            <span>Secure session cookie</span>
            <span>Server-side password hashing</span>
            <span>Rate-limited authentication</span>
          </div>
        </section>
        <section className="account-panel">{children}</section>
      </main>
    </div>
  );
}
