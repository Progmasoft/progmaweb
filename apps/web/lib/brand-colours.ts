// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ProductFacts } from "./products";

type Accent = ProductFacts["accent"];

/** Four colours of a moving field, from the deepest to the lightest. */
export type FieldColours = [string, string, string, string];

/** The colour of each accent of the catalog. */
export const accentColours: Record<Accent, string> = {
  violet: "#7655fa",
  blue: "#0066b8",
  green: "#1f8a5b",
  orange: "#dc7644",
  teal: "#1e7188",
  slate: "#3b4658",
};

/** The moving field of each accent: its colour, deep to light. */
export const accentFields: Record<Accent, FieldColours> = {
  orange: ["#3a1a0c", "#b4572a", "#e8a070", "#f3e3cf"],
  green: ["#0d2a1e", "#1f8a5b", "#8fd1ad", "#eef0e2"],
  slate: ["#14233a", "#3b4658", "#9aa7bd", "#e9e4d8"],
  violet: ["#1d1446", "#7655fa", "#c4b6ff", "#f1ece2"],
  blue: ["#0a1f3d", "#0066b8", "#8cc0ec", "#eef1ee"],
  teal: ["#0f3440", "#1e7188", "#7fb8c4", "#efe9dc"],
};
