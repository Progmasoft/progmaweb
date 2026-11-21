// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/** The parameters of a repository page. */
export type RepositoryProps = {
  params: Promise<{ repo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** One query parameter as text; the first when it is given more than once. */
export function one(
  query: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = query[key];
  return Array.isArray(value) ? value[0] : value;
}

/** A page number of a log: a whole number from 0, or 0. */
export function pageOf(text: string | undefined): number {
  const page = Number(text ?? "0");
  return Number.isInteger(page) && page >= 0 && page <= 10000 ? page : 0;
}
