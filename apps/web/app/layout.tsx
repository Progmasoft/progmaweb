// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { nonceHeader } from "@/lib/content-security-policy";
import { getLocale } from "@/lib/locale.server";
import { themeBootstrap } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  // The apex host is the only public organization canonical. The www host is a
  // transport-level redirect and account pages opt out of indexing below.
  metadataBase: new URL("https://progmasoft.com"),
  title: {
    default: "Progmasoft",
    template: "%s · Progmasoft",
  },
  description:
    "Progmasoft makes build systems, testing tools, an agentic IDE and data infrastructure for developers.",
  applicationName: "Progmasoft",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  // The proxy gives each page a nonce; its policy admits no other inline script.
  const nonce = (await headers()).get(nonceHeader) ?? undefined;
  return (
    <html
      lang={locale}
      // data-theme belongs to the bootstrap script (lib/theme.ts) and the theme
      // control only.
      // Rendered here, React would set it back to light whenever the server
      // re-renders the layout (a language switch), and the page would flash.
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeBootstrap }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
