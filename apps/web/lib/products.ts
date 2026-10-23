// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Locale } from "./localization";

/**
 * The products of product.progmasoft.com. Each one has a page there and its
 * own site; the catalog only introduces it and leads on.
 */
export const productSlugs = [
  "tala-lang",
  "talac",
  "talafmt",
  "talalint",
  "tazel",
  "xide",
  "catch3",
] as const;
export type ProductSlug = (typeof productSlugs)[number];

export function isProductSlug(value: string): value is ProductSlug {
  return productSlugs.includes(value as ProductSlug);
}

interface ProductFacts {
  name: string;
  /** The product's own site. */
  site: string;
  /** The public source repository. */
  source: string;
  accent: "violet" | "blue" | "green" | "orange" | "teal" | "slate";
}

export const products: Record<ProductSlug, ProductFacts> = {
  "tala-lang": {
    name: "Tala",
    site: "https://tala.run/",
    source: "https://github.com/Progmasoft/tala",
    accent: "violet",
  },
  talac: {
    name: "talac",
    site: "https://talac.tala.run/",
    source: "https://github.com/Progmasoft/tala",
    accent: "blue",
  },
  talafmt: {
    name: "talafmt",
    site: "https://talafmt.tala.run/",
    source: "https://github.com/Progmasoft/talafmt",
    accent: "teal",
  },
  talalint: {
    name: "talalint",
    site: "https://talalint.tala.run/",
    source: "https://github.com/Progmasoft/talalint",
    accent: "green",
  },
  tazel: {
    name: "Tazel",
    site: "https://tazel.tala.run/",
    source: "https://github.com/Progmasoft/tazel",
    accent: "orange",
  },
  xide: {
    name: "Xide",
    site: "https://ides.progmasoft.com/xide",
    source: "https://github.com/Progmasoft/xide",
    accent: "slate",
  },
  catch3: {
    name: "Catch3",
    site: "https://catch3.progmasoft.com/",
    source: "https://github.com/Progmasoft/catch3",
    accent: "green",
  },
};

interface ProductText {
  category: string;
  tagline: string;
  description: string;
  features: string[];
}

interface CatalogMessages {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  details: string;
  site: string;
  source: string;
  features: string;
  back: string;
  products: Record<ProductSlug, ProductText>;
}

