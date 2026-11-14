// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { productSlugs } from "@/lib/products";

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
      ...["c", "cpp", "objc"].map((language) => ({
        url: `https://viget.progmasoft.com/langs/${language}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      {
        url: "https://viget.progmasoft.com/dslplugins/tazel",
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ];
  }
  if (host === "product.progmasoft.com") {
    return [
      {
        url: "https://product.progmasoft.com/",
        changeFrequency: "weekly",
        priority: 1,
      },
      ...["categories", "languages", "releases"].map((view) => ({
        url: `https://product.progmasoft.com/${view}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...productSlugs.map((slug) => ({
        url: `https://product.progmasoft.com/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
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
    {
      url: "https://progmasoft.com/privacy",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://progmasoft.com/security",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
