// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/** One product on the home page, its words already chosen for the language. */
export interface ShowcaseItem {
  slug: string;
  name: string;
  line: string;
  colour: string;
  more: { label: string; href: string };
}
