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
] as const;

/** Every host name of the pages above. */
export const layoutHosts = [
  ...new Set(layoutPages.map((page) => page.slice(0, page.indexOf("/")))),
];
