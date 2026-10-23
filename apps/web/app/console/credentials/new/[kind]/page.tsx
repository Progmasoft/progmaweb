// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { NewToken } from "@/components/credentials/NewToken";
import { isApplicationKind } from "@/lib/credentials";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).metadata.newToken };
}

interface NewTokenFormPageProps {
  params: Promise<{ kind: string }>;
}

/** The second step of a new token: the form of the chosen type. */
export default async function NewTokenFormPage({
  params,
}: NewTokenFormPageProps) {
  const { kind } = await params;
  if (!isApplicationKind(kind)) {
    notFound();
  }
  const locale = await getLocale();
  const { kinds, portal, common } = getCredentialsMessages(locale);
  return (
    <CredentialsShell
      eyebrow={`${portal.newToken} · ${kinds[kind].title}`}
      title={kinds[kind].title}
      description={kinds[kind].description}
      locale={locale}
      site="console"
    >
      <NewToken locale={locale} kind={kind} />
      <p className="credentials-footnote">
        <a href="/credentials/new">{common.back}</a>
      </p>
    </CredentialsShell>
  );
}
