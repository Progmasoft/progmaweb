// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyPage, policyMetadata } from "@/components/PolicyPage";
import { isPolicyVersion } from "@/lib/policies";

type Props = { params: Promise<{ version: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version } = await params;
  return isPolicyVersion(version) ? policyMetadata("privacy", version) : {};
}

/** progmasoft.com/privacy/<version>: one published version. */
export default async function Page({ params }: Props) {
  const { version } = await params;
  if (!isPolicyVersion(version)) {
    notFound();
  }
  return <PolicyPage kind="privacy" version={version} />;
}
