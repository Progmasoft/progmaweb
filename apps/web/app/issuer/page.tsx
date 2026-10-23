// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { siteOrigin } from "@/lib/hosts.server";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).metadata.home };
}

/**
 * credentials.progmasoft.com: the issuer, whose discovery document names every
 * endpoint. People sign in on authorize.progmasoft.com and developers make
 * tokens on console.progmasoft.com.
 */
export default async function IssuerPage() {
  const locale = await getLocale();
  const { home, common } = getCredentialsMessages(locale);
  const consoleOrigin = await siteOrigin("console");
  const authorizeOrigin = await siteOrigin("authorize");
  return (
    <CredentialsShell
      eyebrow={home.eyebrow}
      title={home.title}
      description={home.description}
      locale={locale}
      site="authorize"
    >
      <ul className="kind-list">
        <li>
          <a href="/.well-known/openid-configuration">
            <strong>{home.discovery}</strong>
            <span>/.well-known/openid-configuration</span>
          </a>
        </li>
        <li>
          <a href={`${consoleOrigin}/credentials`}>
            <strong>{common.developers}</strong>
            <span>{home.developersText}</span>
          </a>
        </li>
        <li>
          <a href={`${authorizeOrigin}/account/applications`}>
            <strong>{common.allowedApplications}</strong>
            <span>{home.allowedText}</span>
          </a>
        </li>
      </ul>
    </CredentialsShell>
  );
}
