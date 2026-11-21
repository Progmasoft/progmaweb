// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGitMessages } from "@/lib/git-messages";
import { type GitRef, gitRefs, gitRepository } from "@/lib/git.server";
import { getLocale } from "@/lib/locale.server";
import type { Locale } from "@/lib/localization";
import { GitFrame, gitDate, gitHref } from "../../GitFrame";
import type { RepositoryProps } from "../../params";

export async function generateMetadata({
  params,
}: RepositoryProps): Promise<Metadata> {
  const { repo } = await params;
  const text = getGitMessages(await getLocale());
  return {
    title: `${text.refs} · ${repo} · Progmasoft Git`,
    robots: { index: false, follow: true },
  };
}

function RefTable({
  locale,
  name,
  heading,
  refs,
}: Readonly<{
  locale: Locale;
  name: string;
  heading: string;
  refs: GitRef[];
}>) {
  const text = getGitMessages(locale);
  return (
    <section className="pm-git-block">
      <h2>{heading}</h2>
      <div className="pm-git-scroll">
        <table className="pm-git-table">
          <thead>
            <tr>
              <th scope="col">{text.name}</th>
              <th scope="col">{text.commit}</th>
              <th scope="col">{text.date}</th>
            </tr>
          </thead>
          <tbody>
            {refs.map((ref) => (
              <tr key={ref.name}>
                <td>
                  <a href={gitHref(`/${name}`, { ref: ref.name })}>
                    {ref.name}
                  </a>
                </td>
                <td>
                  <a href={`/${name}/commit/${ref.commit}`}>{ref.subject}</a>
                </td>
                <td>
                  <time dateTime={ref.date}>{gitDate(locale, ref.date)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** git.progmasoft.com/<repo>/refs: the branches and the tags. */
export default async function RefsPage({ params }: RepositoryProps) {
  const { repo } = await params;
  const locale = await getLocale();
  const text = getGitMessages(locale);
  const repository = await gitRepository(repo);
  const refs = repository ? await gitRefs(repo) : null;
  if (!repository || !refs) {
    notFound();
  }
  return (
    <GitFrame locale={locale} repository={repository} view="refs">
      <RefTable
        locale={locale}
        name={repository.name}
        heading={text.branches}
        refs={refs.branches}
      />
      {refs.tags.length > 0 ? (
        <RefTable
          locale={locale}
          name={repository.name}
          heading={text.tags}
          refs={refs.tags}
        />
      ) : null}
    </GitFrame>
  );
}
