// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../authorize/oauth.css";

// console.progmasoft.com: the pages of a signed-in developer are never search
// documents.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ConsoleLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
