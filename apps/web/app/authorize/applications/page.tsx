// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { AllowedApplications } from "@/components/credentials/AllowedApplications";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).metadata.allowed };
}

export default async function AllowedApplicationsPage() {
  const locale = await getLocale();
  const { allowed } = getCredentialsMessages(locale);
  return (
    <CredentialsShell
      eyebrow={allowed.eyebrow}
      title={allowed.title}
      description={allowed.description}
      locale={locale}
      site="authorize"
    >
      <AllowedApplications locale={locale} />
    </CredentialsShell>
  );
}
