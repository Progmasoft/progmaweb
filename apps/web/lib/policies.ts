// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

/**
 * The version of the policies, the date they took effect. Registration sends
 * the acceptance of this version, and the account API keeps the same value
 * (PolicyAcceptance.CurrentVersion); the two change together.
 */
export const policyVersion = "2026-11-06";

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
