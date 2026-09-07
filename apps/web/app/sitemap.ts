// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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
