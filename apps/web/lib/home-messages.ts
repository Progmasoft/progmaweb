// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

/**
 * The text of progmasoft.com. The page describes Progmasoft as a pool of
 * technology areas, not as a list of products: the products have their own
 * catalog on product.progmasoft.com.
 */
interface HomeMessages {
  navigation: {
    technology: string;
    products: string;
    developers: string;
  };
  hero: {
    eyebrow: string;
    titleStart: string;
    titleAccent: string;
    description: string;
    explore: string;
    products: string;
    poolLabel: string;
  };
  pool: {
    eyebrow: string;
    title: string;
    description: string;
    areas: [title: string, description: string][];
    catalog: string;
    catalogLink: string;
  };
  principles: {
    eyebrow: string;
    title: string;
    items: [title: string, description: string][];
  };
  developers: {
    eyebrow: string;
    title: string;
    description: string;
    console: string;
    account: string;
  };
}

export const homeMessages: Record<Locale, HomeMessages> = {
  "en-US": {
    navigation: {
      technology: "Technology",
      products: "Products",
      developers: "Developers",
    },
    hero: {
      eyebrow: "Progmasoft",
      titleStart: "Technology built to",
      titleAccent: "last and to explain itself.",
      description:
        "Progmasoft designs build systems, testing tools, agentic development environments, data infrastructure and the services around them. Everything shares one discipline: explicit contracts, real verification and names that mean what they say.",
      explore: "Explore the technology",
      products: "See the products",
      poolLabel: "Areas of the Progmasoft technology pool",
    },
    pool: {
      eyebrow: "Technology pool",
      title: "Areas, not just products.",
      description:
        "Products come and grow; the technology underneath them is what we keep building. Each area is shared by everything Progmasoft makes.",
      areas: [
        [
          "Data infrastructure",
          "Columnar in-memory formats and engines for large data on the JVM.",
        ],
        [
          "Build and packages",
          "Reproducible builds, dependency resolution, lockfiles and a package registry.",
        ],
        [
          "Developer tools",
          "Formatters, linters and agentic development environments.",
        ],
        [
          "Quality and testing",
          "Property-based, stateful and mutation testing, coverage and test selection.",
        ],
        [
          "Identity and access",
          "Progmasoft accounts, OAuth 2.1 and OpenID Connect for every application.",
        ],
        [
          "Infrastructure",
          "Services Progmasoft operates itself: hosting, mail, registries and continuous integration.",
        ],
      ],
      catalog: "Looking for a specific product?",
      catalogLink: "Open the product catalog",
    },
    principles: {
      eyebrow: "How we build",
      title: "Engineering that stays legible.",
      items: [
        [
          "Explicit contracts",
          "Typed boundaries make ownership, compatibility and failure behaviour visible.",
        ],
        [
          "Real verification",
          "Tests exercise installed artifacts, production-shaped paths and observable behaviour.",
        ],
        [
          "Durable names",
          "Public vocabulary follows the model, not the history of an implementation.",
        ],
      ],
    },
    developers: {
      eyebrow: "For developers",
      title: "Build on Progmasoft.",
      description:
        "Sign people in with their Progmasoft account through OAuth 2.1, and manage the tokens of your applications in the Progmasoft Console.",
      console: "Open the Console",
      account: "Progmasoft account",
    },
  },
  "de-DE": {
    navigation: {
      technology: "Technologie",
      products: "Produkte",
      developers: "Entwickler",
    },
    hero: {
      eyebrow: "Progmasoft",
      titleStart: "Technologie, gebaut um",
      titleAccent: "zu bleiben und sich zu erklären.",
      description:
        "Progmasoft entwirft Build-Systeme, Testwerkzeuge, agentische Entwicklungsumgebungen, Dateninfrastruktur und die Dienste um sie herum. Alles folgt einer Disziplin: explizite Verträge, echte Prüfung und Namen, die sagen, was sie meinen.",
      explore: "Technologie entdecken",
      products: "Zu den Produkten",
      poolLabel: "Bereiche des Progmasoft-Technologiepools",
    },
    pool: {
      eyebrow: "Technologiepool",
      title: "Bereiche, nicht nur Produkte.",
      description:
        "Produkte entstehen und wachsen; die Technologie darunter bauen wir dauerhaft weiter. Jeder Bereich trägt alles, was Progmasoft macht.",
      areas: [
        [
          "Dateninfrastruktur",
          "Spaltenorientierte In-Memory-Formate und Engines für große Datenmengen auf der JVM.",
        ],
        [
          "Build und Pakete",
          "Reproduzierbare Builds, Abhängigkeitsauflösung, Lockfiles und eine Paketregistrierung.",
        ],
        [
          "Entwicklerwerkzeuge",
          "Formatierer, Linter und agentische Entwicklungsumgebungen.",
        ],
        [
          "Qualität und Tests",
          "Eigenschaftsbasierte, zustandsbehaftete und Mutationstests, Abdeckung und Testauswahl.",
        ],
        [
          "Identität und Zugriff",
          "Progmasoft-Konten, OAuth 2.1 und OpenID Connect für jede Anwendung.",
        ],
        [
          "Infrastruktur",
          "Dienste, die Progmasoft selbst betreibt: Hosting, Mail, Registrierungen und kontinuierliche Integration.",
        ],
      ],
      catalog: "Suchen Sie ein bestimmtes Produkt?",
      catalogLink: "Produktkatalog öffnen",
    },
    principles: {
      eyebrow: "Wie wir bauen",
      title: "Technik, die lesbar bleibt.",
      items: [
        [
          "Explizite Verträge",
          "Typisierte Grenzen machen Zuständigkeit, Kompatibilität und Fehlerverhalten sichtbar.",
        ],
        [
          "Echte Prüfung",
          "Tests prüfen installierte Artefakte, produktionsnahe Wege und beobachtbares Verhalten.",
        ],
        [
          "Beständige Namen",
          "Das öffentliche Vokabular folgt dem Modell, nicht der Geschichte einer Implementierung.",
        ],
      ],
    },
    developers: {
      eyebrow: "Für Entwickler",
      title: "Mit Progmasoft entwickeln.",
      description:
        "Melden Sie Menschen mit ihrem Progmasoft-Konto über OAuth 2.1 an und verwalten Sie die Tokens Ihrer Anwendungen in der Progmasoft Console.",
      console: "Console öffnen",
      account: "Progmasoft-Konto",
    },
  },
  "ru-RU": {
    navigation: {
      technology: "Технологии",
      products: "Продукты",
      developers: "Разработчикам",
    },
    hero: {
      eyebrow: "Progmasoft",
      titleStart: "Технологии, созданные,",
      titleAccent: "чтобы служить долго и быть понятными.",
      description:
        "Progmasoft создаёт системы сборки, инструменты тестирования, агентные среды разработки, инфраструктуру данных и сервисы вокруг них. Всё подчиняется одной дисциплине: явные контракты, настоящая проверка и имена, которые значат то, что говорят.",
      explore: "Изучить технологии",
      products: "Перейти к продуктам",
      poolLabel: "Направления технологического пула Progmasoft",
    },
    pool: {
      eyebrow: "Технологический пул",
      title: "Направления, а не только продукты.",
      description:
        "Продукты появляются и растут; технологии под ними мы развиваем постоянно. Каждое направление служит всему, что делает Progmasoft.",
      areas: [
        [
          "Инфраструктура данных",
          "Колоночные форматы данных в памяти и движки для больших данных на JVM.",
        ],
        [
          "Сборка и пакеты",
          "Воспроизводимые сборки, разрешение зависимостей, lock-файлы и реестр пакетов.",
        ],
        [
          "Инструменты разработчика",
          "Форматировщики, линтеры и агентные среды разработки.",
        ],
        [
          "Качество и тестирование",
          "Тестирование на основе свойств, с состоянием и мутационное, покрытие и выбор тестов.",
        ],
        [
          "Идентификация и доступ",
          "Аккаунты Progmasoft, OAuth 2.1 и OpenID Connect для любого приложения.",
        ],
        [
          "Инфраструктура",
          "Сервисы, которыми Progmasoft управляет сам: хостинг, почта, реестры и непрерывная интеграция.",
        ],
      ],
      catalog: "Ищете конкретный продукт?",
      catalogLink: "Открыть каталог продуктов",
    },
    principles: {
      eyebrow: "Как мы работаем",
      title: "Инженерия, которая остаётся понятной.",
      items: [
        [
          "Явные контракты",
          "Типизированные границы делают видимыми ответственность, совместимость и поведение при ошибках.",
        ],
        [
          "Настоящая проверка",
          "Тесты проверяют установленные артефакты, пути как в продакшене и наблюдаемое поведение.",
        ],
        [
          "Устойчивые имена",
          "Публичный словарь следует модели, а не истории реализации.",
        ],
      ],
    },
    developers: {
      eyebrow: "Разработчикам",
      title: "Разрабатывайте на Progmasoft.",
      description:
        "Позвольте людям входить с аккаунтом Progmasoft через OAuth 2.1 и управляйте токенами своих приложений в Progmasoft Console.",
      console: "Открыть Console",
      account: "Аккаунт Progmasoft",
    },
  },
  "fr-FR": {
    navigation: {
      technology: "Technologie",
      products: "Produits",
      developers: "Développeurs",
    },
    hero: {
      eyebrow: "Progmasoft",
      titleStart: "Une technologie faite pour",
      titleAccent: "durer et s’expliquer d’elle-même.",
      description:
        "Progmasoft conçoit des systèmes de build, des outils de test, des environnements de développement agentiques, une infrastructure de données et les services qui les entourent. Tout partage une même discipline : des contrats explicites, une vérification réelle et des noms qui disent ce qu’ils désignent.",
      explore: "Découvrir la technologie",
      products: "Voir les produits",
      poolLabel: "Domaines du socle technologique de Progmasoft",
    },
    pool: {
      eyebrow: "Socle technologique",
      title: "Des domaines, pas seulement des produits.",
      description:
        "Les produits naissent et grandissent ; la technologie qui les porte est ce que nous continuons de construire. Chaque domaine est partagé par tout ce que fait Progmasoft.",
      areas: [
        [
          "Infrastructure de données",
          "Formats et moteurs en colonnes, en mémoire, pour de grands volumes de données sur la JVM.",
        ],
        [
          "Build et paquets",
          "Builds reproductibles, résolution des dépendances, fichiers de verrouillage et un registre de paquets.",
        ],
        [
          "Outils pour développeurs",
          "Formateurs, linters et environnements de développement agentiques.",
        ],
        [
          "Qualité et tests",
          "Tests fondés sur les propriétés, tests à état et tests de mutation, couverture et sélection des tests.",
        ],
        [
          "Identité et accès",
          "Comptes Progmasoft, OAuth 2.1 et OpenID Connect pour chaque application.",
        ],
        [
          "Infrastructure",
          "Des services que Progmasoft exploite lui-même : hébergement, messagerie, registres et intégration continue.",
        ],
      ],
      catalog: "Vous cherchez un produit précis ?",
      catalogLink: "Ouvrir le catalogue des produits",
    },
    principles: {
      eyebrow: "Notre façon de construire",
      title: "Une ingénierie qui reste lisible.",
      items: [
        [
          "Des contrats explicites",
          "Des frontières typées rendent visibles la propriété, la compatibilité et le comportement en cas d’échec.",
        ],
        [
          "Une vérification réelle",
          "Les tests éprouvent les artefacts installés, des chemins semblables à la production et le comportement observable.",
        ],
        [
          "Des noms durables",
          "Le vocabulaire public suit le modèle, et non l’histoire d’une implémentation.",
        ],
      ],
    },
    developers: {
      eyebrow: "Pour les développeurs",
      title: "Construisez sur Progmasoft.",
      description:
        "Connectez les utilisateurs avec leur compte Progmasoft grâce à OAuth 2.1, et gérez les jetons de vos applications dans la Console Progmasoft.",
      console: "Ouvrir la Console",
      account: "Compte Progmasoft",
    },
  },
};

export function getHomeMessages(locale: Locale): HomeMessages {
  return homeMessages[locale];
}
