// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";
import type { PolicyMessages } from "./policies";
import { deDE } from "./policies/de-DE";
import { enUS } from "./policies/en-US";
import { frFR } from "./policies/fr-FR";
import { ruRU } from "./policies/ru-RU";

/** The policies in every published language. */
export const policyMessages: Record<Locale, PolicyMessages> = {
  "en-US": enUS,
  "de-DE": deDE,
  "ru-RU": ruRU,
  "fr-FR": frFR,
};

export function getPolicyMessages(locale: Locale): PolicyMessages {
  return policyMessages[locale];
}
