// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/** Where the published texts of PM-SPL 1.0 are, each beside its .sha256sums. */
export const pmSplTexts = [
  ["TXT", "https://storage.progmasoft.com/pm-spl/1.0/LICENSE-1.0.txt"],
  ["Markdown", "https://storage.progmasoft.com/pm-spl/1.0/LICENSE-1.0.md"],
  [
    "reStructuredText",
    "https://storage.progmasoft.com/pm-spl/1.0/LICENSE-1.0.rst",
  ],
] as const;

/** The pages of PM-SPL 1.0 on license.progmasoft.com. */
export const licensePages = ["information", "faq", "categories"] as const;
export type LicensePage = (typeof licensePages)[number];

/** The SPDX identifiers of PM-SPL 1.0. */
export const pmSplIdentifiers = [
  "LicenseRef-PM-SPL-1.0-only",
  "LicenseRef-PM-SPL-1.0-or-later",
] as const;

/** One part of a page: a heading and its paragraphs. */
export interface LicenseSection {
  heading: string;
  paragraphs: string[];
}

/** One category of third-party licenses, with examples and their SPDX identifiers. */
export interface LicenseCategory {
  letter: "A" | "B" | "X";
  name: string;
  rule: string;
  examples: [name: string, spdx: string][];
}

export interface LicenseMessages {
  metadataTitle: string;
  metadataDescription: string;
  name: string;
  short: string;
  /** Said on every page: the text of the license is what applies. */
  notice: string;
  pages: Record<LicensePage, string>;
  texts: string;
  sums: string;
  identifiers: string;
  index: { title: string; description: string; pmSpl: string };
  information: { description: string; sections: LicenseSection[] };
  faq: { description: string; questions: [string, string][] };
  categories: {
    description: string;
    intro: string;
    category: string;
    license: string;
    identifier: string;
    items: LicenseCategory[];
  };
}

export const examplesA: [string, string][] = [
  ["MIT License", "MIT"],
  ["MIT No Attribution", "MIT-0"],
  ['BSD 2-Clause "Simplified" License', "BSD-2-Clause"],
  ['BSD 3-Clause "New" or "Revised" License', "BSD-3-Clause"],
  ["Apache License 2.0", "Apache-2.0"],
  ["ISC License", "ISC"],
  ["zlib License", "Zlib"],
  ["Boost Software License 1.0", "BSL-1.0"],
  ["Unicode License v3", "Unicode-3.0"],
];
export const examplesB: [string, string][] = [
  ["GNU Lesser General Public License v2.1 or later", "LGPL-2.1-or-later"],
  ["GNU Lesser General Public License v3.0 or later", "LGPL-3.0-or-later"],
  ["Mozilla Public License 2.0", "MPL-2.0"],
  ["Eclipse Public License 2.0", "EPL-2.0"],
  ["Common Development and Distribution License 1.0", "CDDL-1.0"],
];
export const examplesX: [string, string][] = [
  ["GNU General Public License v2.0 only", "GPL-2.0-only"],
  ["GNU General Public License v3.0 or later", "GPL-3.0-or-later"],
  ["GNU Affero General Public License v3.0 or later", "AGPL-3.0-or-later"],
  ["Server Side Public License v1", "SSPL-1.0"],
];

/** The title of one page of PM-SPL 1.0, as its navigation names it. */
export function licensePageTitle(
  text: LicenseMessages,
  page: LicensePage,
): string {
  switch (page) {
    case "information":
      return text.pages.information;
    case "faq":
      return text.pages.faq;
    case "categories":
      return text.pages.categories;
  }
}

/** The description of one page of PM-SPL 1.0. */
export function licensePageDescription(
  text: LicenseMessages,
  page: LicensePage,
): string {
  switch (page) {
    case "information":
      return text.information.description;
    case "faq":
      return text.faq.description;
    case "categories":
      return text.categories.description;
  }
}
