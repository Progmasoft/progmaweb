// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ProductFacts } from "./products";

type Accent = ProductFacts["accent"];

/** Four colours of a moving field, from the deepest to the lightest. */
export type FieldColours = [string, string, string, string];

/** The colour of an accent of the catalog. */
export function accentColour(accent: Accent): string {
  switch (accent) {
    case "violet":
      return "#7655fa";
    case "blue":
      return "#0066b8";
    case "green":
      return "#1f8a5b";
    case "orange":
      return "#dc7644";
    case "teal":
      return "#1e7188";
    case "slate":
      return "#3b4658";
  }
}

/** The moving field of an accent: its colour, deep to light. */
export function accentField(accent: Accent): FieldColours {
  switch (accent) {
    case "orange":
      return ["#3a1a0c", "#b4572a", "#e8a070", "#f3e3cf"];
    case "green":
      return ["#0d2a1e", "#1f8a5b", "#8fd1ad", "#eef0e2"];
    case "slate":
      return ["#14233a", "#3b4658", "#9aa7bd", "#e9e4d8"];
    case "violet":
      return ["#1d1446", "#7655fa", "#c4b6ff", "#f1ece2"];
    case "blue":
      return ["#0a1f3d", "#0066b8", "#8cc0ec", "#eef1ee"];
    case "teal":
      return ["#0f3440", "#1e7188", "#7fb8c4", "#efe9dc"];
  }
}
