// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Locale } from "./localization";

/**
 * The products of product.progmasoft.com. Each one has a page there and its
 * own site; the catalog only introduces it and leads on.
 */
export const productSlugs = [
  "tazel",
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
  tazel: {
    name: "Tazel",
    site: "https://tazel.net/",
    source: "https://github.com/Progmasoft/tazel",
    accent: "orange",
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
      "The products of Progmasoft: the Tazel build system and the Catch3 testing toolkit.",
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
      tazel: {
        category: "Build system and package manager",
        tagline: "Builds C, C++, Objective-C, Objective-C++ and Zig.",
        description:
          "Tazel reads a module from MODULE.kts and one BUILD.kts per package, compiles each translation unit on its own and builds again only what changed.",
        features: [
          "Kotlin project files, MODULE.kts and BUILD.kts, with labels such as //app/:greeter",
          "Clang, GCC and zig cc from the machine; cross builds by LLVM target triple",
          "Incremental per action, by the content of every input",
          "Commands of your own in tazel_custom.txt",
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
      "Die Produkte von Progmasoft: das Build-System Tazel und das Testwerkzeug Catch3.",
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
      tazel: {
        category: "Build-System und Paketmanager",
        tagline: "Baut C, C++, Objective-C, Objective-C++ und Zig.",
        description:
          "Tazel liest ein Modul aus MODULE.kts und einer BUILD.kts je Paket, übersetzt jede Übersetzungseinheit für sich und baut nur neu, was sich geändert hat.",
        features: [
          "Projektdateien in Kotlin, MODULE.kts und BUILD.kts, mit Labels wie //app/:greeter",
          "Clang, GCC und zig cc vom Rechner; Cross-Builds per LLVM-Target-Triple",
          "Inkrementell je Aktion, nach dem Inhalt jeder Eingabe",
          "Eigene Befehle in tazel_custom.txt",
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
      "Продукты Progmasoft: система сборки Tazel и набор для тестирования Catch3.",
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
      tazel: {
        category: "Система сборки и менеджер пакетов",
        tagline: "Собирает C, C++, Objective-C, Objective-C++ и Zig.",
        description:
          "Tazel читает модуль из MODULE.kts и по одному BUILD.kts на пакет, компилирует каждую единицу трансляции отдельно и пересобирает только то, что изменилось.",
        features: [
          "Файлы проекта на Kotlin, MODULE.kts и BUILD.kts, с метками вида //app/:greeter",
          "Clang, GCC и zig cc с машины; кросс-сборка по LLVM target triple",
          "Инкрементальная сборка на уровне действий, по содержимому каждого входа",
          "Собственные команды в tazel_custom.txt",
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
      "המוצרים של Progmasoft: מערכת הבנייה Tazel וערכת הבדיקות Catch3.",
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
      tazel: {
        category: "מערכת בנייה ומנהל חבילות",
        tagline: "בונה C,‏ C++,‏ Objective-C,‏ Objective-C++ ו־Zig.",
        description:
          "Tazel קורא מודול מ־MODULE.kts ומקובץ BUILD.kts אחד לכל חבילה, מהדר כל יחידת תרגום בנפרד ובונה מחדש רק את מה שהשתנה.",
        features: [
          "קובצי פרויקט ב־Kotlin,‏ MODULE.kts ו־BUILD.kts, עם תוויות כמו //app/:greeter",
          "Clang,‏ GCC ו־zig cc מהמחשב; בנייה צולבת לפי LLVM target triple",
          "בנייה מצטברת ברמת הפעולה, לפי התוכן של כל קלט",
          "פקודות משלך ב־tazel_custom.txt",
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
