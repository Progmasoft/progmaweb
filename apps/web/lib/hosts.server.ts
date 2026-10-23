// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import "server-only";
import { headers } from "next/headers";

/** The hosts of Progmasoft OAuth and the account site they link to. */
export type ProgmasoftSite =
  | "authorize"
  | "credentials"
  | "console"
  | "account";

/** The two sites whose pages share the OAuth frame. */
export type OAuthSite = "authorize" | "console";

/**
 * The origin of a sibling host of the current request.
 *
 * authorize.progmasoft.com, credentials.progmasoft.com and
 * console.progmasoft.com link to each other. On a development host
 * (authorize.localhost:3010) the sibling keeps the scheme and the port, so the
 * sites work side by side locally.
 */
export async function siteOrigin(site: ProgmasoftSite): Promise<string> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const [name = "", port] = host.toLowerCase().split(":", 2);
  if (name.endsWith(".localhost")) {
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    return `${protocol}://${site}.localhost${port ? `:${port}` : ""}`;
  }
  return `https://${site}.progmasoft.com`;
}
