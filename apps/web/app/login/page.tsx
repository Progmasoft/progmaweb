// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AuthForm } from "@/components/AuthForm";
import { getLocale } from "@/lib/locale.server";
import { getMessages } from "@/lib/localization";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ google?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { google } = await searchParams;
  const locale = await getLocale();
  const { account } = getMessages(locale);
  const initialMessage =
    google === "failed"
      ? "Google sign-in could not be completed. Try again."
      : undefined;

  return (
    <AccountShell
      eyebrow={account.loginEyebrow}
      title={account.loginTitle}
      description={account.loginDescription}
      locale={locale}
    >
      <AuthForm initialMessage={initialMessage} locale={locale} mode="login" />
    </AccountShell>
  );
}