export const catalogMessages: Record<Locale, CatalogMessages> = {
  "en-US": {
    metadataTitle: "Products",
    metadataDescription:
      "The products of Progmasoft: the Tala language and its tools, the Xide IDE and the Catch3 testing toolkit.",
    eyebrow: "Progmasoft products",
    title: "Products",
    description:
      "Each product grows out of the Progmasoft technology pool and has its own site. Choose one to read more.",
    details: "Details",
    site: "Visit the site",
    source: "Source code",
    features: "What it does",
    back: "All products",
    products: {
      "tala-lang": {
        category: "Programming language",
        tagline: "A lazy, statically typed language.",
        description:
          "Tala evaluates by need and checks types before it runs. Programs are organized in namespaces and classes, and an executable starts at a parameterless static Main method.",
        features: [
          "Call-by-need evaluation with effects kept out of sight of the types",
          "Namespaces and classes; no top-level functions",
          "The System standard library and the Progmasoft library",
          "Packages published on ViGet",
        ],
      },
      talac: {
        category: "Compiler",
        tagline: "The Tala compiler.",
        description:
          "talac turns Tala sources into native executables. Its frontend parses, resolves and type-checks in Haskell; its backend lowers through its own intermediate representations to LLVM in C++.",
        features: [
          "One program from any number of source files",
          "Inspectable intermediate stages (.core, .xpp, .xmm)",
          "Native executables through LLVM",
          "A command line read by a typed parser",
        ],
      },
      talafmt: {
        category: "Formatter",
        tagline: "One layout for every Tala file.",
        description:
          "talafmt rewrites Tala sources in place to one consistent layout, or checks them without changing anything.",
        features: [
          "Formats files in place by default",
          "--check for continuous integration",
          "Output as files, standard output, coverage, Checkstyle or JSON",
          "Settings in talafmt.kts",
        ],
      },
      talalint: {
        category: "Linter",
        tagline: "Finds what a compiler lets through.",
        description:
          "talalint reports suspicious Tala code and can fix what it knows how to fix.",
        features: [
          "Reports findings with their location",
          "--fix applies the safe fixes",
          "Settings in talalint.kts",
          "Runs from Tazel with tazel lint",
        ],
      },
      tazel: {
        category: "Build system and package manager",
        tagline: "Builds Tala projects and their packages.",
        description:
          "Tazel reads a project from BUILD.kts, resolves its packages from ViGet, records them in a lockfile and runs talac to build.",
        features: [
          "Projects described in a Kotlin DSL (BUILD.kts)",
          "Packages from ViGet, with a lockfile",
          "Runs the compiler, formatter and linter",
          "Extensible with DSL plugins",
        ],
      },
      xide: {
        category: "Integrated development environment",
        tagline: "The planned IDE for Tala.",
        description:
          "Xide is the integrated development environment for Tala, written in Kotlin with Compose Multiplatform. It is early work and not yet ready for daily use.",
        features: [
          "A desktop shell with a project tree, tabbed editor and problems view",
          "Tala, Kotlin, Java, Groovy and Python with syntax colouring",
          "Checks Tala files with the structured diagnostics of talac",
          "Extensions as Kotlin/JVM JARs",
        ],
      },
      catch3: {
        category: "Testing toolkit",
        tagline: "C++ testing beyond assertions.",
        description:
          "Catch3 keeps Catch2 compatibility and adds a native property-testing engine, with more kinds of testing on its roadmap.",
        features: [
          "Catch2-compatible tests",
          "Property, stateful and metamorphic tests with shrinking",
          "Text snapshots and JUnit-style XML results",
          "Planned: own runner, mocking, coverage and mutation testing",
        ],
      },
    },
  },
  "de-DE": {
    metadataTitle: "Produkte",
    metadataDescription:
      "Die Produkte von Progmasoft: die Sprache Tala und ihre Werkzeuge, die IDE Xide und das Testwerkzeug Catch3.",
    eyebrow: "Progmasoft-Produkte",
    title: "Produkte",
    description:
      "Jedes Produkt wächst aus dem Progmasoft-Technologiepool und hat eine eigene Website. Wählen Sie eines, um mehr zu lesen.",
    details: "Details",
    site: "Zur Website",
    source: "Quellcode",
    features: "Was es kann",
    back: "Alle Produkte",
    products: {
      "tala-lang": {
        category: "Programmiersprache",
        tagline: "Eine träge, statisch typisierte Sprache.",
        description:
          "Tala wertet nach Bedarf aus und prüft Typen vor der Ausführung. Programme sind in Namespaces und Klassen gegliedert; ein Programm beginnt bei einer parameterlosen statischen Main-Methode.",
        features: [
          "Auswertung nach Bedarf, Effekte bleiben für die Typen unsichtbar",
          "Namespaces und Klassen; keine Funktionen auf oberster Ebene",
          "Die Standardbibliothek System und die Progmasoft-Bibliothek",
          "Pakete auf ViGet",
        ],
      },
      talac: {
        category: "Compiler",
        tagline: "Der Tala-Compiler.",
        description:
          "talac übersetzt Tala-Quellen in native Programme. Das Frontend parst, löst Namen auf und prüft Typen in Haskell; das Backend senkt über eigene Zwischendarstellungen in C++ nach LLVM ab.",
        features: [
          "Ein Programm aus beliebig vielen Quelldateien",
          "Einsehbare Zwischenstufen (.core, .xpp, .xmm)",
          "Native Programme über LLVM",
          "Eine Kommandozeile mit typisiertem Parser",
        ],
      },
      talafmt: {
        category: "Formatierer",
        tagline: "Ein Layout für jede Tala-Datei.",
        description:
          "talafmt bringt Tala-Quellen direkt in ein einheitliches Layout oder prüft sie, ohne etwas zu ändern.",
        features: [
          "Formatiert Dateien standardmäßig direkt",
          "--check für die kontinuierliche Integration",
          "Ausgabe als Dateien, Standardausgabe, Abdeckung, Checkstyle oder JSON",
          "Einstellungen in talafmt.kts",
        ],
      },
      talalint: {
        category: "Linter",
        tagline: "Findet, was ein Compiler durchlässt.",
        description:
          "talalint meldet verdächtigen Tala-Code und behebt, was es sicher beheben kann.",
        features: [
          "Meldet Befunde mit ihrer Position",
          "--fix wendet sichere Korrekturen an",
          "Einstellungen in talalint.kts",
          "Läuft aus Tazel mit tazel lint",
        ],
      },
      tazel: {
        category: "Build-System und Paketmanager",
        tagline: "Baut Tala-Projekte und ihre Pakete.",
        description:
          "Tazel liest ein Projekt aus BUILD.kts, löst seine Pakete aus ViGet auf, hält sie in einer Lock-Datei fest und baut mit talac.",
        features: [
          "Projekte in einer Kotlin-DSL (BUILD.kts)",
          "Pakete aus ViGet mit Lock-Datei",
          "Startet Compiler, Formatierer und Linter",
          "Erweiterbar mit DSL-Plugins",
        ],
      },
      xide: {
        category: "Integrierte Entwicklungsumgebung",
        tagline: "Die geplante IDE für Tala.",
        description:
          "Xide ist die integrierte Entwicklungsumgebung für Tala, geschrieben in Kotlin mit Compose Multiplatform. Sie ist in einem frühen Stadium und noch nicht für den täglichen Einsatz bereit.",
        features: [
          "Eine Desktop-Oberfläche mit Projektbaum, Editor-Tabs und Problemansicht",
          "Tala, Kotlin, Java, Groovy und Python mit Syntaxhervorhebung",
          "Prüft Tala-Dateien mit den strukturierten Diagnosen von talac",
          "Erweiterungen als Kotlin/JVM-JARs",
        ],
      },
      catch3: {
        category: "Testwerkzeug",
        tagline: "C++-Tests jenseits von Assertions.",
        description:
          "Catch3 bleibt Catch2-kompatibel und ergänzt eine native Engine für eigenschaftsbasierte Tests; weitere Testarten stehen auf dem Fahrplan.",
        features: [
          "Catch2-kompatible Tests",
          "Eigenschafts-, zustandsbehaftete und metamorphe Tests mit Verkleinerung",
          "Text-Snapshots und XML-Ergebnisse im JUnit-Stil",
          "Geplant: eigener Runner, Mocking, Abdeckung und Mutationstests",
        ],
      },
    },
  },
  "ru-RU": {
    metadataTitle: "Продукты",
    metadataDescription:
      "Продукты Progmasoft: язык Tala и его инструменты, среда разработки Xide и набор для тестирования Catch3.",
    eyebrow: "Продукты Progmasoft",
    title: "Продукты",
    description:
      "Каждый продукт вырастает из технологического пула Progmasoft и имеет собственный сайт. Выберите продукт, чтобы узнать больше.",
    details: "Подробнее",
    site: "Перейти на сайт",
    source: "Исходный код",
    features: "Что он умеет",
    back: "Все продукты",
    products: {
      "tala-lang": {
        category: "Язык программирования",
        tagline: "Ленивый язык со статической типизацией.",
        description:
          "Tala вычисляет по необходимости и проверяет типы до запуска. Программы организованы в пространства имён и классы, а исполняемая программа начинается со статического метода Main без параметров.",
        features: [
          "Вычисление по необходимости; эффекты скрыты от типов",
          "Пространства имён и классы; без функций верхнего уровня",
          "Стандартная библиотека System и библиотека Progmasoft",
          "Пакеты публикуются в ViGet",
        ],
      },
      talac: {
        category: "Компилятор",
        tagline: "Компилятор Tala.",
        description:
          "talac превращает исходные тексты Tala в исполняемые программы. Фронтенд разбирает, разрешает имена и проверяет типы на Haskell; бэкенд на C++ через собственные промежуточные представления доходит до LLVM.",
        features: [
          "Одна программа из любого числа исходных файлов",
          "Доступные для просмотра промежуточные этапы (.core, .xpp, .xmm)",
          "Исполняемые программы через LLVM",
          "Командная строка с типизированным разбором",
        ],
      },
      talafmt: {
        category: "Форматировщик",
        tagline: "Единое оформление для каждого файла Tala.",
        description:
          "talafmt приводит исходные тексты Tala к единому оформлению на месте или только проверяет их, ничего не меняя.",
        features: [
          "По умолчанию форматирует файлы на месте",
          "--check для непрерывной интеграции",
          "Вывод в файлы, стандартный вывод, покрытие, Checkstyle или JSON",
          "Настройки в talafmt.kts",
        ],
      },
      talalint: {
        category: "Линтер",
        tagline: "Находит то, что пропускает компилятор.",
        description:
          "talalint сообщает о подозрительном коде Tala и исправляет то, что умеет исправлять.",
        features: [
          "Сообщает о находках с их местоположением",
          "--fix применяет безопасные исправления",
          "Настройки в talalint.kts",
          "Запускается из Tazel командой tazel lint",
        ],
      },
      tazel: {
        category: "Система сборки и менеджер пакетов",
        tagline: "Собирает проекты Tala и их пакеты.",
        description:
          "Tazel читает проект из BUILD.kts, разрешает его пакеты из ViGet, фиксирует их в lock-файле и собирает с помощью talac.",
        features: [
          "Проекты описываются на Kotlin DSL (BUILD.kts)",
          "Пакеты из ViGet с lock-файлом",
          "Запускает компилятор, форматировщик и линтер",
          "Расширяется DSL-плагинами",
        ],
      },
      xide: {
        category: "Интегрированная среда разработки",
        tagline: "Будущая среда разработки для Tala.",
        description:
          "Xide — интегрированная среда разработки для Tala на Kotlin и Compose Multiplatform. Это ранняя стадия, ещё не готовая к повседневной работе.",
        features: [
          "Настольная оболочка с деревом проекта, вкладками редактора и окном проблем",
          "Tala, Kotlin, Java, Groovy и Python с подсветкой синтаксиса",
          "Проверка файлов Tala через структурированную диагностику talac",
          "Расширения в виде JAR для Kotlin/JVM",
        ],
      },
      catch3: {
        category: "Набор для тестирования",
        tagline: "Тестирование C++ за пределами утверждений.",
        description:
          "Catch3 сохраняет совместимость с Catch2 и добавляет собственный движок тестирования на основе свойств; другие виды тестирования — в планах.",
        features: [
          "Тесты, совместимые с Catch2",
          "Тесты свойств, с состоянием и метаморфные, с упрощением",
          "Текстовые снимки и результаты в XML в стиле JUnit",
          "В планах: свой запускатель, моки, покрытие и мутационное тестирование",
        ],
      },
    },
  },
  "he-IL": {
    metadataTitle: "מוצרים",
    metadataDescription:
      "המוצרים של Progmasoft: שפת Tala והכלים שלה, סביבת הפיתוח Xide וערכת הבדיקות Catch3.",
    eyebrow: "המוצרים של Progmasoft",
    title: "מוצרים",
    description:
      "כל מוצר צומח ממאגר הטכנולוגיה של Progmasoft ויש לו אתר משלו. בחרו מוצר כדי לקרוא עוד.",
    details: "פרטים",
    site: "לאתר",
    source: "קוד מקור",
    features: "מה הוא עושה",
    back: "כל המוצרים",
    products: {
      "tala-lang": {
        category: "שפת תכנות",
        tagline: "שפה עצלה עם טיפוסים סטטיים.",
        description:
          "Tala מחשבת לפי הצורך ובודקת טיפוסים לפני ההרצה. התוכניות מאורגנות במרחבי שמות ובמחלקות, ותוכנית מתחילה במתודת Main סטטית בלי פרמטרים.",
        features: [
          "חישוב לפי הצורך; האפקטים נשארים מחוץ לטיפוסים",
          "מרחבי שמות ומחלקות; אין פונקציות ברמה העליונה",
          "הספרייה הסטנדרטית System והספרייה של Progmasoft",
          "חבילות שמתפרסמות ב־ViGet",
        ],
      },
      talac: {
        category: "מהדר",
        tagline: "המהדר של Tala.",
        description:
          "talac הופך קוד Tala לתוכניות מכונה. החלק הקדמי מנתח, פותר שמות ובודק טיפוסים ב־Haskell; החלק האחורי ב־C++ יורד דרך ייצוגי ביניים משלו אל LLVM.",
        features: [
          "תוכנית אחת מכל מספר של קובצי מקור",
          "שלבי ביניים שאפשר לבחון (‎.core,‏ .xpp,‏ .xmm)",
          "תוכניות מכונה דרך LLVM",
          "שורת פקודה שנקראת במנתח עם טיפוסים",
        ],
      },
      talafmt: {
        category: "מעצב קוד",
        tagline: "פריסה אחת לכל קובץ Tala.",
        description:
          "talafmt משכתב קוד Tala במקום לפריסה אחידה, או בודק אותו בלי לשנות דבר.",
        features: [
          "מעצב קבצים במקום כברירת מחדל",
          "‏--check לאינטגרציה רציפה",
          "פלט כקבצים, פלט תקני, כיסוי, Checkstyle או JSON",
          "הגדרות ב־talafmt.kts",
        ],
      },
      talalint: {
        category: "לינטר",
        tagline: "מוצא את מה שהמהדר מעביר.",
        description:
          "talalint מדווח על קוד Tala חשוד ומתקן את מה שהוא יודע לתקן.",
        features: [
          "מדווח על ממצאים עם המיקום שלהם",
          "‏--fix מחיל את התיקונים הבטוחים",
          "הגדרות ב־talalint.kts",
          "רץ מתוך Tazel עם tazel lint",
        ],
      },
      tazel: {
        category: "מערכת בנייה ומנהל חבילות",
        tagline: "בונה פרויקטים של Tala ואת החבילות שלהם.",
        description:
          "Tazel קורא פרויקט מ־BUILD.kts, פותר את החבילות שלו מ־ViGet, רושם אותן בקובץ נעילה ובונה עם talac.",
        features: [
          "פרויקטים שמתוארים ב־Kotlin DSL ‏(BUILD.kts)",
          "חבילות מ־ViGet עם קובץ נעילה",
          "מפעיל את המהדר, מעצב הקוד והלינטר",
          "ניתן להרחבה בתוספי DSL",
        ],
      },
      xide: {
        category: "סביבת פיתוח משולבת",
        tagline: "סביבת הפיתוח המתוכננת ל־Tala.",
        description:
          "Xide היא סביבת הפיתוח המשולבת ל־Tala, שנכתבת ב־Kotlin עם Compose Multiplatform. היא בשלב מוקדם ועדיין לא מוכנה לשימוש יומיומי.",
        features: [
          "מעטפת לשולחן העבודה עם עץ פרויקט, לשוניות עורך ותצוגת בעיות",
          "Tala,‏ Kotlin,‏ Java,‏ Groovy ו־Python עם צביעת תחביר",
          "בודקת קובצי Tala עם האבחונים המובנים של talac",
          "הרחבות כקובצי JAR של Kotlin/JVM",
        ],
      },
      catch3: {
        category: "ערכת בדיקות",
        tagline: "בדיקות C++‎ מעבר לטענות.",
        description:
          "Catch3 שומרת על תאימות ל־Catch2 ומוסיפה מנוע בדיקות מבוססות תכונות משלה; סוגי בדיקות נוספים נמצאים בתוכנית.",
        features: [
          "בדיקות תואמות Catch2",
          "בדיקות תכונות, בדיקות עם מצב ובדיקות מטמורפיות, עם צמצום",
          "תמונות מצב טקסטואליות ותוצאות XML בסגנון JUnit",
          "בתוכנית: מריץ משלה, אובייקטים מדומים, כיסוי ובדיקות מוטציה",
        ],
      },
    },
  },
};

export function getCatalogMessages(locale: Locale): CatalogMessages {
  return catalogMessages[locale];
}
