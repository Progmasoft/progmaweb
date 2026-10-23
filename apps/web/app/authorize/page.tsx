// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { CredentialsHome } from "@/components/credentials/CredentialsHome";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { siteOrigin } from "@/lib/hosts.server";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).metadata.home };
}

export default async function CredentialsHomePage() {
  const locale = await getLocale();
  const { home } = getCredentialsMessages(locale);
  return (
    <CredentialsShell
      eyebrow={home.eyebrow}
      title={home.title}
      description={home.description}
      locale={locale}
      site="authorize"
    >
      <CredentialsHome
        locale={locale}
        consoleOrigin={await siteOrigin("console")}
      />
    </CredentialsShell>
  );
}
