// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { DashboardClient } from "@/components/DashboardClient";
import { getLocale } from "@/lib/locale.server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

interface DashboardPageProps {
  params: Promise<{ accountName: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { accountName } = await params;
  const locale = await getLocale();
  return (
    <DashboardClient
      locale={locale}
      routeAccountName={decodeURIComponent(accountName)}
    />
  );
}
