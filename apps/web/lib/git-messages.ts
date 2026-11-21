// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

/** The words of git.progmasoft.com. */
export interface GitMessages {
  metadataTitle: string;
  title: string;
  description: string;
  repository: string;
  updated: string;
  clone: string;
  developedOn: string;
  files: string;
  name: string;
  size: string;
  recentCommits: string;
  log: string;
  refs: string;
  branches: string;
  tags: string;
  branch: string;
  commit: string;
  author: string;
  committer: string;
  date: string;
  parents: string;
  changes: string;
  raw: string;
  archive: string;
  older: string;
  newer: string;
  binary: string;
  truncated: string;
  diffTruncated: string;
  directory: string;
  link: string;
  submodule: string;
  root: string;
  noRepositories: string;
}

export const gitMessages: Record<Locale, GitMessages> = {
  "en-US": {
    metadataTitle: "Progmasoft Git",
    title: "Progmasoft Git",
    description:
      "Read-only mirrors of the repositories of Progmasoft. Issues and pull requests are on GitHub.",
    repository: "Repository",
    updated: "Updated",
    clone: "Clone",
    developedOn: "Developed on GitHub",
    files: "Files",
    name: "Name",
    size: "Size",
    recentCommits: "Recent commits",
    log: "Log",
    refs: "Branches and tags",
    branches: "Branches",
    tags: "Tags",
    branch: "Branch or tag",
    commit: "Commit",
    author: "Author",
    committer: "Committer",
    date: "Date",
    parents: "Parents",
    changes: "Changes",
    raw: "Raw",
    archive: "Download .tar.gz",
    older: "Older commits",
    newer: "Newer commits",
    binary: "A binary file: it is not shown.",
    truncated: "The file is longer than what is shown.",
    diffTruncated: "The changes are longer than what is shown.",
    directory: "directory",
    link: "link",
    submodule: "submodule",
    root: "root",
    noRepositories: "No repository is mirrored.",
  },
  "de-DE": {
    metadataTitle: "Progmasoft Git",
    title: "Progmasoft Git",
    description:
      "Schreibgeschützte Spiegel der Repositories von Progmasoft. Issues und Pull Requests sind auf GitHub.",
    repository: "Repository",
    updated: "Aktualisiert",
    clone: "Klonen",
    developedOn: "Entwickelt auf GitHub",
    files: "Dateien",
    name: "Name",
    size: "Größe",
    recentCommits: "Letzte Commits",
    log: "Verlauf",
    refs: "Branches und Tags",
    branches: "Branches",
    tags: "Tags",
    branch: "Branch oder Tag",
    commit: "Commit",
    author: "Autor",
    committer: "Committer",
    date: "Datum",
    parents: "Eltern",
    changes: "Änderungen",
    raw: "Roh",
    archive: ".tar.gz herunterladen",
    older: "Ältere Commits",
    newer: "Neuere Commits",
    binary: "Eine Binärdatei: Sie wird nicht angezeigt.",
    truncated: "Die Datei ist länger als das Angezeigte.",
    diffTruncated: "Die Änderungen sind länger als das Angezeigte.",
    directory: "Verzeichnis",
    link: "Link",
    submodule: "Submodul",
    root: "Wurzel",
    noRepositories: "Kein Repository wird gespiegelt.",
  },
  "ru-RU": {
    metadataTitle: "Progmasoft Git",
    title: "Progmasoft Git",
    description:
      "Зеркала репозиториев Progmasoft только для чтения. Задачи и pull request — на GitHub.",
    repository: "Репозиторий",
    updated: "Обновлён",
    clone: "Клонировать",
    developedOn: "Разрабатывается на GitHub",
    files: "Файлы",
    name: "Имя",
    size: "Размер",
    recentCommits: "Последние коммиты",
    log: "История",
    refs: "Ветки и теги",
    branches: "Ветки",
    tags: "Теги",
    branch: "Ветка или тег",
    commit: "Коммит",
    author: "Автор",
    committer: "Коммиттер",
    date: "Дата",
    parents: "Родители",
    changes: "Изменения",
    raw: "Исходный файл",
    archive: "Скачать .tar.gz",
    older: "Более старые коммиты",
    newer: "Более новые коммиты",
    binary: "Двоичный файл: он не показывается.",
    truncated: "Файл длиннее показанного.",
    diffTruncated: "Изменения длиннее показанного.",
    directory: "каталог",
    link: "ссылка",
    submodule: "подмодуль",
    root: "корень",
    noRepositories: "Нет ни одного зеркала.",
  },
  "fr-FR": {
    metadataTitle: "Progmasoft Git",
    title: "Progmasoft Git",
    description:
      "Des miroirs en lecture seule des dépôts de Progmasoft. Les tickets et les pull requests sont sur GitHub.",
    repository: "Dépôt",
    updated: "Mis à jour",
    clone: "Cloner",
    developedOn: "Développé sur GitHub",
    files: "Fichiers",
    name: "Nom",
    size: "Taille",
    recentCommits: "Derniers commits",
    log: "Historique",
    refs: "Branches et tags",
    branches: "Branches",
    tags: "Tags",
    branch: "Branche ou tag",
    commit: "Commit",
    author: "Auteur",
    committer: "Committer",
    date: "Date",
    parents: "Parents",
    changes: "Modifications",
    raw: "Brut",
    archive: "Télécharger .tar.gz",
    older: "Commits plus anciens",
    newer: "Commits plus récents",
    binary: "Un fichier binaire : il n’est pas affiché.",
    truncated: "Le fichier est plus long que ce qui est affiché.",
    diffTruncated:
      "Les modifications sont plus longues que ce qui est affiché.",
    directory: "répertoire",
    link: "lien",
    submodule: "sous-module",
    root: "racine",
    noRepositories: "Aucun dépôt n’est mis en miroir.",
  },
};

export function getGitMessages(locale: Locale): GitMessages {
  return gitMessages[locale];
}

/** Drops the trailing slash of every path but the root. */
function trimmed(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

const repositoryName = /^[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}$/;
const commitId = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;

/**
 * The public pages of git.progmasoft.com and the internal routes that render
 * them. Clones, raw files and archives never reach Next.js: Nginx sends them
 * to git-http-backend and the API.
 */
export function gitRoute(pathname: string): string | null {
  const path = trimmed(pathname);
  if (path === "/") {
    return "/git";
  }
  const [, name = "", ...view] = path.split("/");
  return isRepositoryName(name) ? viewRoute(name, view) : null;
}

/** Whether a path segment names a repository, not its .git clone address. */
function isRepositoryName(name: string): boolean {
  return repositoryName.test(name) && !name.endsWith(".git");
}

/** The views of one repository: its files, a tree, its log, refs or a commit. */
const repositoryViews = new Set(["tree", "log", "refs"]);

function viewRoute(name: string, view: string[]): string | null {
  const [kind, commit] = view;
  if (kind === undefined) {
    return `/git/${name}`;
  }
  if (view.length === 1) {
    return repositoryViews.has(kind) ? `/git/${name}/${kind}` : null;
  }
  const isCommit =
    view.length === 2 && kind === "commit" && commitId.test(commit ?? "");
  return isCommit ? `/git/${name}/commit/${commit}` : null;
}
