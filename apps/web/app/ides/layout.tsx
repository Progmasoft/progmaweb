// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { ReactNode } from "react";
import "../site.css";

export default function IdesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
