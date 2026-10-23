// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { SignInForm } from "@/components/credentials/SignInForm";
import { localReturnUrl } from "@/lib/credentials";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).metadata.signIn };
}

interface SignInPageProps {
  // The cookie handler of the API names the parameter ReturnUrl.
  searchParams: Promise<{ ReturnUrl?: string; returnUrl?: string }>;
}

export default async function CredentialsSignInPage({
  searchParams,
}: SignInPageProps) {
  const { ReturnUrl, returnUrl } = await searchParams;
  const locale = await getLocale();
  const { signIn } = getCredentialsMessages(locale);
  return (
    <CredentialsShell
      eyebrow={signIn.eyebrow}
      title={signIn.title}
      description={signIn.description}
      locale={locale}
      site="authorize"
      layout="split"
    >
      <SignInForm
        locale={locale}
        returnUrl={localReturnUrl(ReturnUrl ?? returnUrl)}
      />
    </CredentialsShell>
  );
}
