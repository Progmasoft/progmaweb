// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { ApplicationDetails } from "@/components/credentials/ApplicationDetails";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: getCredentialsMessages(await getLocale()).metadata.application,
  };
}

interface ApplicationPageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ApplicationPage({
  params,
}: ApplicationPageProps) {
  const { clientId } = await params;
  const locale = await getLocale();
  const { portal, metadata, common } = getCredentialsMessages(locale);
  return (
    <CredentialsShell
      eyebrow={portal.title}
      title={metadata.application}
      locale={locale}
      site="console"
    >
      <ApplicationDetails
        locale={locale}
        clientId={decodeURIComponent(clientId)}
      />
      <p className="credentials-footnote">
        <a href="/credentials">{common.back}</a>
      </p>
    </CredentialsShell>
  );
}
