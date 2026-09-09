// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AuthForm } from "@/components/AuthForm";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";

export async function generateMetadata(): Promise<Metadata> {
  const { metadata } = getMessages(await getLocale());
  return {
    title: metadata.registerTitle,
    robots: { index: false, follow: false },
  };
}

interface RegisterPageProps {
  searchParams: Promise<{ google?: string }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { google } = await searchParams;
  const locale = await getLocale();
  const { account, auth } = getMessages(locale);
  const googleMessages: Record<string, string> = {
    "account-name-required": auth.googleAccountNameRequired,
    "account-name-unavailable": auth.googleAccountNameUnavailable,
    "invalid-account-name": auth.googleInvalidAccountName,
  };
  const initialMessage = google ? googleMessages[google] : undefined;

  return (
    <AccountShell
      eyebrow={account.registerEyebrow}
      title={account.registerTitle}
      description={account.registerDescription}
      locale={locale}
    >
      <AuthForm
        initialMessage={initialMessage}
        locale={locale}
        mode="register"
      />
    </AccountShell>
  );
}
