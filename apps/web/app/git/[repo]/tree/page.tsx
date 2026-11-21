// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gitRepository, gitTree } from "@/lib/git.server";
import { getLocale } from "@/lib/locale.server";
import { GitFrame } from "../../GitFrame";
import { GitBreadcrumbs, GitTreeView } from "../../GitViews";
import { one, type RepositoryProps } from "../../params";

export async function generateMetadata({
  params,
  searchParams,
}: RepositoryProps): Promise<Metadata> {
  const { repo } = await params;
  const path = one(await searchParams, "path") ?? "";
  return {
    title: `${path || repo} · ${repo} · Progmasoft Git`,
    robots: { index: false, follow: true },
  };
}

/** git.progmasoft.com/<repo>/tree?path=&ref=: a directory or a file. */
export default async function TreePage({
  params,
  searchParams,
}: RepositoryProps) {
  const { repo } = await params;
  const query = await searchParams;
  const locale = await getLocale();
  const repository = await gitRepository(repo);
  const tree = repository
    ? await gitTree(repo, one(query, "ref"), one(query, "path"))
    : null;
  if (!repository || !tree) {
    notFound();
  }
  return (
    <GitFrame
      locale={locale}
      repository={repository}
      view="tree"
      reference={tree.reference}
    >
      <GitBreadcrumbs
        locale={locale}
        repository={repository}
        reference={tree.reference}
        path={tree.path}
      />
      <GitTreeView locale={locale} repository={repository} tree={tree} />
    </GitFrame>
  );
}
