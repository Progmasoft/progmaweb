// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { licensePages } from "@/lib/license-messages";
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
  if (host === "git.progmasoft.com") {
    return [{ url: "https://git.progmasoft.com/" }];
  }
  if (host === "agencelandmcp.progmasoft.com") {
    return [{ url: "https://agencelandmcp.progmasoft.com/" }];
  }
  if (host === "license.progmasoft.com") {
    return [
      {
        url: "https://license.progmasoft.com/",
        changeFrequency: "monthly",
        priority: 1,
      },
      ...licensePages.map((page) => ({
        url: `https://license.progmasoft.com/pm-spl/1.0/${page}/`,
        changeFrequency: "yearly" as const,
        priority: 0.8,
      })),
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
