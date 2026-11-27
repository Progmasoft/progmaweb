// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

/**
 * The text of progmasoft.com. The page describes the areas Progmasoft works
 * in, not a list of products: the products have their own catalog on
 * product.progmasoft.com, and the releases the page lists come from it.
 */
interface HomeMessages {
  navigation: {
    technology: string;
    products: string;
    developers: string;
  };
  hero: {
    title: string;
    description: string;
    catalog: string;
    source: string;
  };
  areas: {
    title: string;
    items: [title: string, description: string][];
  };
  releases: {
    title: string;
    all: string;
  };
  developers: {
    title: string;
    description: string;
    console: string;
    account: string;
    discovery: string;
  };
  contact: {
    title: string;
    support: string;
    security: string;
  };
}

export const homeMessages: Record<Locale, HomeMessages> = {
  "en-US": {
    navigation: {
      technology: "Areas",
      products: "Products",
      developers: "Developers",
    },
    hero: {
      title: "Developer tools and infrastructure, built in the open.",
      description:
        "Progmasoft develops build systems, testing libraries, data infrastructure and an operating system, and runs the services they rely on. The source of every project is public.",
      catalog: "Product catalog",
      source: "Source on GitHub",
    },
    areas: {
      title: "Areas of work",
      items: [
        [
          "Build and packages",
          "Builds that run each action again only when its inputs change, toolchains, lockfiles and a module registry.",
        ],
        [
          "Quality and testing",
          "Testing libraries for C++: property-based, stateful and mutation testing, coverage and test selection.",
        ],
        [
          "Development environments",
          "An agentic development environment and the integrations of the tools with editors.",
        ],
        [
          "Data infrastructure",
          "Columnar in-memory formats and engines for large data on the JVM.",
        ],
        [
          "Operating systems",
          "A kernel with Darwin's system call ABI, its loader and the system around it.",
        ],
        [
          "Identity and services",
          "Progmasoft accounts with OAuth 2.1 and OpenID Connect, Git mirrors, registries and continuous integration.",
        ],
      ],
    },
    releases: {
      title: "Recent releases",
      all: "All releases",
    },
    developers: {
      title: "For developers",
      description:
        "Applications sign people in with their Progmasoft account through OAuth 2.1 and OpenID Connect. The Console manages the clients and tokens of your applications.",
      console: "Open the Console",
      account: "Progmasoft account",
      discovery: "OpenID Connect discovery",
    },
    contact: {
      title: "Contact",
      support: "Questions and support",
      security: "Report a vulnerability",
    },
  },
  "de-DE": {
    navigation: {
      technology: "Bereiche",
      products: "Produkte",
      developers: "Entwickler",
    },
    hero: {
      title: "Entwicklerwerkzeuge und Infrastruktur, offen entwickelt.",
      description:
        "Progmasoft entwickelt Build-Systeme, Testbibliotheken, Dateninfrastruktur und ein Betriebssystem und betreibt die Dienste, auf die sie angewiesen sind. Der Quellcode jedes Projekts ist öffentlich.",
      catalog: "Produktkatalog",
      source: "Quellcode auf GitHub",
    },
    areas: {
      title: "Arbeitsbereiche",
      items: [
        [
          "Build und Pakete",
          "Builds, die eine Aktion nur dann erneut ausführen, wenn sich ihre Eingaben ändern, Toolchains, Lockfiles und eine Modulregistrierung.",
        ],
        [
          "Qualität und Tests",
          "Testbibliotheken für C++: eigenschaftsbasierte, zustandsbehaftete und Mutationstests, Abdeckung und Testauswahl.",
        ],
        [
          "Entwicklungsumgebungen",
          "Eine agentische Entwicklungsumgebung und die Integration der Werkzeuge in Editoren.",
        ],
        [
          "Dateninfrastruktur",
          "Spaltenorientierte In-Memory-Formate und Engines für große Datenmengen auf der JVM.",
        ],
        [
          "Betriebssysteme",
          "Ein Kernel mit Darwins Systemaufruf-ABI, sein Loader und das System um ihn herum.",
        ],
        [
          "Identität und Dienste",
          "Progmasoft-Konten mit OAuth 2.1 und OpenID Connect, Git-Spiegel, Registrierungen und kontinuierliche Integration.",
        ],
      ],
    },
    releases: {
      title: "Neueste Versionen",
      all: "Alle Versionen",
    },
    developers: {
      title: "Für Entwickler",
      description:
        "Anwendungen melden Personen über OAuth 2.1 und OpenID Connect mit ihrem Progmasoft-Konto an. In der Console verwalten Sie die Clients und Tokens Ihrer Anwendungen.",
      console: "Console öffnen",
      account: "Progmasoft-Konto",
      discovery: "OpenID-Connect-Discovery",
    },
    contact: {
      title: "Kontakt",
      support: "Fragen und Support",
      security: "Eine Schwachstelle melden",
    },
  },
  "ru-RU": {
    navigation: {
      technology: "Направления",
      products: "Продукты",
      developers: "Разработчикам",
    },
    hero: {
      title: "Инструменты разработчика и инфраструктура, создаваемые открыто.",
      description:
        "Progmasoft разрабатывает системы сборки, библиотеки тестирования, инфраструктуру данных и операционную систему, а также поддерживает сервисы, на которые они опираются. Исходный код каждого проекта открыт.",
      catalog: "Каталог продуктов",
      source: "Исходный код на GitHub",
    },
    areas: {
      title: "Направления работы",
      items: [
        [
          "Сборка и пакеты",
          "Сборка, повторяющая действие только при изменении его входных данных, наборы инструментов, lock-файлы и реестр модулей.",
        ],
        [
          "Качество и тестирование",
          "Библиотеки тестирования для C++: тестирование на основе свойств, с состоянием и мутационное, покрытие и выбор тестов.",
        ],
        [
          "Среды разработки",
          "Агентная среда разработки и интеграция инструментов с редакторами.",
        ],
        [
          "Инфраструктура данных",
          "Колоночные форматы данных в памяти и движки для больших данных на JVM.",
        ],
        [
          "Операционные системы",
          "Ядро с ABI системных вызовов Darwin, его загрузчик и система вокруг него.",
        ],
        [
          "Идентификация и сервисы",
          "Аккаунты Progmasoft с OAuth 2.1 и OpenID Connect, зеркала Git, реестры и непрерывная интеграция.",
        ],
      ],
    },
    releases: {
      title: "Последние выпуски",
      all: "Все выпуски",
    },
    developers: {
      title: "Разработчикам",
      description:
        "Приложения выполняют вход пользователей с аккаунтом Progmasoft через OAuth 2.1 и OpenID Connect. В Console вы управляете клиентами и токенами своих приложений.",
      console: "Открыть Console",
      account: "Аккаунт Progmasoft",
      discovery: "Обнаружение OpenID Connect",
    },
    contact: {
      title: "Контакты",
      support: "Вопросы и поддержка",
      security: "Сообщить об уязвимости",
    },
  },
  "fr-FR": {
    navigation: {
      technology: "Domaines",
      products: "Produits",
      developers: "Développeurs",
    },
    hero: {
      title: "Outils pour développeurs et infrastructure, développés en public.",
      description:
        "Progmasoft développe des systèmes de build, des bibliothèques de test, une infrastructure de données et un système d'exploitation, et opère les services dont ils dépendent. Le code source de chaque projet est public.",
      catalog: "Catalogue des produits",
      source: "Code source sur GitHub",
    },
    areas: {
      title: "Domaines de travail",
      items: [
        [
          "Build et paquets",
          "Des builds qui ne relancent une action que lorsque ses entrées changent, des chaînes d'outils, des fichiers de verrouillage et un registre de modules.",
        ],
        [
          "Qualité et tests",
          "Des bibliothèques de test pour C++ : tests fondés sur les propriétés, tests à état et tests de mutation, couverture et sélection des tests.",
        ],
        [
          "Environnements de développement",
          "Un environnement de développement agentique et l'intégration des outils dans les éditeurs.",
        ],
        [
          "Infrastructure de données",
          "Formats et moteurs en colonnes, en mémoire, pour de grands volumes de données sur la JVM.",
        ],
        [
          "Systèmes d'exploitation",
          "Un noyau avec l'ABI des appels système de Darwin, son chargeur et le système qui l'entoure.",
        ],
        [
          "Identité et services",
          "Comptes Progmasoft avec OAuth 2.1 et OpenID Connect, miroirs Git, registres et intégration continue.",
        ],
      ],
    },
    releases: {
      title: "Versions récentes",
      all: "Toutes les versions",
    },
    developers: {
      title: "Pour les développeurs",
      description:
        "Les applications connectent les personnes avec leur compte Progmasoft via OAuth 2.1 et OpenID Connect. La Console gère les clients et les jetons de vos applications.",
      console: "Ouvrir la Console",
      account: "Compte Progmasoft",
      discovery: "Découverte OpenID Connect",
    },
    contact: {
      title: "Contact",
      support: "Questions et assistance",
      security: "Signaler une vulnérabilité",
    },
  },
};

export function getHomeMessages(locale: Locale): HomeMessages {
  return homeMessages[locale];
}
