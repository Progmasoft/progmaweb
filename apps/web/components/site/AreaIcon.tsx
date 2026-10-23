// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

/** The areas of the Progmasoft technology pool, in the order the home page lists them. */
export const areaKinds = [
  "languages",
  "build",
  "tools",
  "quality",
  "identity",
  "infrastructure",
] as const;
export type AreaKind = (typeof areaKinds)[number];

const paths: Record<AreaKind, string> = {
  // Angle brackets around a slash: source code.
  languages: "M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16",
  // Stacked boxes: packages.
  build: "M4 8l8-4 8 4-8 4-8-4Zm0 0v8l8 4 8-4V8M12 12v8",
  // A wrench.
  tools:
    "M14.5 4.5a4 4 0 0 0-5 5L4 15l5 5 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-3-.5-.5-3 3-3Z",
  // A check inside a shield.
  quality: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Zm-3 9 2 2 4-4",
  // A key.
  identity: "M15 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1 3 7 7m-3-3 2-2m-4 0 2-2",
  // Three stacked servers.
  infrastructure:
    "M4 4h16v5H4V4Zm0 6h16v5H4v-5Zm0 6h16v4H4v-4ZM7 6.5h.01M7 12.5h.01M7 18h.01",
};

/** A line icon for an area of the technology pool. */
export function AreaIcon({ kind }: { kind: AreaKind }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}
