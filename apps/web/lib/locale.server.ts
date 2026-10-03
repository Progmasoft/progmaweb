// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import "server-only";
import { cookies, headers } from "next/headers";
import {
  isLocale,
  localeCookieName,
  negotiateLocale,
  type Locale,
} from "./localization";

export { localeCookieName };

/**
 * The language of the current request.
 *
 * A language the visitor chose is stored in a cookie and always wins. Without
 * that choice the page follows the language preference of the browser.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(localeCookieName)?.value;
  if (isLocale(value)) {
    return value;
  }
  return negotiateLocale((await headers()).get("accept-language"));
}
