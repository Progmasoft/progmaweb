// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";
import {
  type PolicyMessages,
  type PolicyVersion,
  policyVersion,
} from "./policies";
import { deDE } from "./policies/de-DE";
import { enUS } from "./policies/en-US";
import { frFR } from "./policies/fr-FR";
import { ruRU } from "./policies/ru-RU";
import { deDE as deDE20261106 } from "./policies/v2026-11-06/de-DE";
import { enUS as enUS20261106 } from "./policies/v2026-11-06/en-US";
import { frFR as frFR20261106 } from "./policies/v2026-11-06/fr-FR";
import { ruRU as ruRU20261106 } from "./policies/v2026-11-06/ru-RU";

/** Every published version of the policies in every published language. */
export const policyMessagesByVersion: Record<
  PolicyVersion,
  Record<Locale, PolicyMessages>
> = {
  "2026-11-06": {
    "en-US": enUS20261106,
    "de-DE": deDE20261106,
    "ru-RU": ruRU20261106,
    "fr-FR": frFR20261106,
  },
  "2026-12-06": {
    "en-US": enUS,
    "de-DE": deDE,
    "ru-RU": ruRU,
    "fr-FR": frFR,
  },
};

/** The newest version in every published language. */
export const policyMessages: Record<Locale, PolicyMessages> =
  policyMessagesByVersion[policyVersion];

export function getPolicyMessages(
  locale: Locale,
  version: PolicyVersion = policyVersion,
): PolicyMessages {
  return policyMessagesByVersion[version][locale];
}
