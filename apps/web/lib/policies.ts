// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

/**
 * Every published version of the policies, oldest first. A version is the
 * date it takes effect, at midnight UTC.
 */
export const policyVersions = ["2026-11-06", "2026-12-06"] as const;

/** One published version. */
export type PolicyVersion = (typeof policyVersions)[number];

/**
 * The newest version. Registration sends the acceptance of it from the day it
 * is published, and the account API keeps the same value
 * (PolicyAcceptance.CurrentVersion); the two change together. Account holders
 * who accepted an earlier one are told before it takes effect.
 */
export const policyVersion: PolicyVersion = "2026-12-06";

/** Whether a text names a published version. */
export function isPolicyVersion(text: string): text is PolicyVersion {
  return (policyVersions as readonly string[]).includes(text);
}

/** The version in effect at a moment: the newest that has taken effect. */
export function policyInEffect(now: Date): PolicyVersion {
  const today = now.toISOString().slice(0, 10);
  let inEffect: PolicyVersion = policyVersions[0];
  for (const version of policyVersions) {
    if (version <= today) {
      inEffect = version;
    }
  }
  return inEffect;
}

/** The version published after one, if any. */
export function policyAfter(version: PolicyVersion): PolicyVersion | undefined {
  return policyVersions[policyVersions.indexOf(version) + 1];
}

/** The words around a version that is not, or not yet, in effect. */
export interface PolicyVersionWords {
  /** Before the date of the next version. */
  upcoming: string;
  /** The link to it. */
  readIt: string;
  /** On a version that has not taken effect yet, before its date. */
  notYet: string;
  /** The link to the version in effect. */
  inEffect: string;
}

/** Those words in every published language. */
export const policyVersionWords: Record<Locale, PolicyVersionWords> = {
  "en-US": {
    upcoming: "A new version takes effect on",
    readIt: "Read it",
    notYet: "This version takes effect on",
    inEffect: "The version in effect until then",
  },
  "de-DE": {
    upcoming: "Eine neue Fassung tritt in Kraft am",
    readIt: "Lesen",
    notYet: "Diese Fassung tritt in Kraft am",
    inEffect: "Die bis dahin geltende Fassung",
  },
  "ru-RU": {
    upcoming: "Новая редакция вступает в силу",
    readIt: "Прочитать",
    notYet: "Эта редакция вступает в силу",
    inEffect: "Редакция, действующая до тех пор",
  },
  "fr-FR": {
    upcoming: "Une nouvelle version entre en vigueur le",
    readIt: "La lire",
    notYet: "Cette version entre en vigueur le",
    inEffect: "La version en vigueur d’ici là",
  },
};

/** The two policies a new account accepts. */
export type PolicyKind = "privacy" | "security";

/** The canonical addresses of the policies. */
export const policyUrls: Record<PolicyKind, string> = {
  privacy: "https://progmasoft.com/privacy",
  security: "https://progmasoft.com/security",
};

/** One part of a policy: a heading and its paragraphs. */
export interface PolicySection {
  heading: string;
  paragraphs: string[];
}

/** The text of one policy. */
export interface PolicyText {
  title: string;
  description: string;
  sections: PolicySection[];
}

/** Both policies in one language, with the words around them. */
export interface PolicyMessages {
  /** Shown before the date of the version. */
  versionLabel: string;
  /** The date of the version, written for the language. */
  versionDate: string;
  /** The link from one policy to the other. */
  seeAlso: string;
  privacy: PolicyText;
  security: PolicyText;
}
