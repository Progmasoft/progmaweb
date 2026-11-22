// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGitMessages } from "@/lib/git-messages";
import { gitLog, gitRepository } from "@/lib/git.server";
import { getLocale } from "@/lib/locale.server";
import { GitFrame, gitHref } from "../../GitFrame";
import { GitBreadcrumbs, GitCommitList, keptRef } from "../../GitViews";
import { one, pageOf, type RepositoryProps } from "../../params";

export async function generateMetadata({
  params,
}: RepositoryProps): Promise<Metadata> {
  const { repo } = await params;
  const text = getGitMessages(await getLocale());
  return {
    title: `${text.log} · ${repo} · Progmasoft Git`,
    robots: { index: false, follow: true },
  };
}

/** git.progmasoft.com/<repo>/log?ref=&path=&page=: the commits, newest first. */
export default async function LogPage({
  params,
  searchParams,
}: RepositoryProps) {
  const { repo } = await params;
  const query = await searchParams;
  const locale = await getLocale();
  const text = getGitMessages(locale);
  const page = pageOf(one(query, "page"));
  const repository = await gitRepository(repo);
  const log = repository
    ? await gitLog(repo, one(query, "ref"), one(query, "path"), page)
    : null;
  if (!repository || !log) {
    notFound();
  }
  const ref = keptRef(repository, log.reference);
  const at = (to: number) =>
    gitHref(`/${repository.name}/log`, { ref, path: log.path, page: to });
  return (
    <GitFrame
      locale={locale}
      repository={repository}
      view="log"
      reference={log.reference}
    >
      <GitBreadcrumbs
        locale={locale}
        repository={repository}
        reference={log.reference}
        path={log.path}
      />
      <GitCommitList
        locale={locale}
        repository={repository}
        commits={log.commits}
      />
      <nav className="pm-git-pages" aria-label={text.log}>
        {page > 0 ? <a href={at(page - 1)}>{text.newer}</a> : null}
        {log.hasMore ? <a href={at(page + 1)}>{text.older}</a> : null}
      </nav>
    </GitFrame>
  );
}
