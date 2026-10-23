// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { TokenList } from "@/components/credentials/TokenList";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).metadata.portal };
}

export default async function DevelopersPage() {
  const locale = await getLocale();
  const { portal } = getCredentialsMessages(locale);
  return (
    <CredentialsShell
      eyebrow={portal.eyebrow}
      title={portal.title}
      description={portal.description}
      locale={locale}
      site="console"
    >
      <TokenList locale={locale} />
    </CredentialsShell>
  );
}
