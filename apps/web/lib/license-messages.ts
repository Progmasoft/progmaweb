// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";
import type { LicenseMessages } from "./licenses.ts";
import { deDE } from "./licenses/de-DE.ts";
import { enUS } from "./licenses/en-US.ts";
import { frFR } from "./licenses/fr-FR.ts";
import { ruRU } from "./licenses/ru-RU.ts";

export {
  type LicenseCategory,
  type LicenseMessages,
  type LicensePage,
  type LicenseSection,
  licensePageDescription,
  licensePages,
  licensePageTitle,
  pmSplIdentifiers,
  pmSplTexts,
} from "./licenses.ts";

/** The license pages in every published language. */
export const licenseMessages: Record<Locale, LicenseMessages> = {
  "en-US": enUS,
  "de-DE": deDE,
  "ru-RU": ruRU,
  "fr-FR": frFR,
};

export function getLicenseMessages(locale: Locale): LicenseMessages {
  return licenseMessages[locale];
}
