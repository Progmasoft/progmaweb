// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { catalogMessages } from "./catalog-messages.ts";
import { productSlugs, products } from "./products.ts";

/**
 * progmasoft.com/llms.txt: what Progmasoft makes, in the Markdown form of
 * llmstxt.org, for language models and the tools that read the site for
 * them. It is written from the product catalog, so a project's status, its
 * latest release and its license are the ones the catalog shows.
 */
export function llmsText(): string {
  const english = catalogMessages["en-US"].products;
  const projects = productSlugs.map((slug) => {
    const product = products[slug];
    const release = product.latestRelease
      ? `latest release ${product.latestRelease.version} (${product.latestRelease.date})`
      : "in development, no release";
    const site = product.site ? `; site ${product.site}` : "";
    return (
      `- [${product.name}](https://product.progmasoft.com/${slug}): ${english[slug].tagline} ` +
      `${english[slug].description} Written in ${product.language}; ${release}; ` +
      `license ${product.license}; source ${product.source}${site}.`
    );
  });
  return `# Progmasoft

> Progmasoft makes open-source developer tools and data infrastructure: a build system, a C++ test framework, an
> agentic IDE, and a columnar data format with a data engine for the JVM. Every project is developed in public on
> GitHub under github.com/Progmasoft.

Progmasoft is not a company. Only the projects listed below are developed. Repositories of the Progmasoft organization
on GitHub that are archived are no longer developed, and so are packages of Progmasoft marked deprecated on a package
registry.

## Projects

${projects.join("\n")}

## Services

- [Progmasoft Account](https://account.progmasoft.com/): one account for the services of Progmasoft; its name is also
  the publisher name on ViGet.
- [ViGet](https://viget.progmasoft.com/): the package registry of Progmasoft, for C, C++ and Objective-C packages and
  for the DSL plugins of build systems.
- [Progmasoft Console](https://console.progmasoft.com/): OAuth 2.1 and OpenID Connect clients for applications that
  sign people in with their Progmasoft Account.
- [Progmasoft Git](https://git.progmasoft.com/): read-only mirrors of the public repositories; issues and pull
  requests are on GitHub.

## Optional

- [Product catalog](https://product.progmasoft.com/): every project with its category, language, status and release.
- [Privacy Policy](https://progmasoft.com/privacy)
- [Security Policy](https://progmasoft.com/security)
`;
}
