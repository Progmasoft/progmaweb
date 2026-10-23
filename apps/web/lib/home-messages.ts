// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

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
        "Progmasoft designs languages, compilers, build systems, developer tools and the services around them. Everything shares one discipline: explicit contracts, real verification and names that mean what they say.",
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
          "Languages and compilers",
          "Language design, type systems, intermediate representations and native code generation.",
        ],
        [
          "Build and packages",
          "Reproducible builds, dependency resolution, lockfiles and a package registry.",
        ],
        [
          "Developer tools",
          "Formatters, linters, language servers and integrated development environments.",
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
        "Progmasoft entwirft Sprachen, Compiler, Build-Systeme, Entwicklerwerkzeuge und die Dienste um sie herum. Alles folgt einer Disziplin: explizite Verträge, echte Prüfung und Namen, die sagen, was sie meinen.",
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
          "Sprachen und Compiler",
          "Sprachentwurf, Typsysteme, Zwischendarstellungen und native Codeerzeugung.",
        ],
        [
          "Build und Pakete",
          "Reproduzierbare Builds, Abhängigkeitsauflösung, Lockfiles und eine Paketregistrierung.",
        ],
        [
          "Entwicklerwerkzeuge",
          "Formatierer, Linter, Language Server und integrierte Entwicklungsumgebungen.",
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
        "Progmasoft создаёт языки, компиляторы, системы сборки, инструменты разработчика и сервисы вокруг них. Всё подчиняется одной дисциплине: явные контракты, настоящая проверка и имена, которые значат то, что говорят.",
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
          "Языки и компиляторы",
          "Проектирование языков, системы типов, промежуточные представления и генерация машинного кода.",
        ],
        [
          "Сборка и пакеты",
          "Воспроизводимые сборки, разрешение зависимостей, lock-файлы и реестр пакетов.",
        ],
        [
          "Инструменты разработчика",
          "Форматировщики, линтеры, языковые серверы и интегрированные среды разработки.",
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
  "he-IL": {
    navigation: {
      technology: "טכנולוגיה",
      products: "מוצרים",
      developers: "מפתחים",
    },
    hero: {
      eyebrow: "Progmasoft",
      titleStart: "טכנולוגיה שנבנתה",
      titleAccent: "כדי להחזיק מעמד ולהסביר את עצמה.",
      description:
        "Progmasoft מתכננת שפות, מהדרים, מערכות בנייה, כלי פיתוח והשירותים שסביבם. הכול נשען על משמעת אחת: חוזים מפורשים, אימות אמיתי ושמות שאומרים את מה שהם מתכוונים.",
      explore: "לגלות את הטכנולוגיה",
      products: "למוצרים",
      poolLabel: "התחומים במאגר הטכנולוגיה של Progmasoft",
    },
    pool: {
      eyebrow: "מאגר טכנולוגיה",
      title: "תחומים, לא רק מוצרים.",
      description:
        "מוצרים נולדים וגדלים; הטכנולוגיה שמתחתיהם היא מה שאנחנו ממשיכים לבנות. כל תחום משרת את כל מה ש־Progmasoft עושה.",
      areas: [
        [
          "שפות ומהדרים",
          "תכנון שפות, מערכות טיפוסים, ייצוגי ביניים ויצירת קוד מכונה.",
        ],
        [
          "בנייה וחבילות",
          "בנייה שחוזרת על עצמה, פתרון תלויות, קובצי נעילה ומאגר חבילות.",
        ],
        ["כלי פיתוח", "מעצבי קוד, לינטרים, שרתי שפה וסביבות פיתוח משולבות."],
        [
          "איכות ובדיקות",
          "בדיקות מבוססות תכונות, בדיקות עם מצב ובדיקות מוטציה, כיסוי ובחירת בדיקות.",
        ],
        [
          "זהות וגישה",
          "חשבונות Progmasoft,‏ OAuth 2.1 ו־OpenID Connect לכל אפליקציה.",
        ],
        [
          "תשתית",
          "שירותים ש־Progmasoft מפעילה בעצמה: אירוח, דואר, מאגרים ואינטגרציה רציפה.",
        ],
      ],
      catalog: "מחפשים מוצר מסוים?",
      catalogLink: "לקטלוג המוצרים",
    },
    principles: {
      eyebrow: "איך אנחנו בונים",
      title: "הנדסה שנשארת קריאה.",
      items: [
        [
          "חוזים מפורשים",
          "גבולות עם טיפוסים חושפים בעלות, תאימות והתנהגות בכשל.",
        ],
        [
          "אימות אמיתי",
          "הבדיקות מפעילות תוצרים מותקנים, נתיבים כמו בייצור והתנהגות נצפית.",
        ],
        [
          "שמות עמידים",
          "אוצר המילים הציבורי הולך אחרי המודל, לא אחרי ההיסטוריה של מימוש.",
        ],
      ],
    },
    developers: {
      eyebrow: "למפתחים",
      title: "לבנות על Progmasoft.",
      description:
        "אפשרו לאנשים להיכנס עם חשבון Progmasoft דרך OAuth 2.1, ונהלו את אסימוני האפליקציות שלכם ב־Progmasoft Console.",
      console: "לפתוח את ה־Console",
      account: "חשבון Progmasoft",
    },
  },
};

export function getHomeMessages(locale: Locale): HomeMessages {
  return homeMessages[locale];
}
