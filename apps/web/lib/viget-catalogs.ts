// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

/**
 * A catalog ViGet lists. A catalog with a path is open and links to its page; one without is not
 * offered yet and is shown disabled.
 */
export type Catalog = {
  readonly name: string;
  readonly path?: string;
};

/** The languages ViGet hosts packages of, by the last segment of their path. */
export const languageSlugs = ["c", "cpp", "objc"] as const;

/** One language catalog, such as `c` for /langs/c. */
export type LanguageSlug = (typeof languageSlugs)[number];

/** Whether [value] names a language catalog. */
export function isLanguageSlug(value: string): value is LanguageSlug {
  return (languageSlugs as readonly string[]).includes(value);
}

/** The name of each language as the catalogs spell it; names are not translated. */
export const languageNames: Record<LanguageSlug, string> = {
  c: "C",
  cpp: "C++",
  objc: "Objective-C",
};

/** The languages whose packages ViGet hosts, in the order the page lists them. */
export const languageCatalogs: readonly Catalog[] = languageSlugs.map(
  (slug) => ({
    name: languageNames[slug],
    path: `/langs/${slug}`,
  }),
);

/** The build systems whose DSL plugins ViGet hosts, in the order the page lists them. */
export const buildSystemCatalogs: readonly Catalog[] = [
  { name: "Tazel", path: "/dslplugins/tazel" },
  { name: "Gradle", path: "/dslplugins/gradle" },
];

// The two section names are the ones the registry uses everywhere; they are
// not translated, like the product names below them.
export const languagesHeading = "LANGUAGES";
export const buildSystemsHeading = "BUILD SYSTEM DSL PLUGINS";

/** The words of the page of one language catalog. */
type LanguageText = {
  title: string;
  description: string;
  emptyTitle: string;
};

type CatalogText = {
  statusEyebrow: string;
  languagesDescription: string;
  buildSystemsDescription: string;
  /** What each open catalog holds, by catalog name. */
  holds: Record<string, string>;
  notAvailable: string;
  open: string;
  languages: Record<LanguageSlug, LanguageText>;
  languageEmptyDescription: string;
  tazelTitle: string;
  tazelDescription: string;
  backToRegistry: string;
};

