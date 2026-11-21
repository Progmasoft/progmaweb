// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGitMessages } from "@/lib/git-messages";
import { gitLog, gitRepository, gitTree } from "@/lib/git.server";
import { getLocale } from "@/lib/locale.server";
import { GitFrame, gitHref } from "../GitFrame";
import {
  GitBreadcrumbs,
  GitCommitList,
  GitTreeView,
  keptRef,
} from "../GitViews";
import { one, type RepositoryProps } from "../params";

export async function generateMetadata({
  params,
}: RepositoryProps): Promise<Metadata> {
  const { repo } = await params;
  const repository = await gitRepository(repo);
  return repository
    ? {
        title: `${repository.name} · Progmasoft Git`,
        description: repository.description,
        alternates: {
          canonical: `https://git.progmasoft.com/${repository.name}`,
        },
      }
    : {};
}

/** git.progmasoft.com/<repo>: the files of a branch and its last commits. */
export default async function RepositoryPage({
  params,
  searchParams,
}: RepositoryProps) {
  const { repo } = await params;
  const ref = one(await searchParams, "ref");
  const locale = await getLocale();
  const text = getGitMessages(locale);
  const repository = await gitRepository(repo);
  const tree = repository ? await gitTree(repo, ref) : null;
  if (!repository || !tree) {
    notFound();
  }
  const log = await gitLog(repo, tree.commit);
  return (
    <GitFrame
      locale={locale}
      repository={repository}
      view="summary"
      reference={tree.reference}
    >
      <GitBreadcrumbs
        locale={locale}
        repository={repository}
        reference={tree.reference}
        path=""
      />
      <GitTreeView locale={locale} repository={repository} tree={tree} />
      <section className="pm-git-block">
        <h2>{text.recentCommits}</h2>
        <GitCommitList
          locale={locale}
          repository={repository}
          commits={(log?.commits ?? []).slice(0, 10)}
        />
        <p>
          <a
            href={gitHref(`/${repository.name}/log`, {
              ref: keptRef(repository, tree.reference),
            })}
          >
            {text.log}
          </a>{" "}
          ·{" "}
          <a
            href={gitHref(`/${repository.name}/archive`, {
              ref: tree.reference,
            })}
          >
            {text.archive}
          </a>
        </p>
      </section>
    </GitFrame>
  );
}
