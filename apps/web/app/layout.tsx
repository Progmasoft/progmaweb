// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/locale.server";
import "./globals.css";
import "./viget.css";

// Apply the stored theme before the body is painted. PreferenceControls keeps
// this value synchronized after hydration, while this small bootstrap prevents
// a light flash on every route—including dashboard loading and error states.
const themeBootstrap = `
  (() => {
    try {
      const theme = localStorage.getItem("progmasoft_theme") === "dark" ? "dark" : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {}
  })();
`;

export const metadata: Metadata = {
  // The apex host is the only public organization canonical. The www host is a
  // transport-level redirect and account pages opt out of indexing below.
  metadataBase: new URL("https://progmasoft.com"),
  title: {
    default: "Progmasoft",
    template: "%s · Progmasoft",
  },
  description:
    "Progmasoft builds programming-language, package-management, and developer-tooling systems.",
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
  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
