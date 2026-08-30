// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

import type { Metadata } from "next";
import { AccountShell } from "@/components/AccountShell";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ google?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { google } = await searchParams;
  const initialMessage =
    google === "failed"
      ? "Google sign-in could not be completed. Try again."
      : undefined;

  return (
    <AccountShell
      eyebrow="Progmasoft account"
      title="Sign in securely."
      description="Continue to your account dashboard and connected services."
    >
      <AuthForm initialMessage={initialMessage} mode="login" />
    </AccountShell>
  );
}
