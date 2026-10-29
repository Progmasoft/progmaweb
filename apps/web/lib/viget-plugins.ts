// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Locale } from "./localization";

/** A Tazel plugin as the list of the catalog shows it. */
export type TazelPluginSummary = {
  readonly publisher: string;
  readonly name: string;
  readonly description: string | null;
  readonly license: string | null;
  readonly latestVersion: string;
  readonly updatedAt: string;
};

/** One published version of a Tazel plugin. */
export type TazelPluginVersion = {
  readonly version: string;
  readonly sha256: string;
  readonly apiVersion: number;
  readonly size: number;
  readonly publishedAt: string;
  readonly yanked: boolean;
  /** The address of the JAR on the ViGet host. */
  readonly path: string;
};

/** A Tazel plugin with everything its page shows. */
export type TazelPlugin = {
  readonly publisher: string;
  readonly name: string;
  readonly description: string | null;
  readonly authors: readonly string[];
  readonly license: string | null;
  readonly homepage: string | null;
  readonly repository: string | null;
  readonly latestVersion: string;
  readonly versions: readonly TazelPluginVersion[];
};

/** A Gradle plugin the catalog lists; Gradle downloads it from the Gradle Plugin Portal. */
export type GradlePlugin = {
  readonly id: string;
  readonly description: Record<Locale, string>;
  readonly usage: string;
};

/** The Gradle plugins of Progmasoft. */
export const gradlePlugins: readonly GradlePlugin[] = [
  {
    id: "com.progmasoft.tazel.plugin",
    description: {
      "en-US":
        "Builds plugins of the Tazel project file: adds the Tazel API as tazelApi() and writes the descriptor of the plugin from tazelPlugin { }.",
      "de-DE":
        "Baut Plugins für die Projektdatei von Tazel: stellt die Tazel-API als tazelApi() bereit und schreibt den Deskriptor des Plugins aus tazelPlugin { }.",
      "ru-RU":
        "Собирает плагины для файла проекта Tazel: добавляет API Tazel как tazelApi() и записывает дескриптор плагина из tazelPlugin { }.",
      "he-IL":
        "בונה תוספים לקובץ הפרויקט של Tazel: מוסיף את ה-API של Tazel כ-tazelApi() וכותב את מתאר התוסף מתוך tazelPlugin { }.",
    },
    usage: 'plugins {\n  id("com.progmasoft.tazel.plugin") version "0.2.0"\n}',
  },
];

// The pages run on the server, beside the API on its loopback address. Nginx
// does not pass /api/ of the ViGet host on, so these addresses stay private.
const apiOrigin = process.env.PROGMAWEB_API_ORIGIN ?? "http://127.0.0.1:5085";

