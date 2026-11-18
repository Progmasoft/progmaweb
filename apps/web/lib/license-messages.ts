// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

/** Where the published texts of PM-SPL 1.0 are, each beside its .sha256sums. */
export const pmSplTexts = [
  ["TXT", "https://storage.progmasoft.com/pm-spl/1.0/LICENSE-1.0.txt"],
  ["Markdown", "https://storage.progmasoft.com/pm-spl/1.0/LICENSE-1.0.md"],
  [
    "reStructuredText",
    "https://storage.progmasoft.com/pm-spl/1.0/LICENSE-1.0.rst",
  ],
] as const;

/** The pages of PM-SPL 1.0 on license.progmasoft.com. */
export const licensePages = ["information", "faq", "categories"] as const;
export type LicensePage = (typeof licensePages)[number];

/** The SPDX identifiers of PM-SPL 1.0. */
export const pmSplIdentifiers = [
  "LicenseRef-PM-SPL-1.0-only",
  "LicenseRef-PM-SPL-1.0-or-later",
] as const;

/** One part of a page: a heading and its paragraphs. */
export interface LicenseSection {
  heading: string;
  paragraphs: string[];
}

/** One category of third-party licenses, with examples and their SPDX identifiers. */
export interface LicenseCategory {
  letter: "A" | "B" | "X";
  name: string;
  rule: string;
  examples: [name: string, spdx: string][];
}

interface LicenseMessages {
  metadataTitle: string;
  metadataDescription: string;
  name: string;
  short: string;
  /** Said on every page: the text of the license is what applies. */
  notice: string;
  pages: Record<LicensePage, string>;
  texts: string;
  sums: string;
  identifiers: string;
  index: { title: string; description: string; pmSpl: string };
  information: { description: string; sections: LicenseSection[] };
  faq: { description: string; questions: [string, string][] };
  categories: {
    description: string;
    intro: string;
    category: string;
    license: string;
    identifier: string;
    items: LicenseCategory[];
  };
}

const examplesA: [string, string][] = [
  ["MIT License", "MIT"],
  ["MIT No Attribution", "MIT-0"],
  ['BSD 2-Clause "Simplified" License', "BSD-2-Clause"],
  ['BSD 3-Clause "New" or "Revised" License', "BSD-3-Clause"],
  ["Apache License 2.0", "Apache-2.0"],
  ["ISC License", "ISC"],
  ["zlib License", "Zlib"],
  ["Boost Software License 1.0", "BSL-1.0"],
  ["Unicode License v3", "Unicode-3.0"],
];
const examplesB: [string, string][] = [
  ["GNU Lesser General Public License v2.1 or later", "LGPL-2.1-or-later"],
  ["GNU Lesser General Public License v3.0 or later", "LGPL-3.0-or-later"],
  ["Mozilla Public License 2.0", "MPL-2.0"],
  ["Eclipse Public License 2.0", "EPL-2.0"],
  ["Common Development and Distribution License 1.0", "CDDL-1.0"],
];
const examplesX: [string, string][] = [
  ["GNU General Public License v2.0 only", "GPL-2.0-only"],
  ["GNU General Public License v3.0 or later", "GPL-3.0-or-later"],
  ["GNU Affero General Public License v3.0 or later", "AGPL-3.0-or-later"],
  ["Server Side Public License v1", "SSPL-1.0"],
];

