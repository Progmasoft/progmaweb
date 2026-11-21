// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGitMessages } from "@/lib/git-messages";
import { gitCommit, gitRepository } from "@/lib/git.server";
import { getLocale } from "@/lib/locale.server";
import { GitFrame, gitDate, gitHref } from "../../../GitFrame";

type Props = { params: Promise<{ repo: string; sha: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { repo, sha } = await params;
  return {
    title: `${sha.slice(0, 12)} · ${repo} · Progmasoft Git`,
    robots: { index: false, follow: true },
  };
}

/** The class of a line of a patch, for its color. */
function lineClass(line: string): string | undefined {
  if (line.startsWith("+++") || line.startsWith("---")) {
    return "pm-git-diff-file";
  }
  if (line.startsWith("@@")) {
    return "pm-git-diff-hunk";
  }
  if (line.startsWith("+")) {
    return "pm-git-diff-add";
  }
  return line.startsWith("-") ? "pm-git-diff-remove" : undefined;
}

/** git.progmasoft.com/<repo>/commit/<sha>: a commit and its changes. */
export default async function CommitPage({ params }: Props) {
  const { repo, sha } = await params;
  const locale = await getLocale();
  const text = getGitMessages(locale);
  const repository = await gitRepository(repo);
  const commit = repository ? await gitCommit(repo, sha) : null;
  if (!repository || !commit) {
    notFound();
  }
  const [subject, ...body] = commit.message.split("\n");
  const lines = commit.diff.split("\n");
  return (
    <GitFrame locale={locale} repository={repository} view="commit">
      <section className="pm-git-block">
        <h2>{subject}</h2>
        {body.join("\n").trim() ? (
          <pre className="pm-git-message">{body.join("\n").trim()}</pre>
        ) : null}
        <dl className="pm-git-facts">
          <dt>{text.commit}</dt>
          <dd>
            <code>{commit.commit}</code>
          </dd>
          <dt>{text.author}</dt>
          <dd>
            {commit.author} ·{" "}
            <time dateTime={commit.authorDate}>
              {gitDate(locale, commit.authorDate)}
            </time>
          </dd>
          {commit.committer !== commit.author ? (
            <>
              <dt>{text.committer}</dt>
              <dd>{commit.committer}</dd>
            </>
          ) : null}
          {commit.parents.length > 0 ? (
            <>
              <dt>{text.parents}</dt>
              <dd>
                {commit.parents.map((parent, index) => (
                  <span key={parent}>
                    {index > 0 ? ", " : null}
                    <a href={`/${repository.name}/commit/${parent}`}>
                      <code>{parent.slice(0, 12)}</code>
                    </a>
                  </span>
                ))}
              </dd>
            </>
          ) : null}
        </dl>
        <p>
          <a href={gitHref(`/${repository.name}`, { ref: commit.commit })}>
            {text.files}
          </a>{" "}
          ·{" "}
          <a
            href={gitHref(`/${repository.name}/archive`, {
              ref: commit.commit,
            })}
          >
            {text.archive}
          </a>
        </p>
      </section>
      <section className="pm-git-block">
        <h2>{text.changes}</h2>
        <pre className="pm-git-diff">
          {lines.map((line, index) => (
            <span key={index} className={lineClass(line)}>
              {line}
              {"\n"}
            </span>
          ))}
        </pre>
        {commit.isDiffTruncated ? (
          <p className="pm-git-meta">{text.diffTruncated}</p>
        ) : null}
      </section>
    </GitFrame>
  );
}
