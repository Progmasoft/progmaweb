import type { Metadata } from "next";
import { DashboardClient } from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

interface DashboardPageProps {
  params: Promise<{ accountName: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { accountName } = await params;
  return <DashboardClient routeAccountName={decodeURIComponent(accountName)} />;
}