async function read<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(
      `${apiOrigin}/api/v1/viget/dslplugins/tazel${path}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
    );
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    // An unreachable API shows an empty catalog rather than an error page.
    return null;
  }
}

/** Every Tazel plugin of the catalog; empty when the API cannot be reached. */
export async function tazelPlugins(): Promise<readonly TazelPluginSummary[]> {
  const list = await read<{ plugins: TazelPluginSummary[] }>("");
  return list?.plugins ?? [];
}

/** A Tazel plugin by its exact publisher and name, or null. */
export async function tazelPlugin(
  publisher: string,
  name: string,
): Promise<TazelPlugin | null> {
  const identifier = /^[A-Za-z_][A-Za-z0-9_]*$/;
  if (!identifier.test(publisher) || !identifier.test(name)) return null;
  return read<TazelPlugin>(`/${publisher}/${name}`);
}

/** The declaration a project file writes to use a plugin. */
export function pluginDeclaration(
  plugin: { publisher: string; name: string },
  version: string,
): string {
  return `plugins {\n  plugin("${plugin.publisher}") {\n    name = "${plugin.name}"\n    version = "${version}"\n  }\n}`;
}

type PluginText = {
  catalogTitle: string;
  catalogEmpty: string;
  latest: string;
  license: string;
  authors: string;
  homepage: string;
  repository: string;
  versions: string;
  version: string;
  published: string;
  api: string;
  size: string;
  yanked: string;
  download: string;
  usage: string;
  usageDescription: string;
  publisherLabel: string;
  backToCatalog: string;
  notFoundTitle: string;
  notFoundDescription: string;
  gradleTitle: string;
  gradleDescription: string;
  gradlePortal: string;
};

const text: Record<Locale, PluginText> = {
  "en-US": {
    catalogTitle: "Published plugins",
    catalogEmpty: "No plugin is published yet.",
    latest: "Latest",
    license: "License",
    authors: "Authors",
    homepage: "Homepage",
    repository: "Repository",
    versions: "Versions",
    version: "Version",
    published: "Published",
    api: "Plugin API",
    size: "Size",
    yanked: "Yanked",
    download: "JAR",
    usage: "Use it",
    usageDescription:
      "Declare the plugin at the top of BUILD.kts; Tazel downloads it from ViGet and checks its SHA-256.",
    publisherLabel: "Publisher",
    backToCatalog: "Back to the Tazel catalog",
    notFoundTitle: "No such plugin.",
    notFoundDescription:
      "ViGet has no Tazel plugin with this publisher and name.",
    gradleTitle: "Gradle plugins",
    gradleDescription:
      "Gradle plugins of Progmasoft. ViGet lists them; Gradle downloads them from the Gradle Plugin Portal.",
    gradlePortal: "Gradle Plugin Portal",
  },
  "de-DE": {
    catalogTitle: "Veröffentlichte Plugins",
    catalogEmpty: "Noch ist kein Plugin veröffentlicht.",
    latest: "Neueste",
    license: "Lizenz",
    authors: "Autoren",
    homepage: "Website",
    repository: "Repository",
    versions: "Versionen",
    version: "Version",
    published: "Veröffentlicht",
    api: "Plugin-API",
    size: "Größe",
    yanked: "Zurückgezogen",
    download: "JAR",
    usage: "Verwenden",
    usageDescription:
      "Deklarieren Sie das Plugin oben in BUILD.kts; Tazel lädt es von ViGet und prüft seine SHA-256.",
    publisherLabel: "Herausgeber",
    backToCatalog: "Zurück zum Tazel-Katalog",
    notFoundTitle: "Kein solches Plugin.",
    notFoundDescription:
      "ViGet hat kein Tazel-Plugin mit diesem Herausgeber und Namen.",
    gradleTitle: "Gradle-Plugins",
    gradleDescription:
      "Gradle-Plugins von Progmasoft. ViGet listet sie; Gradle lädt sie vom Gradle Plugin Portal.",
    gradlePortal: "Gradle Plugin Portal",
  },
  "ru-RU": {
    catalogTitle: "Опубликованные плагины",
    catalogEmpty: "Пока не опубликовано ни одного плагина.",
    latest: "Последняя",
    license: "Лицензия",
    authors: "Авторы",
    homepage: "Сайт",
    repository: "Репозиторий",
    versions: "Версии",
    version: "Версия",
    published: "Опубликована",
    api: "API плагинов",
    size: "Размер",
    yanked: "Отозвана",
    download: "JAR",
    usage: "Использование",
    usageDescription:
      "Объявите плагин в начале BUILD.kts; Tazel загрузит его из ViGet и проверит SHA-256.",
    publisherLabel: "Издатель",
    backToCatalog: "Назад к каталогу Tazel",
    notFoundTitle: "Такого плагина нет.",
    notFoundDescription:
      "В ViGet нет плагина Tazel с таким издателем и именем.",
    gradleTitle: "Плагины Gradle",
    gradleDescription:
      "Плагины Gradle от Progmasoft. ViGet перечисляет их; Gradle загружает их с Gradle Plugin Portal.",
    gradlePortal: "Gradle Plugin Portal",
  },
  "he-IL": {
    catalogTitle: "תוספים שפורסמו",
    catalogEmpty: "עדיין לא פורסם אף תוסף.",
    latest: "אחרונה",
    license: "רישיון",
    authors: "מחברים",
    homepage: "אתר",
    repository: "מאגר",
    versions: "גרסאות",
    version: "גרסה",
    published: "פורסמה",
    api: "API של תוספים",
    size: "גודל",
    yanked: "נמשכה",
    download: "JAR",
    usage: "שימוש",
    usageDescription:
      "הצהירו על התוסף בראש BUILD.kts; ‏Tazel מוריד אותו מ-ViGet ובודק את ה-SHA-256 שלו.",
    publisherLabel: "מפרסם",
    backToCatalog: "חזרה לקטלוג של Tazel",
    notFoundTitle: "אין תוסף כזה.",
    notFoundDescription: "ב-ViGet אין תוסף Tazel עם המפרסם והשם האלה.",
    gradleTitle: "תוספי Gradle",
    gradleDescription:
      "תוספי Gradle של Progmasoft. ‏ViGet מציג אותם; Gradle מוריד אותם מ-Gradle Plugin Portal.",
    gradlePortal: "Gradle Plugin Portal",
  },
};

/** The text of the plugin pages in [locale]. */
export function pluginText(locale: Locale): PluginText {
  return text[locale];
}
