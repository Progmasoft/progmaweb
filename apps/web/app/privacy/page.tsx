// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { PolicyPage, policyMetadata } from "@/components/PolicyPage";

export function generateMetadata(): Promise<Metadata> {
  return policyMetadata("privacy");
}

export default function Page() {
  return <PolicyPage kind="privacy" />;
}
