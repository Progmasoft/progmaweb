// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/AccountShell";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = getMessages(await getLocale());
  return {
    title: metadata.recoveryTitle,
    description: metadata.recoveryDescription,
    robots: { index: false, follow: false },
  };
}

export default async function RecoverPage() {
  const locale = await getLocale();
  const { account } = getMessages(locale);
  return (
    <AccountShell
      eyebrow={account.recoveryEyebrow}
      title={account.recoveryTitle}
      description={account.recoveryDescription}
      locale={locale}
    >
      <section
        className="auth-form recovery-panel"
        aria-labelledby="recovery-heading"
      >
        <div className="form-heading">
          <p className="eyebrow">{account.recoveryPanelEyebrow}</p>
          <h2 id="recovery-heading">{account.recoveryPanelTitle}</h2>
          <p>{account.recoveryPanelDescription}</p>
        </div>
        <a
          className="button auth-submit"
          href={`mailto:support@progmasoft.com?subject=${encodeURIComponent(account.recoveryEmailSubject)}`}
        >
          {account.contactSupport}
        </a>
        <p className="form-switch">
          {account.rememberedPassword}{" "}
          <Link href="/login">{account.returnToSignIn}</Link>
        </p>
      </section>
    </AccountShell>
  );
}