const text: Record<Locale, CatalogText> = {
  "en-US": {
    statusEyebrow: "ViGet status",
    languagesDescription:
      "Packages written in a language, as .vipkg artifacts.",
    buildSystemsDescription:
      "Plugins that extend the project file of a build system.",
    holds: {
      C: "Libraries and applications written in C.",
      "C++": "Libraries and applications written in C++.",
      "Objective-C":
        "Libraries and applications written in Objective-C and Objective-C++.",
      Tazel: "Kotlin JAR plugins for the project file of Tazel.",
      Gradle: "Gradle plugins of Progmasoft, from the Gradle Plugin Portal.",
    },
    notAvailable: "Not available yet",
    open: "Open catalog",
    languages: {
      c: {
        title: "C packages",
        description:
          "Libraries and applications written in C, distributed as .vipkg artifacts and published under a Progmasoft Account.",
        emptyTitle: "No C packages yet.",
      },
      cpp: {
        title: "C++ packages",
        description:
          "Libraries and applications written in C++, distributed as .vipkg artifacts and published under a Progmasoft Account.",
        emptyTitle: "No C++ packages yet.",
      },
      objc: {
        title: "Objective-C packages",
        description:
          "Libraries and applications written in Objective-C and Objective-C++, distributed as .vipkg artifacts and published under a Progmasoft Account.",
        emptyTitle: "No Objective-C packages yet.",
      },
    },
    languageEmptyDescription:
      "The catalog is ready and intentionally contains no placeholder packages. Publishing opens with the ViGet client of Tazel.",
    tazelTitle: "Tazel DSL plugins",
    tazelDescription:
      "Kotlin JAR plugins that extend the project file of Tazel, the build system for C, C++, Objective-C, Objective-C++ and Zig. They are separate from .vipkg packages.",
    backToRegistry: "Back to ViGet",
  },
  "de-DE": {
    statusEyebrow: "ViGet-Status",
    languagesDescription:
      "Pakete, die in einer Sprache geschrieben sind, als .vipkg-Artefakte.",
    buildSystemsDescription:
      "Plugins, die die Projektdatei eines Build-Systems erweitern.",
    holds: {
      C: "Bibliotheken und Anwendungen, geschrieben in C.",
      "C++": "Bibliotheken und Anwendungen, geschrieben in C++.",
      "Objective-C":
        "Bibliotheken und Anwendungen, geschrieben in Objective-C und Objective-C++.",
      Tazel: "Kotlin-JAR-Plugins für die Projektdatei von Tazel.",
      Gradle: "Gradle-Plugins von Progmasoft, vom Gradle Plugin Portal.",
    },
    notAvailable: "Noch nicht verfügbar",
    open: "Katalog öffnen",
    languages: {
      c: {
        title: "C-Pakete",
        description:
          "Bibliotheken und Anwendungen in C, verteilt als .vipkg-Artefakte und veröffentlicht unter einem Progmasoft-Konto.",
        emptyTitle: "Noch keine C-Pakete.",
      },
      cpp: {
        title: "C++-Pakete",
        description:
          "Bibliotheken und Anwendungen in C++, verteilt als .vipkg-Artefakte und veröffentlicht unter einem Progmasoft-Konto.",
        emptyTitle: "Noch keine C++-Pakete.",
      },
      objc: {
        title: "Objective-C-Pakete",
        description:
          "Bibliotheken und Anwendungen in Objective-C und Objective-C++, verteilt als .vipkg-Artefakte und veröffentlicht unter einem Progmasoft-Konto.",
        emptyTitle: "Noch keine Objective-C-Pakete.",
      },
    },
    languageEmptyDescription:
      "Der Katalog ist bereit und enthält bewusst keine Platzhalterpakete. Die Veröffentlichung öffnet mit dem ViGet-Client von Tazel.",
    tazelTitle: "Tazel-DSL-Plugins",
    tazelDescription:
      "Kotlin-JAR-Plugins, die die Projektdatei von Tazel erweitern, dem Build-System für C, C++, Objective-C, Objective-C++ und Zig. Sie sind von .vipkg-Paketen getrennt.",
    backToRegistry: "Zurück zu ViGet",
  },
  "ru-RU": {
    statusEyebrow: "Состояние ViGet",
    languagesDescription:
      "Пакеты, написанные на языке, в виде артефактов .vipkg.",
    buildSystemsDescription:
      "Плагины, расширяющие файл проекта системы сборки.",
    holds: {
      C: "Библиотеки и приложения, написанные на C.",
      "C++": "Библиотеки и приложения, написанные на C++.",
      "Objective-C":
        "Библиотеки и приложения, написанные на Objective-C и Objective-C++.",
      Tazel: "Плагины Kotlin JAR для файла проекта Tazel.",
      Gradle: "Плагины Gradle от Progmasoft, с Gradle Plugin Portal.",
    },
    notAvailable: "Пока недоступно",
    open: "Открыть каталог",
    languages: {
      c: {
        title: "Пакеты C",
        description:
          "Библиотеки и приложения на C, распространяемые как артефакты .vipkg и публикуемые от имени учётной записи Progmasoft.",
        emptyTitle: "Пакетов C пока нет.",
      },
      cpp: {
        title: "Пакеты C++",
        description:
          "Библиотеки и приложения на C++, распространяемые как артефакты .vipkg и публикуемые от имени учётной записи Progmasoft.",
        emptyTitle: "Пакетов C++ пока нет.",
      },
      objc: {
        title: "Пакеты Objective-C",
        description:
          "Библиотеки и приложения на Objective-C и Objective-C++, распространяемые как артефакты .vipkg и публикуемые от имени учётной записи Progmasoft.",
        emptyTitle: "Пакетов Objective-C пока нет.",
      },
    },
    languageEmptyDescription:
      "Каталог готов и намеренно не содержит пакетов-заглушек. Публикация откроется вместе с клиентом ViGet в Tazel.",
    tazelTitle: "DSL-плагины Tazel",
    tazelDescription:
      "Плагины Kotlin JAR, расширяющие файл проекта Tazel — системы сборки для C, C++, Objective-C, Objective-C++ и Zig. Они отделены от пакетов .vipkg.",
    backToRegistry: "Назад к ViGet",
  },
  "fr-FR": {
    statusEyebrow: "État de ViGet",
    languagesDescription:
      "Des paquets écrits dans un langage, sous forme d’artefacts .vipkg.",
    buildSystemsDescription:
      "Des plugins qui étendent le fichier de projet d’un système de build.",
    holds: {
      C: "Bibliothèques et applications écrites en C.",
      "C++": "Bibliothèques et applications écrites en C++.",
      "Objective-C":
        "Bibliothèques et applications écrites en Objective-C et en Objective-C++.",
      Tazel: "Des plugins JAR Kotlin pour le fichier de projet de Tazel.",
      Gradle:
        "Les plugins Gradle de Progmasoft, depuis le Gradle Plugin Portal.",
    },
    notAvailable: "Pas encore disponible",
    open: "Ouvrir le catalogue",
    languages: {
      c: {
        title: "Paquets C",
        description:
          "Bibliothèques et applications écrites en C, distribuées sous forme d’artefacts .vipkg et publiées sous un compte Progmasoft.",
        emptyTitle: "Aucun paquet C pour l’instant.",
      },
      cpp: {
        title: "Paquets C++",
        description:
          "Bibliothèques et applications écrites en C++, distribuées sous forme d’artefacts .vipkg et publiées sous un compte Progmasoft.",
        emptyTitle: "Aucun paquet C++ pour l’instant.",
      },
      objc: {
        title: "Paquets Objective-C",
        description:
          "Bibliothèques et applications écrites en Objective-C et en Objective-C++, distribuées sous forme d’artefacts .vipkg et publiées sous un compte Progmasoft.",
        emptyTitle: "Aucun paquet Objective-C pour l’instant.",
      },
    },
    languageEmptyDescription:
      "Le catalogue est prêt et ne contient volontairement aucun paquet factice. La publication ouvrira avec le client ViGet de Tazel.",
    tazelTitle: "Plugins DSL de Tazel",
    tazelDescription:
      "Des plugins JAR Kotlin qui étendent le fichier de projet de Tazel, le système de build pour C, C++, Objective-C, Objective-C++ et Zig. Ils sont distincts des paquets .vipkg.",
    backToRegistry: "Retour à ViGet",
  },
};

/** The text of the ViGet catalogs in [locale]. */
export function catalogText(locale: Locale): CatalogText {
  return text[locale];
}
