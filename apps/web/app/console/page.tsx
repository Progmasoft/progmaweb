// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { siteOrigin } from "@/lib/hosts.server";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).overview.eyebrow };
}

/**
 * The overview of the Progmasoft Console. OAuth 2.1 credentials are one area
 * of it, under /credentials; later Progmasoft services get areas of their own.
 */
export default async function ConsoleOverviewPage() {
  const locale = await getLocale();
  const { overview, common } = getCredentialsMessages(locale);
  const authorize = await siteOrigin("authorize");
  return (
    <CredentialsShell
      eyebrow={overview.eyebrow}
      title={overview.title}
      description={overview.description}
      locale={locale}
      site="console"
    >
      <ul className="kind-list">
        <li>
          <a href="/credentials">
            <strong>{common.developers}</strong>
            <span>{overview.credentialsText}</span>
          </a>
        </li>
        <li>
          <a href={`${authorize}/account/applications`}>
            <strong>{common.allowedApplications}</strong>
            <span>{overview.allowedText}</span>
          </a>
        </li>
        <li>
          <a href="https://github.com/Progmasoft/progmaweb/blob/main/docs/OAUTH.md">
            <strong>{overview.docs}</strong>
            <span>{overview.docsText}</span>
          </a>
        </li>
      </ul>
    </CredentialsShell>
  );
}
