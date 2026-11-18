// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { headers } from "next/headers";
import { llmsText } from "@/lib/llms";
import { requestHost } from "@/lib/localization";

/** progmasoft.com/llms.txt; the other hosts of Progmaweb have none. */
export async function GET(): Promise<Response> {
  const requestHeaders = await headers();
  const host = requestHost(
    requestHeaders.get("x-forwarded-host"),
    requestHeaders.get("host"),
  );
  if (host !== "progmasoft.com" && host !== "www.progmasoft.com") {
    return new Response("Not found\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(llmsText(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
