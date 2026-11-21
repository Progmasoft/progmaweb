// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { getGitMessages } from "@/lib/git-messages";
import { gitSections } from "@/lib/git.server";
import { getLocale } from "@/lib/locale.server";
import { GitFrame, gitDate } from "./GitFrame";

export async function generateMetadata(): Promise<Metadata> {
  const text = getGitMessages(await getLocale());
  return {
    title: text.metadataTitle,
    description: text.description,
    alternates: { canonical: "https://git.progmasoft.com/" },
  };
}

/** git.progmasoft.com: the mirrored repositories, by section. */
export default async function GitIndexPage() {
  const locale = await getLocale();
  const text = getGitMessages(locale);
  const sections = (await gitSections()) ?? [];
  return (
    <GitFrame locale={locale}>
      {sections.length === 0 ? <p>{text.noRepositories}</p> : null}
      {sections.map((section) => (
        <section key={section.name} className="pm-git-block">
          <h2>{section.name}</h2>
          <ul className="pm-git-repositories">
            {section.repositories.map((repository) => (
              <li key={repository.name}>
                <a href={`/${repository.name}`}>{repository.name}</a>
                <p>{repository.description}</p>
                {repository.updatedAt ? (
                  <p className="pm-git-meta">
                    {text.updated}{" "}
                    <time dateTime={repository.updatedAt}>
                      {gitDate(locale, repository.updatedAt)}
                    </time>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </GitFrame>
  );
}
