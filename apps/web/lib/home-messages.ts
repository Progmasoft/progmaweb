// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";
import type { ProductSlug } from "./products";

/**
 * The text of progmasoft.com, which tells Progmasoft: a statement, the latest
 * release as a feature, the news, what it makes, how it works and how to reach
 * it. Names, versions, dates and links come from the catalog.
 */
interface HomeMessages {
  navigation: {
    technology: string;
    products: string;
    developers: string;
  };
  /** The opening paragraph: a bold first sentence, then the rest. */
  statement: { lead: string; rest: string };
  feature: {
    readMore: string;
    /** "Get {name}". */
    get: string;
    follow: string;
    label: string;
    pause: string;
    play: string;
  };
  news: {
    title: string;
    category: string;
    product: string;
    notes: string;
    read: string;
    all: string;
  };
  showcase: { title: string; learnMore: string };
  /** One line per product, as short as a headline. */
  lines: Record<ProductSlug, string>;
  principles: {
    title: string;
    items: [title: string, text: string][];
  };
  contact: {
    title: string;
    items: [title: string, text: string, action: string][];
  };
}

export const homeMessages: Record<Locale, HomeMessages> = {
  "en-US": {
    navigation: {
      technology: "News",
      products: "Products",
      developers: "Developers",
    },
    statement: {
      lead: "Tools that turn source into running software.",
      rest: "Progmasoft is an independent software organization. We build them to do exactly what they say, to explain what they did, and to stay maintained for as long as people rely on them.",
    },
    feature: {
      readMore: "Read more",
      get: "Get {name}",
      follow: "Source on GitHub",
      label: "Products",
      pause: "Pause the animation",
      play: "Play the animation",
    },
    news: {
      title: "News",
      category: "Release",
      product: "Product",
      notes: "Release notes",
      read: "Read the announcement",
      all: "All news",
    },
    showcase: { title: "What we make", learnMore: "Learn more" },
    lines: {
      tazel: "Builds C, C++ and Zig. Redoes only what changed.",
      opentala: "A kernel that speaks Darwin. It boots today.",
      catch3: "C++ tests that hunt for the failing case.",
      agenceland: "An IDE where every agent works in its own worktree.",
      etincelle: "SQL over large data, on the JVM.",
      archer: "Columnar data in memory, for Java.",
    },
    principles: {
      title: "How we work",
      items: [
        [
          "Our mission",
          "Make building software dependable, from the first command to the last release.",
        ],
        [
          "Transparent, always",
          "We say what we decided, what changed and why, before and after every release.",
        ],
        [
          "Secure by default",
          "Signed results, checked downloads, and settings that start safe rather than open.",
        ],
        [
          "Made to last",
          "Each release names what it was tested on, and earlier versions stay documented.",
        ],
      ],
    },
    contact: {
      title: "Get in touch",
      items: [
        [
          "Ask us anything",
          "Questions, problems and ideas reach the people who build the software.",
          "Write to us",
        ],
        [
          "Report a vulnerability",
          "Tell us privately; we answer, fix it and say what happened.",
          "Security Policy",
        ],
        [
          "Follow the work",
          "Releases, issues and discussions of our public projects.",
          "GitHub",
        ],
      ],
    },
  },
  "de-DE": {
    navigation: {
      technology: "Neuigkeiten",
      products: "Produkte",
      developers: "Entwickler",
    },
    statement: {
      lead: "Werkzeuge, die aus Quellcode laufende Software machen.",
      rest: "Progmasoft ist eine unabhängige Software-Organisation. Wir bauen sie so, dass sie genau tun, was sie sagen, erklären, was sie getan haben, und gepflegt bleiben, solange Menschen sich auf sie verlassen.",
    },
    feature: {
      readMore: "Mehr lesen",
      get: "{name} holen",
      follow: "Quellcode auf GitHub",
      label: "Produkte",
      pause: "Animation anhalten",
      play: "Animation abspielen",
    },
    news: {
      title: "Neuigkeiten",
      category: "Version",
      product: "Produkt",
      notes: "Versionshinweise",
      read: "Ankündigung lesen",
      all: "Alle Neuigkeiten",
    },
    showcase: { title: "Was wir machen", learnMore: "Mehr erfahren" },
    lines: {
      tazel: "Baut C, C++ und Zig. Und nur, was sich geändert hat.",
      opentala: "Ein Kernel, der Darwin spricht. Er bootet schon heute.",
      catch3: "C++-Tests, die den fehlschlagenden Fall aufspüren.",
      agenceland:
        "Eine IDE, in der jeder Agent in seinem eigenen Worktree arbeitet.",
      etincelle: "SQL über große Datenmengen, auf der JVM.",
      archer: "Spaltenorientierte Daten im Speicher, für Java.",
    },
    principles: {
      title: "Wie wir arbeiten",
      items: [
        [
          "Unsere Mission",
          "Software zu bauen soll verlässlich sein, vom ersten Befehl bis zur letzten Version.",
        ],
        [
          "Immer transparent",
          "Wir sagen, was wir entschieden haben, was sich geändert hat und warum, vor und nach jeder Version.",
        ],
        [
          "Sicher von Anfang an",
          "Signierte Ergebnisse, geprüfte Downloads und Einstellungen, die sicher statt offen beginnen.",
        ],
        [
          "Gemacht, um zu bleiben",
          "Jede Version nennt, worauf sie getestet wurde, und frühere Versionen bleiben dokumentiert.",
        ],
      ],
    },
    contact: {
      title: "Kontakt",
      items: [
        [
          "Fragen Sie uns",
          "Fragen, Probleme und Ideen erreichen die Menschen, die die Software bauen.",
          "Schreiben Sie uns",
        ],
        [
          "Eine Schwachstelle melden",
          "Sagen Sie es uns vertraulich; wir antworten, beheben sie und sagen, was geschehen ist.",
          "Sicherheitsrichtlinie",
        ],
        [
          "Die Arbeit verfolgen",
          "Versionen, Issues und Diskussionen unserer öffentlichen Projekte.",
          "GitHub",
        ],
      ],
    },
  },
  "ru-RU": {
    navigation: {
      technology: "Новости",
      products: "Продукты",
      developers: "Разработчикам",
    },
    statement: {
      lead: "Инструменты, которые превращают исходный код в работающие программы.",
      rest: "Progmasoft — независимая организация, создающая программное обеспечение. Мы делаем их так, чтобы они делали ровно то, что обещают, объясняли, что сделали, и поддерживались, пока на них полагаются.",
    },
    feature: {
      readMore: "Подробнее",
      get: "Скачать {name}",
      follow: "Исходный код на GitHub",
      label: "Продукты",
      pause: "Остановить анимацию",
      play: "Запустить анимацию",
    },
    news: {
      title: "Новости",
      category: "Выпуск",
      product: "Продукт",
      notes: "Примечания к выпуску",
      read: "Читать объявление",
      all: "Все новости",
    },
    showcase: { title: "Что мы делаем", learnMore: "Подробнее" },
    lines: {
      tazel: "Собирает C, C++ и Zig. Пересобирает только изменённое.",
      opentala: "Ядро, говорящее на языке Darwin. Оно уже загружается.",
      catch3: "Тесты C++, которые находят случай, где всё ломается.",
      agenceland:
        "Среда разработки, где каждый агент работает в своём worktree.",
      etincelle: "SQL над большими данными, на JVM.",
      archer: "Колоночные данные в памяти, для Java.",
    },
    principles: {
      title: "Как мы работаем",
      items: [
        [
          "Наша миссия",
          "Сделать создание программ надёжным, от первой команды до последнего выпуска.",
        ],
        [
          "Всегда открыто",
          "Мы говорим, что решили, что изменилось и почему, до и после каждого выпуска.",
        ],
        [
          "Безопасно по умолчанию",
          "Подписанные результаты, проверенные загрузки и настройки, которые начинают с безопасного.",
        ],
        [
          "Сделано надолго",
          "Каждый выпуск называет, на чём он проверен, а прежние версии остаются описанными.",
        ],
      ],
    },
    contact: {
      title: "Связаться с нами",
      items: [
        [
          "Спросите нас",
          "Вопросы, проблемы и идеи попадают к тем, кто создаёт программы.",
          "Написать нам",
        ],
        [
          "Сообщить об уязвимости",
          "Сообщите нам конфиденциально; мы ответим, исправим и расскажем, что произошло.",
          "Политика безопасности",
        ],
        [
          "Следить за работой",
          "Выпуски, задачи и обсуждения наших открытых проектов.",
          "GitHub",
        ],
      ],
    },
  },
  "fr-FR": {
    navigation: {
      technology: "Actualités",
      products: "Produits",
      developers: "Développeurs",
    },
    statement: {
      lead: "Des outils qui transforment le code source en logiciel qui tourne.",
      rest: "Progmasoft est une organisation logicielle indépendante. Nous les construisons pour qu'ils fassent exactement ce qu'ils disent, expliquent ce qu'ils ont fait et restent maintenus tant qu'on compte sur eux.",
    },
    feature: {
      readMore: "En savoir plus",
      get: "Obtenir {name}",
      follow: "Code source sur GitHub",
      label: "Produits",
      pause: "Mettre l'animation en pause",
      play: "Lancer l'animation",
    },
    news: {
      title: "Actualités",
      category: "Version",
      product: "Produit",
      notes: "Notes de version",
      read: "Lire l'annonce",
      all: "Toutes les actualités",
    },
    showcase: { title: "Ce que nous faisons", learnMore: "En savoir plus" },
    lines: {
      tazel: "Construit C, C++ et Zig. Ne refait que ce qui a changé.",
      opentala: "Un noyau qui parle Darwin. Il démarre déjà.",
      catch3: "Des tests C++ qui traquent le cas qui échoue.",
      agenceland: "Un IDE où chaque agent travaille dans son propre worktree.",
      etincelle: "Du SQL sur de grands volumes de données, sur la JVM.",
      archer: "Des données en colonnes en mémoire, pour Java.",
    },
    principles: {
      title: "Notre façon de travailler",
      items: [
        [
          "Notre mission",
          "Rendre fiable la construction du logiciel, de la première commande à la dernière version.",
        ],
        [
          "Transparents, toujours",
          "Nous disons ce que nous avons décidé, ce qui a changé et pourquoi, avant et après chaque version.",
        ],
        [
          "Sûrs par défaut",
          "Des résultats signés, des téléchargements vérifiés et des réglages qui commencent sûrs plutôt qu'ouverts.",
        ],
        [
          "Faits pour durer",
          "Chaque version indique sur quoi elle a été testée, et les versions précédentes restent documentées.",
        ],
      ],
    },
    contact: {
      title: "Nous contacter",
      items: [
        [
          "Posez-nous vos questions",
          "Questions, problèmes et idées arrivent aux personnes qui construisent le logiciel.",
          "Nous écrire",
        ],
        [
          "Signaler une vulnérabilité",
          "Dites-le-nous en privé ; nous répondons, corrigeons et expliquons ce qui s'est passé.",
          "Politique de sécurité",
        ],
        [
          "Suivre le travail",
          "Versions, tickets et discussions de nos projets publics.",
          "GitHub",
        ],
      ],
    },
  },
};

export function getHomeMessages(locale: Locale): HomeMessages {
  return homeMessages[locale];
}
