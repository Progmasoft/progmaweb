// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { localeCookieName } from "./localization.ts";
import { themeCookieName } from "./theme.ts";

/** The cookies every host of Progmasoft shares through the registrable domain. */
const sharedCookies = [localeCookieName, themeCookieName];

/**
 * Expires the cookies of this host alone that bear the name of a shared
 * cookie. A request with two cookies of one name has a host cookie left over
 * from before the cookie was shared; without it the shared one holds.
 */
export function expireShadowingCookies(
  cookieHeader: string,
  secure: boolean,
): string[] {
  const names = cookieHeader
    .split(";")
    .map((part) => part.trim().split("=", 1)[0] ?? "");
  return sharedCookies
    .filter((name) => names.filter((found) => found === name).length > 1)
    .map(
      (name) =>
        `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure ? "; Secure" : ""}`,
    );
}
