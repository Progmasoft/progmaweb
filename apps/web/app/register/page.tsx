// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

interface RegisterPageProps {
  searchParams: Promise<{ google?: string }>;
}

const googleMessages: Record<string, string> = {
  "account-name-required":
    "Choose an Account name before continuing with Google.",
  "account-name-unavailable":
    "That Account name is unavailable. Choose another name.",
  "invalid-account-name":
    "Use a valid Account name before continuing with Google.",
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { google } = await searchParams;
  const initialMessage = google ? googleMessages[google] : undefined;

  return (
    <AccountShell
      eyebrow="Create an identity"
      title="Start with a durable account."
      description="Choose the name used in your Progmasoft account URL."
    >
      <AuthForm initialMessage={initialMessage} mode="register" />
    </AccountShell>
  );
}
