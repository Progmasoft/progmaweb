// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const host = (
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    ""
  )
    .split(":", 1)[0]
    ?.toLowerCase();
  if (host === "viget.progmasoft.com") {
    return [
      {
        url: "https://viget.progmasoft.com/",
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: "https://viget.progmasoft.com/dslplugins/",
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ];
  }
  return [
    {
      // Only public canonical content belongs in this sitemap. Authentication,
      // recovery, and dashboards remain discoverable to users but not Search.
      url: "https://progmasoft.com/",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
