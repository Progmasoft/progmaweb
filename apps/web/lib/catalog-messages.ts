// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

type Slug = "tazel" | "catch3" | "agenceland" | "archer" | "etincelle";
type Category = "build" | "testing" | "ide" | "data-format" | "data-processing";

interface ProductText {
  tagline: string;
  description: string;
  features: string[];
}

/** The text of product.progmasoft.com in one language. */
export interface CatalogMessages {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  site: string;
  source: string;
  issues: string;
  /** The heading of what a released project does. */
  features: string;
  /** The heading of what a project in development is being built to do. */
  featuresPlanned: string;
  back: string;
  stats: {
    projects: string;
    released: string;
    development: string;
    languages: string;
  };
  search: {
    label: string;
    placeholder: string;
    category: string;
    language: string;
    status: string;
    any: string;
    submit: string;
    reset: string;
    /** `{count}` is the number of projects found. */
    results: string;
    none: string;
  };
  views: {
    all: string;
    categories: string;
    languages: string;
    releases: string;
    label: string;
  };
  table: {
    name: string;
    category: string;
    language: string;
    status: string;
    release: string;
  };
  facts: {
    status: string;
    category: string;
    language: string;
    license: string;
    release: string;
    started: string;
    none: string;
  };
  statuses: { released: string; development: string };
  categories: Record<Category, string>;
  categoriesTitle: string;
  categoriesDescription: string;
  languagesTitle: string;
  languagesDescription: string;
  releasesTitle: string;
  releasesDescription: string;
  latestReleases: string;
  noReleases: string;
  products: Record<Slug, ProductText>;
}

