// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import "server-only";
import { cookies } from "next/headers";
import { isLocale, type Locale } from "./localization";

export const localeCookieName = "progmasoft_locale";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(localeCookieName)?.value;
  return isLocale(value) ? value : "en-US";
}
