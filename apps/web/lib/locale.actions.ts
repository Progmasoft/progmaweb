// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use server";

import { cookies, headers } from "next/headers";
import {
  isLocale,
  localeCookieName,
  localeCookieOptions,
  requestHost,
} from "./localization";

/**
 * Stores the language preference of the visitor.
 *
 * Setting a cookie in a server action makes Next.js render the current route
 * again on the server and apply the result in place, so the language changes
 * without a page load. A value that is not a published locale is ignored: the
 * argument arrives from the browser and is not trusted.
 */
export async function selectLocale(value: string): Promise<void> {
  if (!isLocale(value)) {
    return;
  }
  const requestHeaders = await headers();
  const host = requestHost(
    requestHeaders.get("x-forwarded-host"),
    requestHeaders.get("host"),
  );
  // TLS terminates at Nginx, which reports the public scheme in this header.
  const secure = requestHeaders.get("x-forwarded-proto") === "https";
  (await cookies()).set(
    localeCookieName,
    value,
    localeCookieOptions(host, secure),
  );
}
