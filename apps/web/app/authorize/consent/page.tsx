// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { ConsentPanel } from "@/components/credentials/ConsentPanel";
import { CredentialsShell } from "@/components/credentials/CredentialsShell";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { getLocale } from "@/lib/locale.server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getCredentialsMessages(await getLocale()).metadata.consent };
}

interface ConsentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CredentialsConsentPage({
  searchParams,
}: ConsentPageProps) {
  const query = await searchParams;
  // Every parameter of the authorization request goes back to
  // /connect/authorize with the decision, where OpenIddict checks it again.
  const parameters: [string, string][] = Object.entries(query).flatMap(
    ([name, value]) =>
      (Array.isArray(value) ? value : value === undefined ? [] : [value]).map(
        (entry): [string, string] => [name, entry],
      ),
  );
  const locale = await getLocale();
  const { consent } = getCredentialsMessages(locale);
  return (
    <CredentialsShell
      eyebrow={consent.eyebrow}
      title={getCredentialsMessages(locale).metadata.consent}
      locale={locale}
      site="authorize"
      layout="split"
    >
      <ConsentPanel locale={locale} parameters={parameters} />
    </CredentialsShell>
  );
}
