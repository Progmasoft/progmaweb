// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getGitMessages } from "@/lib/git-messages";
import type { GitRepository } from "@/lib/git.server";
import type { Locale } from "@/lib/localization";

/** The views of a repository, for its navigation. */
export type GitView = "summary" | "tree" | "log" | "refs" | "commit";

/** An address of git.progmasoft.com with its query, empty values left out. */
export function gitHref(
  path: string,
  query: Record<string, string | number | undefined> = {},
): string {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "" && value !== 0) {
      parameters.set(key, String(value));
    }
  }
  const search = parameters.toString();
  return search ? `${path}?${search}` : path;
}

/** A date as the language writes it. */
export function gitDate(locale: Locale, date: string | null): string {
  if (!date) {
    return "";
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** A size in bytes, KiB or MiB. */
export function gitSize(bytes: number | null): string {
  if (bytes === null) {
    return "";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KiB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

/** The frame of every page of git.progmasoft.com. */
export function GitFrame({
  locale,
  repository,
  view,
  reference,
  children,
}: Readonly<{
  locale: Locale;
  /** The repository of the page, or nothing for the listing. */
  repository?: GitRepository;
  view?: GitView;
  /** The branch or tag the page shows, when it is not the default. */
  reference?: string;
  children: ReactNode;
}>) {
  const text = getGitMessages(locale);
  const base = repository ? `/${repository.name}` : "";
  const ref =
    reference && reference !== repository?.defaultBranch
      ? reference
      : undefined;
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            <p className="eyebrow">
              <Link href="/">{text.title}</Link>
            </p>
            <h1>{repository ? repository.name : text.title}</h1>
            <p className="pm-lede">
              {repository ? repository.description : text.description}
            </p>
            {repository ? (
              <>
                <nav className="pm-git-nav" aria-label={text.repository}>
                  <a
                    href={gitHref(base, { ref })}
                    aria-current={view === "summary" ? "page" : undefined}
                  >
                    {text.files}
                  </a>
                  <a
                    href={gitHref(`${base}/log`, { ref })}
                    aria-current={view === "log" ? "page" : undefined}
                  >
                    {text.log}
                  </a>
                  <a
                    href={`${base}/refs`}
                    aria-current={view === "refs" ? "page" : undefined}
                  >
                    {text.refs}
                  </a>
                  <a href={repository.homepage}>{text.developedOn}</a>
                </nav>
                <p className="pm-git-clone">
                  <span>{text.clone}</span>
                  <code>git clone {repository.cloneUrl}</code>
                </p>
              </>
            ) : null}
          </div>
        </section>
        <section className="pm-section">
          <div className="pm-shell pm-git">{children}</div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
