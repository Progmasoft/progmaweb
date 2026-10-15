// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Locale } from "./localization";

/**
 * A catalog ViGet lists. A catalog with a path is open and links to its page; one without is not
 * offered yet and is shown disabled.
 */
export type Catalog = {
  readonly name: string;
  readonly path?: string;
};

/** The languages whose packages ViGet hosts, in the order the page lists them. */
export const languageCatalogs: readonly Catalog[] = [
  { name: "Tala", path: "/langs/tala" },
  { name: "C++" },
];

/** The build systems whose DSL plugins ViGet hosts, in the order the page lists them. */
export const buildSystemCatalogs: readonly Catalog[] = [
  { name: "Tazel", path: "/dslplugins/tazel" },
  { name: "Gradle" },
];

// The two section names are the ones the registry uses everywhere; they are
// not translated, like the product names below them.
export const languagesHeading = "LANGUAGES";
export const buildSystemsHeading = "BUILD SYSTEM DSL PLUGINS";

type CatalogText = {
  statusEyebrow: string;
  languagesDescription: string;
  buildSystemsDescription: string;
  /** What each open catalog holds, by catalog name. */
  holds: Record<string, string>;
  notAvailable: string;
  open: string;
  talaTitle: string;
  talaDescription: string;
  talaEmptyTitle: string;
  talaEmptyDescription: string;
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
      Tala: "Libraries and applications written in Tala.",
      Tazel: "Kotlin JAR plugins for the BUILD.kts of Tazel.",
    },
    notAvailable: "Not available yet",
    open: "Open catalog",
    talaTitle: "Tala packages",
    talaDescription:
      "Libraries and applications written in Tala, distributed as .vipkg artifacts and published under a Progmasoft Account.",
    talaEmptyTitle: "No Tala packages yet.",
    talaEmptyDescription:
      "The catalog is ready and intentionally contains no placeholder packages. Publishing opens with the ViGet client of Tazel.",
    tazelTitle: "Tazel DSL plugins",
    tazelDescription:
      "Kotlin JAR plugins that extend the project file of Tazel, the build system of Tala. They are separate from .vipkg packages.",
    backToRegistry: "Back to ViGet",
  },
  "de-DE": {
    statusEyebrow: "ViGet-Status",
    languagesDescription:
      "Pakete, die in einer Sprache geschrieben sind, als .vipkg-Artefakte.",
    buildSystemsDescription:
      "Plugins, die die Projektdatei eines Build-Systems erweitern.",
    holds: {
      Tala: "Bibliotheken und Anwendungen, geschrieben in Tala.",
      Tazel: "Kotlin-JAR-Plugins für die BUILD.kts von Tazel.",
    },
    notAvailable: "Noch nicht verfügbar",
    open: "Katalog öffnen",
    talaTitle: "Tala-Pakete",
    talaDescription:
      "Bibliotheken und Anwendungen in Tala, verteilt als .vipkg-Artefakte und veröffentlicht unter einem Progmasoft-Konto.",
    talaEmptyTitle: "Noch keine Tala-Pakete.",
    talaEmptyDescription:
      "Der Katalog ist bereit und enthält bewusst keine Platzhalterpakete. Die Veröffentlichung öffnet mit dem ViGet-Client von Tazel.",
    tazelTitle: "Tazel-DSL-Plugins",
    tazelDescription:
      "Kotlin-JAR-Plugins, die die Projektdatei von Tazel, dem Build-System von Tala, erweitern. Sie sind von .vipkg-Paketen getrennt.",
    backToRegistry: "Zurück zu ViGet",
  },
  "ru-RU": {
    statusEyebrow: "Состояние ViGet",
    languagesDescription:
      "Пакеты, написанные на языке, в виде артефактов .vipkg.",
    buildSystemsDescription:
      "Плагины, расширяющие файл проекта системы сборки.",
    holds: {
      Tala: "Библиотеки и приложения, написанные на Tala.",
      Tazel: "Плагины Kotlin JAR для BUILD.kts системы Tazel.",
    },
    notAvailable: "Пока недоступно",
    open: "Открыть каталог",
    talaTitle: "Пакеты Tala",
    talaDescription:
      "Библиотеки и приложения на Tala, распространяемые как артефакты .vipkg и публикуемые от имени учётной записи Progmasoft.",
    talaEmptyTitle: "Пакетов Tala пока нет.",
    talaEmptyDescription:
      "Каталог готов и намеренно не содержит пакетов-заглушек. Публикация откроется вместе с клиентом ViGet в Tazel.",
    tazelTitle: "DSL-плагины Tazel",
    tazelDescription:
      "Плагины Kotlin JAR, расширяющие файл проекта Tazel, системы сборки Tala. Они отделены от пакетов .vipkg.",
    backToRegistry: "Назад к ViGet",
  },
  "he-IL": {
    statusEyebrow: "מצב ViGet",
    languagesDescription: "חבילות שנכתבו בשפה, כתוצרי ‎.vipkg.",
    buildSystemsDescription: "תוספים שמרחיבים את קובץ הפרויקט של מערכת בנייה.",
    holds: {
      Tala: "ספריות ויישומים שנכתבו ב-Tala.",
      Tazel: "תוספי Kotlin JAR עבור BUILD.kts של Tazel.",
    },
    notAvailable: "עוד לא זמין",
    open: "פתיחת הקטלוג",
    talaTitle: "חבילות Tala",
    talaDescription:
      "ספריות ויישומים ב-Tala, שמופצים כתוצרי ‎.vipkg ומתפרסמים תחת חשבון Progmasoft.",
    talaEmptyTitle: "עוד אין חבילות Tala.",
    talaEmptyDescription:
      "הקטלוג מוכן, ובכוונה אין בו חבילות ממלאות מקום. הפרסום ייפתח יחד עם לקוח ה-ViGet של Tazel.",
    tazelTitle: "תוספי DSL של Tazel",
    tazelDescription:
      "תוספי Kotlin JAR שמרחיבים את קובץ הפרויקט של Tazel, מערכת הבנייה של Tala. הם נפרדים מחבילות ‎.vipkg.",
    backToRegistry: "חזרה ל-ViGet",
  },
};

/** The text of the ViGet catalogs in [locale]. */
export function catalogText(locale: Locale): CatalogText {
  return text[locale];
}
