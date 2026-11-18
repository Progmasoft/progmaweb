// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  type LicenseMessages,
  examplesA,
  examplesB,
  examplesX,
} from "../licenses.ts";

export const enUS: LicenseMessages = {
  metadataTitle: "Licenses of Progmasoft",
  metadataDescription:
    "The licenses Progmasoft wrote: their texts, what they allow and forbid, and how to use them.",
  name: "Progmasoft Proprietary Source License, version 1.0",
  short: "PM-SPL 1.0",
  notice:
    "This page explains the license; it is not the license. The published text is what applies.",
  pages: {
    information: "Information",
    faq: "Questions and answers",
    categories: "Third-party licenses",
  },
  texts: "The text",
  sums: "SHA-256 sums",
  identifiers: "SPDX identifiers:",
  index: {
    title: "Licenses of Progmasoft",
    description:
      "Licenses Progmasoft wrote for its own software. Each has a fixed published text; a change is a new version.",
    pmSpl:
      "For software whose source Progmasoft publishes without making it open source, such as the IntelliJ IDEA plugin of Agenceland. Free of charge; the source can be read, built, run and changed for one's own use, and only Progmasoft distributes it.",
  },
  information: {
    description:
      "What PM-SPL 1.0 is, what it allows and forbids, and how a project uses it.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "PM-SPL is a source-available license: the source of the software is public, but the license is not an open-source license. The licensor is Progmasoft, and the software is provided free of charge. The same text serves as the end-user license of the software on JetBrains Marketplace.",
        ],
      },
      {
        heading: "What it allows",
        paragraphs: [
          "Reading and studying the software; building it and running it on computers you or your organization control, for any purpose, commercial work included; changing it for the use of your organization and keeping the changes; looking for security vulnerabilities and reporting them to Progmasoft; quoting short excerpts in issues, discussions and reviews.",
        ],
      },
      {
        heading: "What it forbids",
        paragraphs: [
          "Giving the software or a changed version to anyone outside your organization, as source or as a build: only Progmasoft distributes it. Selling, renting or sublicensing it, or including it in another product. Offering it, or what is substantially derived from it, as a hosted or network service. Removing copyright, license or attribution notices, and getting around technical measures that control access to it.",
        ],
      },
      {
        heading: "Names and advertising",
        paragraphs: [
          "The license gives no right to the names Progmasoft, Agenceland or any other Progmasoft product, beyond describing where the software comes from. Nobody may use them, or names confusingly like them, to present their own version, product or service as official, as made, endorsed or supported by Progmasoft, or as a Progmasoft product. Advertising in connection with Progmasoft or one of its products must say that it refers to Progmasoft or to that product.",
        ],
      },
      {
        heading: "Forks, contributions and third-party code",
        paragraphs: [
          "GitHub's terms let its users view and fork a public repository within GitHub, and the license does not restrict that; a fork stays under the license and is not distributed outside GitHub.",
          "Contributions are welcome. A contributor gives Progmasoft a broad license to the contribution, relicensing included, and confirms the right to do so.",
          "Third-party material in the software keeps its own license and notices.",
        ],
      },
      {
        heading: "Patents, termination and law",
        paragraphs: [
          "The Progmasoft Patent Grant 1.1 applies where the PATENTS.md file of the software says so, for the uses the license allows. Whoever claims that the software infringes a patent loses the patent licenses they received for it.",
          "A breach ends the license. A first breach is forgiven if it is cured within 30 days of notice from Progmasoft.",
          "The software comes as is, without warranty, and liability is limited as far as the law allows. The laws of England and Wales govern the license, with the courts of England and Wales sitting in London.",
        ],
      },
      {
        heading: "Using it in a project",
        paragraphs: [
          "A project copies the plain text into LICENSES/LicenseRef-PM-SPL-1.0-only.txt or LICENSES/LicenseRef-PM-SPL-1.0-or-later.txt and names that identifier in the SPDX header of each file. With -only the software stays under version 1.0; with -or-later a user may choose a later version Progmasoft publishes.",
          "The plain text is the canonical one. The Markdown and reStructuredText forms carry the same words, only marked up. Each file has its SHA-256 sum beside it, and the same files are in the Progmasoft/licenses repository.",
        ],
      },
    ],
  },
  faq: {
    description: "Short answers about PM-SPL 1.0.",
    questions: [
      [
        "Is PM-SPL an open-source license?",
        "No. The source is public, but distribution is reserved to Progmasoft, so the license does not meet the Open Source Definition.",
      ],
      [
        "Does it cost anything?",
        "No. Software under PM-SPL 1.0 is provided free of charge.",
      ],
      [
        "May I use it at work?",
        "Yes. You may build and run it on computers you or your organization control, for any purpose, commercial work included.",
      ],
      [
        "May I change it?",
        "Yes, for the use of your organization, and you may keep the changes to yourself. You may not give a changed version to anyone outside your organization.",
      ],
      [
        "May I share a build with a friend or publish it?",
        "No. Only Progmasoft distributes the software, for example on JetBrains Marketplace. Point others to Progmasoft's own release.",
      ],
      [
        "May I fork the repository on GitHub?",
        "Yes, within GitHub, as GitHub's terms allow. The fork stays under PM-SPL and is not distributed outside GitHub.",
      ],
      [
        "May I run it as a service for others?",
        "No. Offering the software, or what is substantially derived from it, as a hosted or network service is forbidden.",
      ],
      [
        "May I contribute?",
        "Yes. Contributions are welcome; by contributing you give Progmasoft a broad license to your contribution, relicensing included.",
      ],
      [
        "I found a security weakness. What do I do?",
        "Looking for vulnerabilities is allowed. Write to support@progmasoft.com with what you found.",
      ],
      [
        "What happens if I break the license?",
        "It ends. For a first breach your rights come back if you cure it within 30 days of Progmasoft's notice.",
      ],
      [
        "Which version applies to me?",
        "The one the software names: LicenseRef-PM-SPL-1.0-only is version 1.0 alone; LicenseRef-PM-SPL-1.0-or-later lets you choose a later version Progmasoft publishes.",
      ],
      [
        "Which text is authoritative?",
        "The plain-text file. The Markdown and reStructuredText files carry the same words; the SHA-256 sums beside each file let you check that you have the published text.",
      ],
    ],
  },
  categories: {
    description:
      "Which third-party licenses software under PM-SPL may use, in the three categories the Apache Software Foundation uses.",
    intro:
      "This is a rule Progmasoft follows for its PM-SPL software; it is not part of the license text. It decides what third-party code may be a dependency of PM-SPL software or be copied into it.",
    category: "Category",
    license: "License",
    identifier: "SPDX identifier",
    items: [
      {
        letter: "A",
        name: "Permissive",
        rule: "May be a dependency and may be copied in, with its notices kept.",
        examples: examplesA,
      },
      {
        letter: "B",
        name: "Weak copyleft",
        rule: "Only unmodified, as a separate part, with its notices; never mixed into the PM-SPL code.",
        examples: examplesB,
      },
      {
        letter: "X",
        name: "Strong copyleft",
        rule: "Never: neither as a dependency nor copied in, as it would require the whole work to take its license.",
        examples: examplesX,
      },
    ],
  },
};
