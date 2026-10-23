// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Locale } from "./localization";

/**
 * The text of the product sites Progmaweb serves itself: ides.progmasoft.com
 * (with Xide at /xide) and catch3.progmasoft.com. The facts follow the
 * READMEs and documentation of the product repositories.
 */
interface SitesMessages {
  common: {
    source: string;
    productPage: string;
    status: string;
  };
  ides: {
    title: string;
    description: string;
    open: string;
  };
  xide: {
    eyebrow: string;
    tagline: string;
    description: string;
    status: string;
    layoutTitle: string;
    layout: [title: string, description: string][];
    languagesTitle: string;
    languagesDescription: string;
    architectureTitle: string;
    architecture: string[];
  };
  catch3: {
    eyebrow: string;
    tagline: string;
    description: string;
    disclaimer: string;
    exampleTitle: string;
    featuresTitle: string;
    features: [title: string, description: string][];
    roadmapTitle: string;
    roadmap: string[];
  };
}

export const sitesMessages: Record<Locale, SitesMessages> = {
  "en-US": {
    common: {
      source: "Source code",
      productPage: "Product page",
      status: "Status",
    },
    ides: {
      title: "Progmasoft IDEs",
      description:
        "Development environments by Progmasoft, built around the Tala tools and the languages next to them.",
      open: "Open",
    },
    xide: {
      eyebrow: "Progmasoft IDEs",
      tagline: "The planned IDE for Tala.",
      description:
        "Xide is an integrated development environment written in Kotlin with Compose Multiplatform. It brings the editor, the project and the Tala compiler's diagnostics into one window.",
      status:
        "Early work: Xide is not ready for daily use. Today it lays the foundation that keeps the architecture coherent.",
      layoutTitle: "A familiar layout",
      layout: [
        [
          "Project",
          "Open a folder as a tree; directories load one level at a time and symbolic links are never followed.",
        ],
        [
          "Editor",
          "A tab per document, line numbers, a marker on each line with a problem, and no silent closing of modified files.",
        ],
        [
          "Problems",
          "Diagnostics bound to the exact document version that was checked; results that went stale are dropped.",
        ],
      ],
      languagesTitle: "Languages",
      languagesDescription:
        "Tala, Kotlin, Java, Groovy and Python open, edit and save, with syntax colouring for all five. Checking is connected for Tala: Xide runs talac and reads its structured diagnostics instead of scraping terminal text.",
      architectureTitle: "Architecture",
      architecture: [
        "Kotlin/JVM components with a Compose Multiplatform desktop interface",
        "A minimized Java runtime ships with Xide; no separate JDK to install",
        "Extensions are Kotlin/JVM JARs loaded from the extension directory",
      ],
    },
    catch3: {
      eyebrow: "Progmasoft Catch3",
      tagline: "C++ testing beyond assertions.",
      description:
        "Catch3 keeps the expressive test-writing model of Catch2 and adds a C++20 library of its own: native property testing, snapshots and structured results.",
      disclaimer:
        "Catch3 is independently maintained. It is not an official Catch2 release and is not endorsed by Catch2's maintainers.",
      exampleTitle: "A first property",
      featuresTitle: "What Catch3 adds",
      features: [
        [
          "Familiar tests",
          "Assertions, sections, reporters, benchmarks and the command line keep working through the Catch2-compatible surface.",
        ],
        [
          "Shrinking that always holds",
          "Inputs shrink through their recorded choices, so a smaller counterexample still satisfies every filter and dependency.",
        ],
        [
          "Failures that come back",
          "An example database replays failures first on the next run, on every machine that shares it, until they are fixed.",
        ],
        [
          "Oracles without expected values",
          "Equivalent, Metamorphic, RoundTrip and Idempotent check properties that need no expected result, and state machines test stateful code.",
        ],
        [
          "Search and coverage",
          "Target scores guide the search towards rare inputs, and Cover fails a property that reaches an interesting case too rarely.",
        ],
        [
          "Snapshots and results",
          "Text snapshots with explicit files, and a structured result model written as JUnit-style XML.",
        ],
      ],
      roadmapTitle: "On the roadmap",
      roadmap: [
        "An independent test runner",
        "Mocking",
        "Coverage per test",
        "Change-impact test selection and prioritization",
        "Mutation testing",
        "Coverage- and mutation-guided test generation",
      ],
    },
  },
  "de-DE": {
    common: {
      source: "Quellcode",
      productPage: "Produktseite",
      status: "Status",
    },
    ides: {
      title: "Progmasoft-IDEs",
      description:
        "Entwicklungsumgebungen von Progmasoft, gebaut um die Tala-Werkzeuge und die Sprachen daneben.",
      open: "Öffnen",
    },
    xide: {
      eyebrow: "Progmasoft-IDEs",
      tagline: "Die geplante IDE für Tala.",
      description:
        "Xide ist eine integrierte Entwicklungsumgebung in Kotlin mit Compose Multiplatform. Sie vereint Editor, Projekt und die Diagnosen des Tala-Compilers in einem Fenster.",
      status:
        "Frühes Stadium: Xide ist noch nicht für den täglichen Einsatz bereit. Derzeit entsteht das Fundament, das die Architektur zusammenhält.",
      layoutTitle: "Eine vertraute Anordnung",
      layout: [
        [
          "Projekt",
          "Einen Ordner als Baum öffnen; Verzeichnisse laden Ebene für Ebene, symbolischen Links wird nie gefolgt.",
        ],
        [
          "Editor",
          "Ein Tab pro Dokument, Zeilennummern, eine Markierung an jeder Zeile mit einem Problem und kein stilles Schließen geänderter Dateien.",
        ],
        [
          "Probleme",
          "Diagnosen gehören genau zu der geprüften Dokumentversion; veraltete Ergebnisse werden verworfen.",
        ],
      ],
      languagesTitle: "Sprachen",
      languagesDescription:
        "Tala, Kotlin, Java, Groovy und Python lassen sich öffnen, bearbeiten und speichern, alle fünf mit Syntaxhervorhebung. Die Prüfung ist für Tala angebunden: Xide startet talac und liest seine strukturierten Diagnosen, statt Terminaltext auszuwerten.",
      architectureTitle: "Architektur",
      architecture: [
        "Kotlin/JVM-Komponenten mit einer Desktop-Oberfläche in Compose Multiplatform",
        "Xide bringt eine minimierte Java-Laufzeit mit; kein separates JDK nötig",
        "Erweiterungen sind Kotlin/JVM-JARs aus dem Erweiterungsverzeichnis",
      ],
    },
    catch3: {
      eyebrow: "Progmasoft Catch3",
      tagline: "C++-Tests jenseits von Assertions.",
      description:
        "Catch3 behält das ausdrucksstarke Testmodell von Catch2 und ergänzt eine eigene C++20-Bibliothek: native Eigenschaftstests, Snapshots und strukturierte Ergebnisse.",
      disclaimer:
        "Catch3 wird unabhängig gepflegt. Es ist keine offizielle Catch2-Version und wird von den Catch2-Maintainern nicht unterstützt.",
      exampleTitle: "Eine erste Eigenschaft",
      featuresTitle: "Was Catch3 ergänzt",
      features: [
        [
          "Vertraute Tests",
          "Assertions, Sections, Reporter, Benchmarks und die Kommandozeile funktionieren weiter über die Catch2-kompatible Oberfläche.",
        ],
        [
          "Verkleinerung, die immer gilt",
          "Eingaben werden über ihre aufgezeichneten Entscheidungen verkleinert; ein kleineres Gegenbeispiel erfüllt weiterhin alle Filter und Abhängigkeiten.",
        ],
        [
          "Fehler, die wiederkommen",
          "Eine Beispieldatenbank spielt Fehler im nächsten Lauf zuerst ab, auf jedem Rechner, der sie teilt, bis sie behoben sind.",
        ],
        [
          "Orakel ohne erwartete Werte",
          "Equivalent, Metamorphic, RoundTrip und Idempotent prüfen Eigenschaften ohne erwartetes Ergebnis; Zustandsmaschinen testen zustandsbehafteten Code.",
        ],
        [
          "Suche und Abdeckung",
          "Target-Werte lenken die Suche zu seltenen Eingaben, und Cover lässt eine Eigenschaft scheitern, die einen interessanten Fall zu selten erreicht.",
        ],
        [
          "Snapshots und Ergebnisse",
          "Text-Snapshots mit expliziten Dateien und ein strukturiertes Ergebnismodell als XML im JUnit-Stil.",
        ],
      ],
      roadmapTitle: "Auf dem Fahrplan",
      roadmap: [
        "Ein eigener Test-Runner",
        "Mocking",
        "Abdeckung pro Test",
        "Testauswahl und Priorisierung nach Änderungsauswirkung",
        "Mutationstests",
        "Abdeckungs- und mutationsgesteuerte Testerzeugung",
      ],
    },
  },
  "ru-RU": {
    common: {
      source: "Исходный код",
      productPage: "Страница продукта",
      status: "Статус",
    },
    ides: {
      title: "Среды разработки Progmasoft",
      description:
        "Среды разработки Progmasoft, построенные вокруг инструментов Tala и соседних языков.",
      open: "Открыть",
    },
    xide: {
      eyebrow: "Среды разработки Progmasoft",
      tagline: "Будущая среда разработки для Tala.",
      description:
        "Xide — интегрированная среда разработки на Kotlin и Compose Multiplatform. Она объединяет редактор, проект и диагностику компилятора Tala в одном окне.",
      status:
        "Ранняя стадия: Xide ещё не готова к повседневной работе. Сейчас закладывается основа, которая сохраняет архитектуру цельной.",
      layoutTitle: "Привычная компоновка",
      layout: [
        [
          "Проект",
          "Папка открывается деревом; каталоги загружаются по одному уровню, по символическим ссылкам переход не выполняется.",
        ],
        [
          "Редактор",
          "Вкладка на каждый документ, номера строк, отметка у каждой строки с проблемой и никакого тихого закрытия изменённых файлов.",
        ],
        [
          "Проблемы",
          "Диагностика привязана к той версии документа, которая проверялась; устаревшие результаты отбрасываются.",
        ],
      ],
      languagesTitle: "Языки",
      languagesDescription:
        "Tala, Kotlin, Java, Groovy и Python открываются, редактируются и сохраняются, все пять — с подсветкой синтаксиса. Проверка подключена для Tala: Xide запускает talac и читает его структурированную диагностику, а не разбирает текст терминала.",
      architectureTitle: "Архитектура",
      architecture: [
        "Компоненты на Kotlin/JVM с настольным интерфейсом на Compose Multiplatform",
        "Вместе с Xide поставляется минимальная среда Java; отдельный JDK не нужен",
        "Расширения — это JAR для Kotlin/JVM из каталога расширений",
      ],
    },
    catch3: {
      eyebrow: "Progmasoft Catch3",
      tagline: "Тестирование C++ за пределами утверждений.",
      description:
        "Catch3 сохраняет выразительную модель тестов Catch2 и добавляет собственную библиотеку на C++20: тестирование на основе свойств, снимки и структурированные результаты.",
      disclaimer:
        "Catch3 развивается независимо. Это не официальный выпуск Catch2, и сопровождающие Catch2 его не поддерживают.",
      exampleTitle: "Первое свойство",
      featuresTitle: "Что добавляет Catch3",
      features: [
        [
          "Привычные тесты",
          "Утверждения, секции, отчёты, бенчмарки и командная строка работают через совместимый с Catch2 интерфейс.",
        ],
        [
          "Упрощение, которое не ломается",
          "Входные данные упрощаются через записанные выборы, поэтому меньший контрпример по-прежнему проходит все фильтры и зависимости.",
        ],
        [
          "Ошибки, которые возвращаются",
          "База примеров первым делом повторяет найденные ошибки при следующем запуске на каждой машине, где она общая, пока их не исправят.",
        ],
        [
          "Оракулы без ожидаемых значений",
          "Equivalent, Metamorphic, RoundTrip и Idempotent проверяют свойства без ожидаемого результата, а конечные автоматы тестируют код с состоянием.",
        ],
        [
          "Поиск и покрытие",
          "Оценки Target ведут поиск к редким входам, а Cover проваливает свойство, которое слишком редко доходит до интересного случая.",
        ],
        [
          "Снимки и результаты",
          "Текстовые снимки с явными файлами и структурированная модель результатов в XML в стиле JUnit.",
        ],
      ],
      roadmapTitle: "В планах",
      roadmap: [
        "Собственный запускатель тестов",
        "Моки",
        "Покрытие по каждому тесту",
        "Выбор и приоритизация тестов по влиянию изменений",
        "Мутационное тестирование",
        "Генерация тестов под управлением покрытия и мутаций",
      ],
    },
  },
  "he-IL": {
    common: {
      source: "קוד מקור",
      productPage: "דף המוצר",
      status: "מצב",
    },
    ides: {
      title: "סביבות הפיתוח של Progmasoft",
      description:
        "סביבות פיתוח של Progmasoft, שנבנות סביב כלי Tala והשפות שלצידם.",
      open: "לפתוח",
    },
    xide: {
      eyebrow: "סביבות הפיתוח של Progmasoft",
      tagline: "סביבת הפיתוח המתוכננת ל־Tala.",
      description:
        "Xide היא סביבת פיתוח משולבת שנכתבת ב־Kotlin עם Compose Multiplatform. היא מביאה את העורך, הפרויקט והאבחונים של מהדר Tala לחלון אחד.",
      status:
        "שלב מוקדם: Xide עדיין לא מוכנה לשימוש יומיומי. כרגע נבנה הבסיס ששומר על ארכיטקטורה עקבית.",
      layoutTitle: "פריסה מוכרת",
      layout: [
        [
          "פרויקט",
          "פתיחת תיקייה כעץ; תיקיות נטענות רמה אחר רמה, וקישורים סימבוליים לא נעקבים לעולם.",
        ],
        [
          "עורך",
          "לשונית לכל מסמך, מספרי שורות, סימון בכל שורה עם בעיה, ואין סגירה שקטה של קבצים שהשתנו.",
        ],
        [
          "בעיות",
          "האבחונים קשורים לגרסת המסמך המדויקת שנבדקה; תוצאות שהתיישנו נזרקות.",
        ],
      ],
      languagesTitle: "שפות",
      languagesDescription:
        "Tala,‏ Kotlin,‏ Java,‏ Groovy ו־Python נפתחות, נערכות ונשמרות, כולן עם צביעת תחביר. הבדיקה מחוברת ל־Tala: ‏Xide מריצה את talac וקוראת את האבחונים המובנים שלו במקום לפענח טקסט מהמסוף.",
      architectureTitle: "ארכיטקטורה",
      architecture: [
        "רכיבי Kotlin/JVM עם ממשק לשולחן העבודה ב־Compose Multiplatform",
        "סביבת Java מצומצמת מגיעה עם Xide; אין צורך להתקין JDK נפרד",
        "הרחבות הן קובצי JAR של Kotlin/JVM מתיקיית ההרחבות",
      ],
    },
    catch3: {
      eyebrow: "Progmasoft Catch3",
      tagline: "בדיקות C++‎ מעבר לטענות.",
      description:
        "Catch3 שומרת על מודל כתיבת הבדיקות של Catch2 ומוסיפה ספריית C++20 משלה: בדיקות מבוססות תכונות, תמונות מצב ותוצאות מובנות.",
      disclaimer:
        "Catch3 מתוחזקת באופן עצמאי. היא אינה גרסה רשמית של Catch2 ואינה נתמכת על ידי המתחזקים של Catch2.",
      exampleTitle: "תכונה ראשונה",
      featuresTitle: "מה Catch3 מוסיפה",
      features: [
        [
          "בדיקות מוכרות",
          "טענות, סעיפים, מדווחים, מדדי ביצועים ושורת הפקודה ממשיכים לעבוד דרך הממשק התואם ל־Catch2.",
        ],
        [
          "צמצום שתמיד תקף",
          "הקלטים מצטמצמים דרך הבחירות שנרשמו, כך שדוגמה נגדית קטנה יותר עדיין עומדת בכל המסננים והתלויות.",
        ],
        [
          "כשלים שחוזרים",
          "מסד דוגמאות מריץ קודם את הכשלים בהרצה הבאה, בכל מחשב שחולק אותו, עד שהם מתוקנים.",
        ],
        [
          "אורקלים בלי ערכים צפויים",
          "Equivalent,‏ Metamorphic,‏ RoundTrip ו־Idempotent בודקים תכונות שלא צריכות תוצאה צפויה, ומכונות מצבים בודקות קוד עם מצב.",
        ],
        [
          "חיפוש וכיסוי",
          "ציוני Target מכוונים את החיפוש לקלטים נדירים, ו־Cover מכשיל תכונה שמגיעה למקרה מעניין לעיתים רחוקות מדי.",
        ],
        [
          "תמונות מצב ותוצאות",
          "תמונות מצב טקסטואליות עם קבצים מפורשים, ומודל תוצאות מובנה שנכתב כ־XML בסגנון JUnit.",
        ],
      ],
      roadmapTitle: "בתוכנית",
      roadmap: [
        "מריץ בדיקות עצמאי",
        "אובייקטים מדומים",
        "כיסוי לכל בדיקה",
        "בחירת בדיקות ותעדוף לפי השפעת השינוי",
        "בדיקות מוטציה",
        "יצירת בדיקות מונחית כיסוי ומוטציות",
      ],
    },
  },
};

export function getSitesMessages(locale: Locale): SitesMessages {
  return sitesMessages[locale];
}