export const licenseMessages: Record<Locale, LicenseMessages> = {
  "en-US": {
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
  },
  "de-DE": {
    metadataTitle: "Lizenzen von Progmasoft",
    metadataDescription:
      "Die Lizenzen, die Progmasoft geschrieben hat: ihre Texte, was sie erlauben und verbieten und wie man sie verwendet.",
    name: "Progmasoft Proprietary Source License, Version 1.0",
    short: "PM-SPL 1.0",
    notice:
      "Diese Seite erklärt die Lizenz; sie ist nicht die Lizenz. Es gilt der veröffentlichte Text.",
    pages: {
      information: "Informationen",
      faq: "Fragen und Antworten",
      categories: "Lizenzen Dritter",
    },
    texts: "Der Text",
    sums: "SHA-256-Summen",
    identifiers: "SPDX-Bezeichner:",
    index: {
      title: "Lizenzen von Progmasoft",
      description:
        "Lizenzen, die Progmasoft für seine eigene Software geschrieben hat. Jede hat einen festen veröffentlichten Text; eine Änderung ist eine neue Version.",
      pmSpl:
        "Für Software, deren Quelltext Progmasoft veröffentlicht, ohne sie zu Open Source zu machen, etwa das IntelliJ-IDEA-Plugin von Agenceland. Kostenlos; der Quelltext darf gelesen, gebaut, ausgeführt und für den eigenen Gebrauch geändert werden, und nur Progmasoft verbreitet ihn.",
    },
    information: {
      description:
        "Was die PM-SPL 1.0 ist, was sie erlaubt und verbietet und wie ein Projekt sie verwendet.",
      sections: [
        {
          heading: "Was sie ist",
          paragraphs: [
            "Die PM-SPL ist eine Source-available-Lizenz: Der Quelltext der Software ist öffentlich, die Lizenz ist aber keine Open-Source-Lizenz. Lizenzgeber ist Progmasoft, und die Software wird kostenlos bereitgestellt. Derselbe Text dient als Endbenutzerlizenz der Software auf JetBrains Marketplace.",
          ],
        },
        {
          heading: "Was sie erlaubt",
          paragraphs: [
            "Die Software lesen und studieren; sie bauen und auf Rechnern ausführen, die Sie oder Ihre Organisation kontrollieren, für jeden Zweck, auch gewerblich; sie für den Gebrauch Ihrer Organisation ändern und die Änderungen behalten; nach Sicherheitslücken suchen und sie Progmasoft melden; kurze Auszüge in Issues, Diskussionen und Reviews zitieren.",
          ],
        },
        {
          heading: "Was sie verbietet",
          paragraphs: [
            "Die Software oder eine geänderte Fassung an jemanden außerhalb Ihrer Organisation weitergeben, als Quelltext oder als Build: Nur Progmasoft verbreitet sie. Sie verkaufen, vermieten oder unterlizenzieren oder in ein anderes Produkt aufnehmen. Sie oder im Wesentlichen daraus Abgeleitetes als gehosteten oder Netzwerkdienst anbieten. Urheberrechts-, Lizenz- oder Namensnennungshinweise entfernen und technische Maßnahmen umgehen, die den Zugang zu ihr steuern.",
          ],
        },
        {
          heading: "Namen und Werbung",
          paragraphs: [
            "Die Lizenz gibt kein Recht an den Namen Progmasoft, Agenceland oder eines anderen Produkts von Progmasoft, außer um die Herkunft der Software zu beschreiben. Niemand darf sie oder verwechselbar ähnliche Namen verwenden, um eine eigene Fassung, ein eigenes Produkt oder einen eigenen Dienst als offiziell, als von Progmasoft gemacht, gebilligt oder unterstützt oder als Produkt von Progmasoft auszugeben. Werbung im Zusammenhang mit Progmasoft oder einem seiner Produkte muss sagen, dass sie sich auf Progmasoft oder dieses Produkt bezieht.",
          ],
        },
        {
          heading: "Forks, Beiträge und Code Dritter",
          paragraphs: [
            "Die Nutzungsbedingungen von GitHub erlauben dessen Nutzern, ein öffentliches Repository innerhalb von GitHub anzusehen und zu forken, und die Lizenz schränkt das nicht ein; ein Fork bleibt unter der Lizenz und wird nicht außerhalb von GitHub verbreitet.",
            "Beiträge sind willkommen. Wer beiträgt, gibt Progmasoft eine weite Lizenz an dem Beitrag, auch zur Neulizenzierung, und bestätigt, dazu berechtigt zu sein.",
            "Material Dritter in der Software behält seine eigene Lizenz und seine Hinweise.",
          ],
        },
        {
          heading: "Patente, Beendigung und Recht",
          paragraphs: [
            "Die Progmasoft Patent Grant 1.1 gilt, wo die Datei PATENTS.md der Software es sagt, für die Nutzungen, die die Lizenz erlaubt. Wer behauptet, die Software verletze ein Patent, verliert die Patentlizenzen, die er dafür erhalten hat.",
            "Ein Verstoß beendet die Lizenz. Ein erster Verstoß wird vergeben, wenn er binnen 30 Tagen nach einer Mitteilung von Progmasoft behoben wird.",
            "Die Software wird ohne Gewähr bereitgestellt, und die Haftung ist beschränkt, soweit das Gesetz es zulässt. Die Lizenz unterliegt dem Recht von England und Wales, zuständig sind die Gerichte von England und Wales mit Sitz in London.",
          ],
        },
        {
          heading: "Verwendung in einem Projekt",
          paragraphs: [
            "Ein Projekt kopiert den reinen Text nach LICENSES/LicenseRef-PM-SPL-1.0-only.txt oder LICENSES/LicenseRef-PM-SPL-1.0-or-later.txt und nennt diesen Bezeichner im SPDX-Kopf jeder Datei. Mit -only bleibt die Software unter Version 1.0; mit -or-later darf ein Nutzer eine spätere Version wählen, die Progmasoft veröffentlicht.",
            "Maßgeblich ist der reine Text. Die Fassungen in Markdown und reStructuredText enthalten dieselben Worte, nur ausgezeichnet. Neben jeder Datei liegt ihre SHA-256-Summe, und dieselben Dateien liegen im Repository Progmasoft/licenses.",
          ],
        },
      ],
    },
    faq: {
      description: "Kurze Antworten zur PM-SPL 1.0.",
      questions: [
        [
          "Ist die PM-SPL eine Open-Source-Lizenz?",
          "Nein. Der Quelltext ist öffentlich, aber die Verbreitung bleibt Progmasoft vorbehalten; die Lizenz erfüllt daher die Open Source Definition nicht.",
        ],
        [
          "Kostet sie etwas?",
          "Nein. Software unter der PM-SPL 1.0 wird kostenlos bereitgestellt.",
        ],
        [
          "Darf ich sie bei der Arbeit verwenden?",
          "Ja. Sie dürfen sie auf Rechnern bauen und ausführen, die Sie oder Ihre Organisation kontrollieren, für jeden Zweck, auch gewerblich.",
        ],
        [
          "Darf ich sie ändern?",
          "Ja, für den Gebrauch Ihrer Organisation, und Sie dürfen die Änderungen für sich behalten. Eine geänderte Fassung dürfen Sie niemandem außerhalb Ihrer Organisation geben.",
        ],
        [
          "Darf ich einen Build weitergeben oder veröffentlichen?",
          "Nein. Nur Progmasoft verbreitet die Software, zum Beispiel auf JetBrains Marketplace. Verweisen Sie andere auf die Veröffentlichung von Progmasoft.",
        ],
        [
          "Darf ich das Repository auf GitHub forken?",
          "Ja, innerhalb von GitHub, wie dessen Nutzungsbedingungen es erlauben. Der Fork bleibt unter der PM-SPL und wird nicht außerhalb von GitHub verbreitet.",
        ],
        [
          "Darf ich sie als Dienst für andere betreiben?",
          "Nein. Die Software oder im Wesentlichen daraus Abgeleitetes als gehosteten oder Netzwerkdienst anzubieten, ist verboten.",
        ],
        [
          "Darf ich beitragen?",
          "Ja. Beiträge sind willkommen; mit einem Beitrag geben Sie Progmasoft eine weite Lizenz daran, auch zur Neulizenzierung.",
        ],
        [
          "Ich habe eine Sicherheitslücke gefunden. Was tue ich?",
          "Nach Lücken zu suchen ist erlaubt. Schreiben Sie an support@progmasoft.com, was Sie gefunden haben.",
        ],
        [
          "Was geschieht, wenn ich gegen die Lizenz verstoße?",
          "Sie endet. Bei einem ersten Verstoß erhalten Sie Ihre Rechte zurück, wenn Sie ihn binnen 30 Tagen nach der Mitteilung von Progmasoft beheben.",
        ],
        [
          "Welche Version gilt für mich?",
          "Die, die die Software nennt: LicenseRef-PM-SPL-1.0-only ist allein Version 1.0; LicenseRef-PM-SPL-1.0-or-later lässt Sie eine spätere Version wählen, die Progmasoft veröffentlicht.",
        ],
        [
          "Welcher Text ist maßgeblich?",
          "Die Datei mit reinem Text. Die Dateien in Markdown und reStructuredText enthalten dieselben Worte; mit den SHA-256-Summen neben jeder Datei prüfen Sie, dass Sie den veröffentlichten Text haben.",
        ],
      ],
    },
    categories: {
      description:
        "Welche Lizenzen Dritter Software unter der PM-SPL verwenden darf, in den drei Kategorien der Apache Software Foundation.",
      intro:
        "Dies ist eine Regel, der Progmasoft für seine PM-SPL-Software folgt; sie ist nicht Teil des Lizenztexts. Sie entscheidet, welcher Code Dritter eine Abhängigkeit von PM-SPL-Software sein oder in sie kopiert werden darf.",
      category: "Kategorie",
      license: "Lizenz",
      identifier: "SPDX-Bezeichner",
      items: [
        {
          letter: "A",
          name: "Freizügig",
          rule: "Darf eine Abhängigkeit sein und hineinkopiert werden, mit ihren Hinweisen.",
          examples: examplesA,
        },
        {
          letter: "B",
          name: "Schwaches Copyleft",
          rule: "Nur unverändert, als eigener Teil, mit ihren Hinweisen; nie mit dem PM-SPL-Code vermischt.",
          examples: examplesB,
        },
        {
          letter: "X",
          name: "Starkes Copyleft",
          rule: "Nie: weder als Abhängigkeit noch hineinkopiert, da das ganze Werk sonst ihre Lizenz annehmen müsste.",
          examples: examplesX,
        },
      ],
    },
  },
  "ru-RU": {
    metadataTitle: "Лицензии Progmasoft",
    metadataDescription:
      "Лицензии, написанные Progmasoft: их тексты, что они разрешают и запрещают и как их применять.",
    name: "Progmasoft Proprietary Source License, версия 1.0",
    short: "PM-SPL 1.0",
    notice:
      "Эта страница объясняет лицензию, но не является ею. Действует опубликованный текст.",
    pages: {
      information: "Сведения",
      faq: "Вопросы и ответы",
      categories: "Лицензии третьих сторон",
    },
    texts: "Текст",
    sums: "Суммы SHA-256",
    identifiers: "Идентификаторы SPDX:",
    index: {
      title: "Лицензии Progmasoft",
      description:
        "Лицензии, которые Progmasoft написала для собственного программного обеспечения. У каждой есть неизменный опубликованный текст; изменение — это новая версия.",
      pmSpl:
        "Для программ, исходный код которых Progmasoft публикует, не делая их открытыми, например плагина Agenceland для IntelliJ IDEA. Бесплатно; исходный код можно читать, собирать, запускать и изменять для собственных нужд, а распространяет его только Progmasoft.",
    },
    information: {
      description:
        "Что такое PM-SPL 1.0, что она разрешает и запрещает и как проект её применяет.",
      sections: [
        {
          heading: "Что это",
          paragraphs: [
            "PM-SPL — лицензия с доступным исходным кодом: исходный код программы открыт для чтения, но сама лицензия не является лицензией с открытым исходным кодом. Лицензиар — Progmasoft, программа предоставляется бесплатно. Тот же текст служит лицензией конечного пользователя программы на JetBrains Marketplace.",
          ],
        },
        {
          heading: "Что она разрешает",
          paragraphs: [
            "Читать и изучать программу; собирать её и запускать на компьютерах, которыми управляете вы или ваша организация, для любых целей, в том числе коммерческих; изменять её для нужд вашей организации и сохранять изменения; искать уязвимости и сообщать о них Progmasoft; цитировать короткие фрагменты в задачах, обсуждениях и рецензиях.",
          ],
        },
        {
          heading: "Что она запрещает",
          paragraphs: [
            "Передавать программу или изменённую версию кому-либо за пределами вашей организации, в виде исходного кода или сборки: распространяет её только Progmasoft. Продавать, сдавать в аренду или сублицензировать её, а также включать в другой продукт. Предлагать её или то, что в основном из неё получено, как размещённый или сетевой сервис. Удалять уведомления об авторском праве, лицензии или авторстве и обходить технические меры, управляющие доступом к ней.",
          ],
        },
        {
          heading: "Названия и реклама",
          paragraphs: [
            "Лицензия не даёт права на названия Progmasoft, Agenceland или любого другого продукта Progmasoft, кроме как для указания происхождения программы. Никто не может использовать их или сходные до смешения названия, чтобы выдавать свою версию, продукт или сервис за официальные, созданные, одобренные или поддерживаемые Progmasoft или за продукт Progmasoft. Реклама, связанная с Progmasoft или её продуктом, должна указывать, что она относится к Progmasoft или к этому продукту.",
          ],
        },
        {
          heading: "Форки, вклад и код третьих сторон",
          paragraphs: [
            "Условия GitHub позволяют его пользователям просматривать публичный репозиторий и делать его форк внутри GitHub, и лицензия этого не ограничивает; форк остаётся под лицензией и не распространяется за пределами GitHub.",
            "Вклад приветствуется. Участник даёт Progmasoft широкую лицензию на свой вклад, включая перелицензирование, и подтверждает, что вправе это сделать.",
            "Материалы третьих сторон в программе сохраняют свои лицензии и уведомления.",
          ],
        },
        {
          heading: "Патенты, прекращение и право",
          paragraphs: [
            "Progmasoft Patent Grant 1.1 действует там, где об этом говорит файл PATENTS.md программы, для тех видов использования, которые разрешает лицензия. Тот, кто заявляет, что программа нарушает патент, теряет полученные для неё патентные лицензии.",
            "Нарушение прекращает действие лицензии. Первое нарушение прощается, если оно устранено в течение 30 дней после уведомления от Progmasoft.",
            "Программа предоставляется как есть, без гарантий, а ответственность ограничена в пределах, допускаемых законом. Лицензия регулируется правом Англии и Уэльса; споры рассматривают суды Англии и Уэльса в Лондоне.",
          ],
        },
        {
          heading: "Применение в проекте",
          paragraphs: [
            "Проект копирует простой текст в LICENSES/LicenseRef-PM-SPL-1.0-only.txt или LICENSES/LicenseRef-PM-SPL-1.0-or-later.txt и указывает этот идентификатор в заголовке SPDX каждого файла. С -only программа остаётся под версией 1.0; с -or-later пользователь может выбрать более позднюю версию, опубликованную Progmasoft.",
            "Каноническим является простой текст. Версии в Markdown и reStructuredText содержат те же слова, только с разметкой. Рядом с каждым файлом лежит его сумма SHA-256, а те же файлы находятся в репозитории Progmasoft/licenses.",
          ],
        },
      ],
    },
    faq: {
      description: "Короткие ответы о PM-SPL 1.0.",
      questions: [
        [
          "PM-SPL — лицензия с открытым исходным кодом?",
          "Нет. Исходный код открыт для чтения, но распространение остаётся за Progmasoft, поэтому лицензия не соответствует Open Source Definition.",
        ],
        [
          "Она платная?",
          "Нет. Программы под PM-SPL 1.0 предоставляются бесплатно.",
        ],
        [
          "Можно ли использовать её на работе?",
          "Да. Вы можете собирать и запускать её на компьютерах, которыми управляете вы или ваша организация, для любых целей, в том числе коммерческих.",
        ],
        [
          "Можно ли её изменять?",
          "Да, для нужд вашей организации, и изменения можно оставить себе. Передавать изменённую версию кому-либо за пределами организации нельзя.",
        ],
        [
          "Можно ли поделиться сборкой или опубликовать её?",
          "Нет. Программу распространяет только Progmasoft, например на JetBrains Marketplace. Направляйте других к выпуску Progmasoft.",
        ],
        [
          "Можно ли сделать форк репозитория на GitHub?",
          "Да, внутри GitHub, как позволяют его условия. Форк остаётся под PM-SPL и не распространяется за пределами GitHub.",
        ],
        [
          "Можно ли запускать её как сервис для других?",
          "Нет. Предлагать программу или то, что в основном из неё получено, как размещённый или сетевой сервис запрещено.",
        ],
        [
          "Можно ли вносить вклад?",
          "Да. Вклад приветствуется; внося его, вы даёте Progmasoft широкую лицензию на него, включая перелицензирование.",
        ],
        [
          "Я нашёл уязвимость. Что делать?",
          "Искать уязвимости разрешено. Напишите на support@progmasoft.com, что вы нашли.",
        ],
        [
          "Что будет, если я нарушу лицензию?",
          "Её действие прекратится. При первом нарушении права восстанавливаются, если вы устраните его в течение 30 дней после уведомления Progmasoft.",
        ],
        [
          "Какая версия действует для меня?",
          "Та, что указана в программе: LicenseRef-PM-SPL-1.0-only — только версия 1.0; LicenseRef-PM-SPL-1.0-or-later позволяет выбрать более позднюю версию, опубликованную Progmasoft.",
        ],
        [
          "Какой текст является основным?",
          "Файл с простым текстом. Файлы Markdown и reStructuredText содержат те же слова; суммы SHA-256 рядом с каждым файлом позволяют проверить, что у вас опубликованный текст.",
        ],
      ],
    },
    categories: {
      description:
        "Какие лицензии третьих сторон могут использовать программы под PM-SPL, в трёх категориях Apache Software Foundation.",
      intro:
        "Это правило, которому Progmasoft следует для своих программ под PM-SPL; оно не входит в текст лицензии. Оно определяет, какой код третьих сторон может быть зависимостью такой программы или быть в неё скопирован.",
      category: "Категория",
      license: "Лицензия",
      identifier: "Идентификатор SPDX",
      items: [
        {
          letter: "A",
          name: "Разрешительные",
          rule: "Может быть зависимостью и может быть скопирован, с сохранением уведомлений.",
          examples: examplesA,
        },
        {
          letter: "B",
          name: "Слабый копилефт",
          rule: "Только без изменений, отдельной частью, с уведомлениями; никогда не смешивается с кодом под PM-SPL.",
          examples: examplesB,
        },
        {
          letter: "X",
          name: "Сильный копилефт",
          rule: "Никогда: ни как зависимость, ни в виде копии, так как всё произведение должно было бы перейти под эту лицензию.",
          examples: examplesX,
        },
      ],
    },
  },
  "fr-FR": {
    metadataTitle: "Licences de Progmasoft",
    metadataDescription:
      "Les licences écrites par Progmasoft : leurs textes, ce qu’elles permettent et interdisent, et comment les utiliser.",
    name: "Progmasoft Proprietary Source License, version 1.0",
    short: "PM-SPL 1.0",
    notice:
      "Cette page explique la licence ; elle n’est pas la licence. C’est le texte publié qui s’applique.",
    pages: {
      information: "Informations",
      faq: "Questions et réponses",
      categories: "Licences tierces",
    },
    texts: "Le texte",
    sums: "Sommes SHA-256",
    identifiers: "Identifiants SPDX :",
    index: {
      title: "Licences de Progmasoft",
      description:
        "Des licences que Progmasoft a écrites pour ses propres logiciels. Chacune a un texte publié qui ne change pas ; une modification est une nouvelle version.",
      pmSpl:
        "Pour les logiciels dont Progmasoft publie la source sans en faire de l’open source, comme le plugin IntelliJ IDEA d’Agenceland. Gratuit ; la source peut être lue, compilée, exécutée et modifiée pour son propre usage, et seul Progmasoft la distribue.",
    },
    information: {
      description:
        "Ce qu’est la PM-SPL 1.0, ce qu’elle permet et interdit, et comment un projet l’utilise.",
      sections: [
        {
          heading: "Ce qu’elle est",
          paragraphs: [
            "La PM-SPL est une licence à source disponible : la source du logiciel est publique, mais la licence n’est pas une licence open source. Le concédant est Progmasoft, et le logiciel est fourni gratuitement. Le même texte sert de licence d’utilisateur final du logiciel sur JetBrains Marketplace.",
          ],
        },
        {
          heading: "Ce qu’elle permet",
          paragraphs: [
            "Lire et étudier le logiciel ; le compiler et l’exécuter sur des ordinateurs que vous ou votre organisation contrôlez, à toute fin, travail commercial compris ; le modifier pour l’usage de votre organisation et garder les modifications ; y chercher des vulnérabilités et les signaler à Progmasoft ; citer de courts extraits dans des tickets, des discussions et des revues.",
          ],
        },
        {
          heading: "Ce qu’elle interdit",
          paragraphs: [
            "Donner le logiciel ou une version modifiée à quiconque hors de votre organisation, en source ou en build : seul Progmasoft le distribue. Le vendre, le louer ou le sous-licencier, ou l’inclure dans un autre produit. L’offrir, ou ce qui en dérive pour l’essentiel, comme service hébergé ou en réseau. Retirer les mentions de droit d’auteur, de licence ou d’attribution, et contourner les mesures techniques qui en contrôlent l’accès.",
          ],
        },
        {
          heading: "Noms et publicité",
          paragraphs: [
            "La licence ne donne aucun droit sur les noms Progmasoft, Agenceland ou tout autre produit de Progmasoft, au-delà de la description de l’origine du logiciel. Personne ne peut les utiliser, ni des noms prêtant à confusion avec eux, pour présenter sa propre version, son produit ou son service comme officiel, comme fait, approuvé ou pris en charge par Progmasoft, ou comme un produit de Progmasoft. Une publicité liée à Progmasoft ou à l’un de ses produits doit indiquer qu’elle se rapporte à Progmasoft ou à ce produit.",
          ],
        },
        {
          heading: "Forks, contributions et code tiers",
          paragraphs: [
            "Les conditions de GitHub permettent à ses utilisateurs de consulter et de forker un dépôt public au sein de GitHub, et la licence ne restreint pas cela ; un fork reste sous la licence et n’est pas distribué hors de GitHub.",
            "Les contributions sont les bienvenues. Un contributeur accorde à Progmasoft une licence étendue sur sa contribution, relicenciement compris, et confirme en avoir le droit.",
            "Le matériel tiers présent dans le logiciel garde sa propre licence et ses mentions.",
          ],
        },
        {
          heading: "Brevets, résiliation et droit applicable",
          paragraphs: [
            "La Progmasoft Patent Grant 1.1 s’applique là où le fichier PATENTS.md du logiciel l’indique, pour les usages que la licence permet. Quiconque prétend que le logiciel enfreint un brevet perd les licences de brevet qu’il a reçues pour lui.",
            "Une violation met fin à la licence. Une première violation est pardonnée si elle est corrigée dans les 30 jours suivant une notification de Progmasoft.",
            "Le logiciel est fourni tel quel, sans garantie, et la responsabilité est limitée dans la mesure permise par la loi. La licence est régie par le droit de l’Angleterre et du pays de Galles, devant les tribunaux d’Angleterre et du pays de Galles siégeant à Londres.",
          ],
        },
        {
          heading: "L’utiliser dans un projet",
          paragraphs: [
            "Un projet copie le texte brut dans LICENSES/LicenseRef-PM-SPL-1.0-only.txt ou LICENSES/LicenseRef-PM-SPL-1.0-or-later.txt et indique cet identifiant dans l’en-tête SPDX de chaque fichier. Avec -only, le logiciel reste sous la version 1.0 ; avec -or-later, un utilisateur peut choisir une version ultérieure publiée par Progmasoft.",
            "Le texte brut fait foi. Les formes Markdown et reStructuredText portent les mêmes mots, seulement balisés. Chaque fichier a sa somme SHA-256 à côté de lui, et les mêmes fichiers se trouvent dans le dépôt Progmasoft/licenses.",
          ],
        },
      ],
    },
    faq: {
      description: "Des réponses courtes sur la PM-SPL 1.0.",
      questions: [
        [
          "La PM-SPL est-elle une licence open source ?",
          "Non. La source est publique, mais la distribution est réservée à Progmasoft ; la licence ne répond donc pas à l’Open Source Definition.",
        ],
        [
          "Coûte-t-elle quelque chose ?",
          "Non. Les logiciels sous PM-SPL 1.0 sont fournis gratuitement.",
        ],
        [
          "Puis-je l’utiliser au travail ?",
          "Oui. Vous pouvez le compiler et l’exécuter sur des ordinateurs que vous ou votre organisation contrôlez, à toute fin, travail commercial compris.",
        ],
        [
          "Puis-je le modifier ?",
          "Oui, pour l’usage de votre organisation, et vous pouvez garder les modifications pour vous. Vous ne pouvez pas donner une version modifiée à quiconque hors de votre organisation.",
        ],
        [
          "Puis-je partager un build ou le publier ?",
          "Non. Seul Progmasoft distribue le logiciel, par exemple sur JetBrains Marketplace. Renvoyez les autres vers la publication de Progmasoft.",
        ],
        [
          "Puis-je forker le dépôt sur GitHub ?",
          "Oui, au sein de GitHub, comme ses conditions le permettent. Le fork reste sous PM-SPL et n’est pas distribué hors de GitHub.",
        ],
        [
          "Puis-je le faire fonctionner comme service pour d’autres ?",
          "Non. Offrir le logiciel, ou ce qui en dérive pour l’essentiel, comme service hébergé ou en réseau est interdit.",
        ],
        [
          "Puis-je contribuer ?",
          "Oui. Les contributions sont les bienvenues ; en contribuant, vous accordez à Progmasoft une licence étendue sur votre contribution, relicenciement compris.",
        ],
        [
          "J’ai trouvé une faiblesse de sécurité. Que faire ?",
          "Chercher des vulnérabilités est permis. Écrivez à support@progmasoft.com en décrivant ce que vous avez trouvé.",
        ],
        [
          "Que se passe-t-il si j’enfreins la licence ?",
          "Elle prend fin. Pour une première violation, vos droits reviennent si vous la corrigez dans les 30 jours suivant la notification de Progmasoft.",
        ],
        [
          "Quelle version s’applique à moi ?",
          "Celle que nomme le logiciel : LicenseRef-PM-SPL-1.0-only est la seule version 1.0 ; LicenseRef-PM-SPL-1.0-or-later vous laisse choisir une version ultérieure publiée par Progmasoft.",
        ],
        [
          "Quel texte fait foi ?",
          "Le fichier en texte brut. Les fichiers Markdown et reStructuredText portent les mêmes mots ; les sommes SHA-256 à côté de chaque fichier vous permettent de vérifier que vous avez le texte publié.",
        ],
      ],
    },
    categories: {
      description:
        "Les licences tierces que peuvent utiliser les logiciels sous PM-SPL, dans les trois catégories de l’Apache Software Foundation.",
      intro:
        "C’est une règle que Progmasoft suit pour ses logiciels sous PM-SPL ; elle ne fait pas partie du texte de la licence. Elle décide quel code tiers peut être une dépendance d’un logiciel sous PM-SPL ou y être copié.",
      category: "Catégorie",
      license: "Licence",
      identifier: "Identifiant SPDX",
      items: [
        {
          letter: "A",
          name: "Permissives",
          rule: "Peut être une dépendance et peut être copié, avec ses mentions conservées.",
          examples: examplesA,
        },
        {
          letter: "B",
          name: "Copyleft faible",
          rule: "Seulement sans modification, comme partie séparée, avec ses mentions ; jamais mêlé au code sous PM-SPL.",
          examples: examplesB,
        },
        {
          letter: "X",
          name: "Copyleft fort",
          rule: "Jamais : ni comme dépendance ni copié, car toute l’œuvre devrait alors prendre sa licence.",
          examples: examplesX,
        },
      ],
    },
  },
};

export function getLicenseMessages(locale: Locale): LicenseMessages {
  return licenseMessages[locale];
}
