// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getGitMessages } from "@/lib/git-messages";
import type { GitLogEntry, GitRepository, GitTree } from "@/lib/git.server";
import type { Locale } from "@/lib/localization";
import { gitDate, gitHref, gitSize } from "./GitFrame";

/** The reference to keep in links: none for the default branch. */
export function keptRef(
  repository: GitRepository,
  reference: string,
): string | undefined {
  return reference === repository.defaultBranch ? undefined : reference;
}

/** The path of a tree as links, from the root. */
export function GitBreadcrumbs({
  locale,
  repository,
  reference,
  path,
}: Readonly<{
  locale: Locale;
  repository: GitRepository;
  reference: string;
  path: string;
}>) {
  const text = getGitMessages(locale);
  const ref = keptRef(repository, reference);
  const parts = path ? path.split("/") : [];
  return (
    <p className="pm-git-path">
      <span className="pm-git-ref">{reference}</span>
      <a href={gitHref(`/${repository.name}`, { ref })}>{text.root}</a>
      {parts.map((part, index) => {
        const at = parts.slice(0, index + 1).join("/");
        return (
          <span key={at}>
            {" / "}
            {index === parts.length - 1 ? (
              <span>{part}</span>
            ) : (
              <a href={gitHref(`/${repository.name}/tree`, { ref, path: at })}>
                {part}
              </a>
            )}
          </span>
        );
      })}
    </p>
  );
}

/** The entries of a tree, or the text of a file. */
export function GitTreeView({
  locale,
  repository,
  tree,
}: Readonly<{ locale: Locale; repository: GitRepository; tree: GitTree }>) {
  const text = getGitMessages(locale);
  const ref = keptRef(repository, tree.reference);
  const raw = gitHref(`/${repository.name}/raw`, {
    ref: tree.commit,
    path: tree.path,
  });
  if (tree.kind === "blob") {
    return (
      <section className="pm-git-block">
        <p className="pm-git-meta">
          {gitSize(tree.size)} · <a href={raw}>{text.raw}</a> ·{" "}
          <a
            href={gitHref(`/${repository.name}/log`, { ref, path: tree.path })}
          >
            {text.log}
          </a>
        </p>
        {tree.isBinary ? (
          <p>{text.binary}</p>
        ) : (
          <pre className="pm-git-file">
            <code>{tree.text}</code>
          </pre>
        )}
        {tree.isTruncated ? (
          <p className="pm-git-meta">{text.truncated}</p>
        ) : null}
      </section>
    );
  }
  const kindWords = {
    tree: text.directory,
    link: text.link,
    submodule: text.submodule,
    blob: "",
  };
  return (
    <section className="pm-git-block">
      <h2>{text.files}</h2>
      <div className="pm-git-scroll">
        <table className="pm-git-table">
          <thead>
            <tr>
              <th scope="col">{text.name}</th>
              <th scope="col">{text.size}</th>
            </tr>
          </thead>
          <tbody>
            {(tree.entries ?? []).map((entry) => {
              const at = tree.path ? `${tree.path}/${entry.name}` : entry.name;
              return (
                <tr key={entry.name}>
                  <td>
                    {entry.kind === "submodule" ? (
                      <span>{entry.name}</span>
                    ) : (
                      <a
                        href={gitHref(`/${repository.name}/tree`, {
                          ref,
                          path: at,
                        })}
                      >
                        {entry.name}
                        {entry.kind === "tree" ? "/" : ""}
                      </a>
                    )}
                  </td>
                  <td>
                    {entry.kind === "blob"
                      ? gitSize(entry.size)
                      : kindWords[entry.kind]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** A list of commits. */
export function GitCommitList({
  locale,
  repository,
  commits,
}: Readonly<{
  locale: Locale;
  repository: GitRepository;
  commits: GitLogEntry[];
}>) {
  return (
    <ol className="pm-git-commits">
      {commits.map((entry) => (
        <li key={entry.commit}>
          <a href={`/${repository.name}/commit/${entry.commit}`}>
            {entry.subject || entry.commit.slice(0, 12)}
          </a>
          <p className="pm-git-meta">
            <code>{entry.commit.slice(0, 12)}</code> · {entry.author} ·{" "}
            <time dateTime={entry.date}>{gitDate(locale, entry.date)}</time>
          </p>
        </li>
      ))}
    </ol>
  );
}
