// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import "server-only";

/** A repository, as the API lists it. */
export interface GitRepository {
  name: string;
  description: string;
  homepage: string;
  cloneUrl: string;
  defaultBranch: string | null;
  updatedAt: string | null;
}

export interface GitSection {
  name: string;
  repositories: GitRepository[];
}

export interface GitRef {
  name: string;
  commit: string;
  date: string;
  subject: string;
}

export interface GitTreeEntry {
  name: string;
  kind: "tree" | "blob" | "link" | "submodule";
  size: number | null;
}

export interface GitTree {
  reference: string;
  commit: string;
  path: string;
  kind: "tree" | "blob";
  entries: GitTreeEntry[] | null;
  size: number | null;
  isBinary: boolean;
  text: string | null;
  isTruncated: boolean;
}

export interface GitLogEntry {
  commit: string;
  author: string;
  date: string;
  subject: string;
}

export interface GitLog {
  reference: string;
  commit: string;
  path: string;
  page: number;
  commits: GitLogEntry[];
  hasMore: boolean;
}

export interface GitCommit {
  commit: string;
  parents: string[];
  author: string;
  authorDate: string;
  committer: string;
  commitDate: string;
  message: string;
  diff: string;
  isDiffTruncated: boolean;
}

/** The account API on loopback; the Git endpoints answer it there. */
const origin = process.env.PROGMAWEB_API_ORIGIN ?? "http://127.0.0.1:5085";

/**
 * Reads one Git endpoint. A 404 is "no such thing" and returns null; any other
 * failure throws, so the page shows its error rather than an empty listing.
 */
async function read<T>(
  path: string,
  query: Record<string, string | undefined> = {},
): Promise<T | null> {
  const url = new URL(`/api/v1/git/repositories${path}`, origin);
  for (const [key, value] of Object.entries(query)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`The Git API answered ${response.status} for ${path}.`);
  }
  return (await response.json()) as T;
}

export function gitSections(): Promise<GitSection[] | null> {
  return read<GitSection[]>("/");
}

export function gitRepository(name: string): Promise<GitRepository | null> {
  return read<GitRepository>(`/${encodeURIComponent(name)}`);
}

export function gitRefs(
  name: string,
): Promise<{ branches: GitRef[]; tags: GitRef[] } | null> {
  return read(`/${encodeURIComponent(name)}/refs`);
}

export function gitTree(
  name: string,
  ref?: string,
  path?: string,
): Promise<GitTree | null> {
  return read<GitTree>(`/${encodeURIComponent(name)}/tree`, { ref, path });
}

export function gitLog(
  name: string,
  ref?: string,
  path?: string,
  page?: number,
): Promise<GitLog | null> {
  return read<GitLog>(`/${encodeURIComponent(name)}/log`, {
    ref,
    path,
    page: page ? String(page) : undefined,
  });
}

export function gitCommit(
  name: string,
  commit: string,
): Promise<GitCommit | null> {
  return read<GitCommit>(
    `/${encodeURIComponent(name)}/commits/${encodeURIComponent(commit)}`,
  );
}
