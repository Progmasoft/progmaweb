// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { headers } from "next/headers";
import { nonceHeader } from "@/lib/content-security-policy";
import { jsonLd } from "@/lib/structured-data";

/**
 * schema.org data of a page as a JSON-LD script element. Browsers do not run
 * it; it carries the nonce of the page all the same, as every script element
 * of the site does.
 */
export async function JsonLd({ data }: { data: unknown }) {
  const nonce = (await headers()).get(nonceHeader) ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
