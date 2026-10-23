// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { applicationKinds } from "@/lib/credentials";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).metadata.newToken };
}

/** The first step of a new token: the type of the application. */
export default async function NewTokenPage() {
  const locale = await getLocale();
  const { kinds, portal, common } = getCredentialsMessages(locale);
  return (
    <CredentialsShell
      eyebrow={portal.eyebrow}
      title={kinds.chooseTitle}
      description={kinds.chooseDescription}
      locale={locale}
      site="console"
    >
      <h2 className="credentials-note">{kinds.label}</h2>
      <ul className="kind-list">
        {applicationKinds.map((kind) => (
          <li key={kind}>
            <a href={`/credentials/new/${kind}`}>
              <strong>{kinds[kind].title}</strong>
              <span>{kinds[kind].description}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="credentials-footnote">
        <a href="/credentials">{common.back}</a>
      </p>
    </CredentialsShell>
  );
}