export const catalogMessages: Record<Locale, CatalogMessages> = {
  "en-US": {
    metadataTitle: "Products",
    metadataDescription:
      "The projects of Progmasoft: Tazel, Catch3, Agenceland, Archer and Etincelle, by category, language and status.",
    eyebrow: "Progmasoft projects",
    title: "Products",
    description:
      "Every project of Progmasoft, with what it is, the language it is written in, where it stands and where it lives. Search them, or browse by category, by language or by release.",
    site: "Visit the site",
    source: "Source code",
    issues: "Issues",
    features: "What it does",
    featuresPlanned: "What it is being built to do",
    back: "All projects",
    stats: {
      projects: "Projects",
      released: "Released",
      development: "In development",
      languages: "Languages",
    },
    search: {
      label: "Search the projects",
      placeholder: "Name or keyword",
      category: "Category",
      language: "Language",
      status: "Status",
      any: "Any",
      submit: "Search",
      reset: "Clear",
      results: "{count} project(s)",
      none: "No project matches this search.",
    },
    views: {
      label: "Browse",
      all: "All projects",
      categories: "By category",
      languages: "By language",
      releases: "Releases",
    },
    table: {
      name: "Project",
      category: "Category",
      language: "Language",
      status: "Status",
      release: "Latest release",
    },
    facts: {
      status: "Status",
      category: "Category",
      language: "Language",
      license: "License",
      release: "Latest release",
      started: "Started",
      none: "None yet",
    },
    statuses: { released: "Released", development: "In development" },
    categories: {
      build: "Build system",
      testing: "Testing",
      ide: "IDE",
      "data-format": "Data format",
      "data-processing": "Data processing",
    },
    categoriesTitle: "Projects by category",
    categoriesDescription: "What each project is for.",
    languagesTitle: "Projects by language",
    languagesDescription: "The language each project is written in.",
    releasesTitle: "Releases",
    releasesDescription:
      "The latest release of every project that has one, newest first.",
    latestReleases: "Latest releases",
    noReleases: "No releases yet.",
    products: {
      tazel: {
        tagline: "Builds C, C++, Objective-C, Objective-C++ and Zig.",
        description:
          "Tazel reads a module from MODULE.kts and one BUILD.kts per package, compiles each translation unit on its own and builds again only what changed.",
        features: [
          "Kotlin project files, MODULE.kts and BUILD.kts, with labels such as //app/:greeter",
          "Clang, GCC and zig cc from the machine; cross builds by LLVM target triple",
          "Incremental per action, by the content of every input",
          "Tests, formatting and linting built in",
        ],
      },
      catch3: {
        tagline: "C++ testing beyond assertions.",
        description:
          "Catch3 keeps Catch2 compatibility and adds a runner of its own, property tests, mocks, snapshots and structured results.",
        features: [
          "Catch2-compatible tests",
          "Property, stateful and metamorphic tests with shrinking",
          "Text snapshots and JUnit-style XML results",
          "Its own runner with parallel workers, retries, history and per-test coverage, and mocks",
        ],
      },
      agenceland: {
        tagline: "An agentic IDE built on Code - OSS.",
        description:
          "Agenceland puts agents at the center of the editor: each session works in its own Git worktree and sandbox, under a permission mode you choose, and its record can be replayed.",
        features: [
          "Models from OpenAI, Anthropic, OpenRouter, Kimi and Z.ai, and local ones through LM Studio or Ollama",
          "One Git worktree and one sandbox for every agent session",
          "Live review of what an agent writes, and replay from the session record",
          "Extensions from Open VSX",
        ],
      },
      archer: {
        tagline: "A columnar in-memory format for Java and the JVM.",
        description:
          "Archer lays out columnar data in memory outside the Java heap, for Java 21 and later and the JVM languages that call Java, such as Kotlin and Scala. It plays the part Apache Arrow plays.",
        features: [
          "Buffers outside the Java heap with checked, little-endian access",
          "Allocators with a limit, a count of their memory and leak detection",
          "An allocator on Netty's pooled buffers",
          "Columnar vectors with validity bitmaps",
        ],
      },
      etincelle: {
        tagline: "An engine for large data on Java and the JVM.",
        description:
          "Etincelle processes large data on Java 21 and later and the JVM languages that call Java, in the part Apache Spark plays. Its columnar data lives in Archer.",
        features: [
          "Typed schemas and columns",
          "Etincelle SQL",
          "Columnar data in Archer",
          "For Java, Kotlin and Scala",
        ],
      },
    },
  },
  "de-DE": {
    metadataTitle: "Produkte",
    metadataDescription:
      "Die Projekte von Progmasoft: Tazel, Catch3, Agenceland, Archer und Etincelle, nach Kategorie, Sprache und Stand.",
    eyebrow: "Progmasoft-Projekte",
    title: "Produkte",
    description:
      "Alle Projekte von Progmasoft: was sie sind, in welcher Sprache sie geschrieben sind, wie weit sie sind und wo sie zu Hause sind. Durchsuchen Sie sie oder blättern Sie nach Kategorie, Sprache oder Release.",
    site: "Zur Website",
    source: "Quellcode",
    issues: "Issues",
    features: "Was es kann",
    featuresPlanned: "Wofür es entwickelt wird",
    back: "Alle Projekte",
    stats: {
      projects: "Projekte",
      released: "Veröffentlicht",
      development: "In Entwicklung",
      languages: "Sprachen",
    },
    search: {
      label: "Projekte durchsuchen",
      placeholder: "Name oder Stichwort",
      category: "Kategorie",
      language: "Sprache",
      status: "Stand",
      any: "Alle",
      submit: "Suchen",
      reset: "Zurücksetzen",
      results: "{count} Projekt(e)",
      none: "Kein Projekt passt zu dieser Suche.",
    },
    views: {
      label: "Blättern",
      all: "Alle Projekte",
      categories: "Nach Kategorie",
      languages: "Nach Sprache",
      releases: "Releases",
    },
    table: {
      name: "Projekt",
      category: "Kategorie",
      language: "Sprache",
      status: "Stand",
      release: "Neuestes Release",
    },
    facts: {
      status: "Stand",
      category: "Kategorie",
      language: "Sprache",
      license: "Lizenz",
      release: "Neuestes Release",
      started: "Begonnen",
      none: "Noch keines",
    },
    statuses: { released: "Veröffentlicht", development: "In Entwicklung" },
    categories: {
      build: "Build-System",
      testing: "Testen",
      ide: "IDE",
      "data-format": "Datenformat",
      "data-processing": "Datenverarbeitung",
    },
    categoriesTitle: "Projekte nach Kategorie",
    categoriesDescription: "Wofür jedes Projekt da ist.",
    languagesTitle: "Projekte nach Sprache",
    languagesDescription: "Die Sprache, in der jedes Projekt geschrieben ist.",
    releasesTitle: "Releases",
    releasesDescription:
      "Das neueste Release jedes Projekts, das eines hat, das neueste zuerst.",
    latestReleases: "Neueste Releases",
    noReleases: "Noch keine Releases.",
    products: {
      tazel: {
        tagline: "Baut C, C++, Objective-C, Objective-C++ und Zig.",
        description:
          "Tazel liest ein Modul aus MODULE.kts und einer BUILD.kts je Paket, übersetzt jede Übersetzungseinheit für sich und baut nur neu, was sich geändert hat.",
        features: [
          "Projektdateien in Kotlin, MODULE.kts und BUILD.kts, mit Labels wie //app/:greeter",
          "Clang, GCC und zig cc vom Rechner; Cross-Builds per LLVM-Target-Triple",
          "Inkrementell je Aktion, nach dem Inhalt jeder Eingabe",
          "Tests, Formatierung und Linting eingebaut",
        ],
      },
      catch3: {
        tagline: "C++-Tests jenseits von Assertions.",
        description:
          "Catch3 bleibt Catch2-kompatibel und ergänzt einen eigenen Runner, eigenschaftsbasierte Tests, Mocks, Snapshots und strukturierte Ergebnisse.",
        features: [
          "Catch2-kompatible Tests",
          "Eigenschafts-, zustandsbehaftete und metamorphe Tests mit Verkleinerung",
          "Text-Snapshots und XML-Ergebnisse im JUnit-Stil",
          "Ein eigener Runner mit parallelen Workern, Wiederholungen, Historie und Abdeckung pro Test, dazu Mocks",
        ],
      },
      agenceland: {
        tagline: "Eine agentische IDE auf Basis von Code - OSS.",
        description:
          "Agenceland stellt Agenten in den Mittelpunkt des Editors: Jede Sitzung arbeitet in ihrem eigenen Git-Worktree und ihrer eigenen Sandbox, in einem Berechtigungsmodus Ihrer Wahl, und ihr Protokoll lässt sich wiedergeben.",
        features: [
          "Modelle von OpenAI, Anthropic, OpenRouter, Kimi und Z.ai sowie lokale über LM Studio oder Ollama",
          "Ein Git-Worktree und eine Sandbox für jede Agentensitzung",
          "Live-Review dessen, was ein Agent schreibt, und Wiedergabe aus dem Sitzungsprotokoll",
          "Erweiterungen aus Open VSX",
        ],
      },
      archer: {
        tagline:
          "Ein spaltenorientiertes In-Memory-Format für Java und die JVM.",
        description:
          "Archer legt spaltenorientierte Daten im Speicher außerhalb des Java-Heaps ab, für Java 21 und neuer und die JVM-Sprachen, die Java aufrufen, etwa Kotlin und Scala. Es übernimmt die Rolle von Apache Arrow.",
        features: [
          "Puffer außerhalb des Java-Heaps mit geprüftem Little-Endian-Zugriff",
          "Allokatoren mit Limit, Zählung ihres Speichers und Leck-Erkennung",
          "Ein Allokator auf den gepoolten Puffern von Netty",
          "Spaltenvektoren mit Gültigkeits-Bitmaps",
        ],
      },
      etincelle: {
        tagline: "Eine Engine für große Datenmengen auf Java und der JVM.",
        description:
          "Etincelle verarbeitet große Datenmengen auf Java 21 und neuer und den JVM-Sprachen, die Java aufrufen, in der Rolle von Apache Spark. Seine spaltenorientierten Daten liegen in Archer.",
        features: [
          "Typisierte Schemata und Spalten",
          "Etincelle SQL",
          "Spaltenorientierte Daten in Archer",
          "Für Java, Kotlin und Scala",
        ],
      },
    },
  },
  "ru-RU": {
    metadataTitle: "Продукты",
    metadataDescription:
      "Проекты Progmasoft: Tazel, Catch3, Agenceland, Archer и Etincelle — по категориям, языкам и состоянию.",
    eyebrow: "Проекты Progmasoft",
    title: "Продукты",
    description:
      "Все проекты Progmasoft: что они собой представляют, на каком языке написаны, в каком они состоянии и где находятся. Ищите их или просматривайте по категории, языку или выпуску.",
    site: "Перейти на сайт",
    source: "Исходный код",
    issues: "Задачи",
    features: "Что он умеет",
    featuresPlanned: "Для чего он разрабатывается",
    back: "Все проекты",
    stats: {
      projects: "Проекты",
      released: "Выпущены",
      development: "В разработке",
      languages: "Языки",
    },
    search: {
      label: "Поиск по проектам",
      placeholder: "Название или ключевое слово",
      category: "Категория",
      language: "Язык",
      status: "Состояние",
      any: "Любое",
      submit: "Найти",
      reset: "Сбросить",
      results: "Найдено проектов: {count}",
      none: "Ни один проект не подходит под этот поиск.",
    },
    views: {
      label: "Просмотр",
      all: "Все проекты",
      categories: "По категориям",
      languages: "По языкам",
      releases: "Выпуски",
    },
    table: {
      name: "Проект",
      category: "Категория",
      language: "Язык",
      status: "Состояние",
      release: "Последний выпуск",
    },
    facts: {
      status: "Состояние",
      category: "Категория",
      language: "Язык",
      license: "Лицензия",
      release: "Последний выпуск",
      started: "Начат",
      none: "Пока нет",
    },
    statuses: { released: "Выпущен", development: "В разработке" },
    categories: {
      build: "Система сборки",
      testing: "Тестирование",
      ide: "Среда разработки",
      "data-format": "Формат данных",
      "data-processing": "Обработка данных",
    },
    categoriesTitle: "Проекты по категориям",
    categoriesDescription: "Для чего нужен каждый проект.",
    languagesTitle: "Проекты по языкам",
    languagesDescription: "Язык, на котором написан каждый проект.",
    releasesTitle: "Выпуски",
    releasesDescription:
      "Последний выпуск каждого проекта, у которого он есть, начиная с самого нового.",
    latestReleases: "Последние выпуски",
    noReleases: "Выпусков пока нет.",
    products: {
      tazel: {
        tagline: "Собирает C, C++, Objective-C, Objective-C++ и Zig.",
        description:
          "Tazel читает модуль из MODULE.kts и по одному BUILD.kts на пакет, компилирует каждую единицу трансляции отдельно и пересобирает только то, что изменилось.",
        features: [
          "Файлы проекта на Kotlin, MODULE.kts и BUILD.kts, с метками вида //app/:greeter",
          "Clang, GCC и zig cc с машины; кросс-сборка по LLVM target triple",
          "Инкрементальная сборка на уровне действий, по содержимому каждого входа",
          "Встроенные тесты, форматирование и линтинг",
        ],
      },
      catch3: {
        tagline: "Тестирование C++ за пределами утверждений.",
        description:
          "Catch3 сохраняет совместимость с Catch2 и добавляет собственный запускатель, тесты свойств, моки, снимки и структурированные результаты.",
        features: [
          "Тесты, совместимые с Catch2",
          "Тесты свойств, с состоянием и метаморфные, с упрощением",
          "Текстовые снимки и результаты в XML в стиле JUnit",
          "Свой запускатель с параллельными процессами, повторами, историей и покрытием по тестам, а также моки",
        ],
      },
      agenceland: {
        tagline: "Агентная среда разработки на основе Code - OSS.",
        description:
          "Agenceland ставит агентов в центр редактора: каждый сеанс работает в своём Git worktree и своей песочнице, в выбранном вами режиме разрешений, а его запись можно воспроизвести.",
        features: [
          "Модели OpenAI, Anthropic, OpenRouter, Kimi и Z.ai, а также локальные через LM Studio или Ollama",
          "Отдельные Git worktree и песочница для каждого сеанса агента",
          "Просмотр того, что пишет агент, в реальном времени и воспроизведение по записи сеанса",
          "Расширения из Open VSX",
        ],
      },
      archer: {
        tagline: "Колоночный формат данных в памяти для Java и JVM.",
        description:
          "Archer размещает колоночные данные в памяти вне кучи Java — для Java 21 и новее и языков JVM, вызывающих Java, таких как Kotlin и Scala. Он играет ту же роль, что и Apache Arrow.",
        features: [
          "Буферы вне кучи Java с проверяемым доступом в порядке little-endian",
          "Распределители памяти с лимитом, учётом памяти и обнаружением утечек",
          "Распределитель на пулах буферов Netty",
          "Колоночные векторы с битовыми картами значимости",
        ],
      },
      etincelle: {
        tagline: "Движок для больших данных на Java и JVM.",
        description:
          "Etincelle обрабатывает большие данные на Java 21 и новее и языках JVM, вызывающих Java, — в той же роли, что и Apache Spark. Его колоночные данные хранятся в Archer.",
        features: [
          "Типизированные схемы и столбцы",
          "Etincelle SQL",
          "Колоночные данные в Archer",
          "Для Java, Kotlin и Scala",
        ],
      },
    },
  },
  "fr-FR": {
    metadataTitle: "Produits",
    metadataDescription:
      "Les projets de Progmasoft : Tazel, Catch3, Agenceland, Archer et Etincelle, par catégorie, langage et état.",
    eyebrow: "Projets de Progmasoft",
    title: "Produits",
    description:
      "Chaque projet de Progmasoft, avec ce qu’il est, le langage dans lequel il est écrit, où il en est et où il se trouve. Recherchez-les, ou parcourez-les par catégorie, par langage ou par version.",
    site: "Visiter le site",
    source: "Code source",
    issues: "Tickets",
    features: "Ce qu’il fait",
    featuresPlanned: "Ce qu’il est conçu pour faire",
    back: "Tous les projets",
    stats: {
      projects: "Projets",
      released: "Publiés",
      development: "En développement",
      languages: "Langages",
    },
    search: {
      label: "Rechercher dans les projets",
      placeholder: "Nom ou mot-clé",
      category: "Catégorie",
      language: "Langage",
      status: "État",
      any: "Tous",
      submit: "Rechercher",
      reset: "Effacer",
      results: "{count} projet(s)",
      none: "Aucun projet ne correspond à cette recherche.",
    },
    views: {
      label: "Parcourir",
      all: "Tous les projets",
      categories: "Par catégorie",
      languages: "Par langage",
      releases: "Versions",
    },
    table: {
      name: "Projet",
      category: "Catégorie",
      language: "Langage",
      status: "État",
      release: "Dernière version",
    },
    facts: {
      status: "État",
      category: "Catégorie",
      language: "Langage",
      license: "Licence",
      release: "Dernière version",
      started: "Commencé",
      none: "Aucune pour l’instant",
    },
    statuses: { released: "Publié", development: "En développement" },
    categories: {
      build: "Système de build",
      testing: "Tests",
      ide: "IDE",
      "data-format": "Format de données",
      "data-processing": "Traitement de données",
    },
    categoriesTitle: "Projets par catégorie",
    categoriesDescription: "À quoi sert chaque projet.",
    languagesTitle: "Projets par langage",
    languagesDescription: "Le langage dans lequel chaque projet est écrit.",
    releasesTitle: "Versions",
    releasesDescription:
      "La dernière version de chaque projet qui en a une, de la plus récente à la plus ancienne.",
    latestReleases: "Dernières versions",
    noReleases: "Aucune version pour l’instant.",
    products: {
      tazel: {
        tagline: "Compile C, C++, Objective-C, Objective-C++ et Zig.",
        description:
          "Tazel lit un module depuis MODULE.kts et un BUILD.kts par paquet, compile chaque unité de traduction séparément et ne recompile que ce qui a changé.",
        features: [
          "Des fichiers de projet en Kotlin, MODULE.kts et BUILD.kts, avec des étiquettes comme //app/:greeter",
          "Clang, GCC et zig cc de la machine ; compilation croisée par triplet de cible LLVM",
          "Incrémental à chaque action, selon le contenu de chaque entrée",
          "Tests, formatage et analyse statique intégrés",
        ],
      },
      catch3: {
        tagline: "Des tests C++ au-delà des assertions.",
        description:
          "Catch3 reste compatible avec Catch2 et ajoute son propre runner, des tests de propriétés, des mocks, des instantanés et des résultats structurés.",
        features: [
          "Des tests compatibles avec Catch2",
          "Tests de propriétés, tests à état et tests métamorphiques, avec réduction",
          "Instantanés de texte et résultats XML au format JUnit",
          "Son propre runner avec des workers parallèles, des reprises, un historique et la couverture par test, ainsi que des mocks",
        ],
      },
      agenceland: {
        tagline: "Un IDE agentique bâti sur Code - OSS.",
        description:
          "Agenceland place les agents au centre de l’éditeur : chaque session travaille dans son propre worktree Git et son propre bac à sable, dans le mode d’autorisation que vous choisissez, et son journal peut être rejoué.",
        features: [
          "Des modèles d’OpenAI, d’Anthropic, d’OpenRouter, de Kimi et de Z.ai, et des modèles locaux via LM Studio ou Ollama",
          "Un worktree Git et un bac à sable pour chaque session d’agent",
          "Relecture en direct de ce qu’écrit un agent, et rejeu depuis le journal de la session",
          "Des extensions depuis Open VSX",
        ],
      },
      archer: {
        tagline: "Un format en colonnes, en mémoire, pour Java et la JVM.",
        description:
          "Archer dispose les données en colonnes en mémoire, hors du tas Java, pour Java 21 et plus et pour les langages de la JVM qui appellent Java, comme Kotlin et Scala. Il joue le rôle que joue Apache Arrow.",
        features: [
          "Des tampons hors du tas Java, avec un accès vérifié et little-endian",
          "Des allocateurs avec une limite, un décompte de leur mémoire et la détection des fuites",
          "Un allocateur sur les tampons mutualisés de Netty",
          "Des vecteurs en colonnes avec des bitmaps de validité",
        ],
      },
      etincelle: {
        tagline:
          "Un moteur pour les grands volumes de données sur Java et la JVM.",
        description:
          "Etincelle traite de grands volumes de données sur Java 21 et plus et sur les langages de la JVM qui appellent Java, dans le rôle que joue Apache Spark. Ses données en colonnes résident dans Archer.",
        features: [
          "Des schémas et des colonnes typés",
          "Etincelle SQL",
          "Des données en colonnes dans Archer",
          "Pour Java, Kotlin et Scala",
        ],
      },
    },
  },
};
