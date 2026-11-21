// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

/** The public pages the layout tests open, one per kind of page on each host. */
export const layoutPages = [
  "progmasoft.com/",
  "progmasoft.com/privacy",
  "progmasoft.com/security",
  "progmasoft.com/privacy/2026-12-06",
  "account.progmasoft.com/",
  "account.progmasoft.com/login",
  "account.progmasoft.com/register",
  "product.progmasoft.com/",
  "product.progmasoft.com/categories",
  "product.progmasoft.com/languages",
  "product.progmasoft.com/releases",
  "product.progmasoft.com/tazel",
  "product.progmasoft.com/catch3",
  "console.progmasoft.com/",
  "license.progmasoft.com/",
  "license.progmasoft.com/pm-spl/1.0/information/",
  "license.progmasoft.com/pm-spl/1.0/faq/",
  "license.progmasoft.com/pm-spl/1.0/categories/",
  "agencelandmcp.progmasoft.com/",
  "git.progmasoft.com/",
  "git.progmasoft.com/example-with-a-rather-long-repository-name",
  "git.progmasoft.com/example-with-a-rather-long-repository-name/tree?path=src/main.c",
  "git.progmasoft.com/example-with-a-rather-long-repository-name/log",
  "git.progmasoft.com/example-with-a-rather-long-repository-name/refs",
  "git.progmasoft.com/example-with-a-rather-long-repository-name/commit/0123456789abcdef0123456789abcdef01234567",
] as const;

/** Every host name of the pages above. */
export const layoutHosts = [
  ...new Set(layoutPages.map((page) => page.slice(0, page.indexOf("/")))),
];
