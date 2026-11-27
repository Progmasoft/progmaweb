// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { ReactNode } from "react";
import "../site.css";
import "./news.css";

export default function NewsLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
