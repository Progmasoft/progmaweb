// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

/**
 * The text of the product site Progmaweb serves itself, catch3.uk.
 * The facts follow the READMEs and documentation of the product repositories.
 */
interface SitesMessages {
  common: {
    source: string;
    productPage: string;
    status: string;
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
    catch3: {
      eyebrow: "Progmasoft Catch3",
      tagline: "C++ testing beyond assertions.",
      description:
        "Catch3 keeps the expressive test-writing model of Catch2 and adds a C++17 library of its own: native property testing, snapshots and structured results.",
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
    catch3: {
      eyebrow: "Progmasoft Catch3",
      tagline: "C++-Tests jenseits von Assertions.",
      description:
        "Catch3 behält das ausdrucksstarke Testmodell von Catch2 und ergänzt eine eigene C++17-Bibliothek: native Eigenschaftstests, Snapshots und strukturierte Ergebnisse.",
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
    catch3: {
      eyebrow: "Progmasoft Catch3",
      tagline: "Тестирование C++ за пределами утверждений.",
      description:
        "Catch3 сохраняет выразительную модель тестов Catch2 и добавляет собственную библиотеку на C++17: тестирование на основе свойств, снимки и структурированные результаты.",
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
  "fr-FR": {
    common: {
      source: "Code source",
      productPage: "Page du produit",
      status: "État",
    },
    catch3: {
      eyebrow: "Progmasoft Catch3",
      tagline: "Des tests C++ au-delà des assertions.",
      description:
        "Catch3 garde le modèle expressif d’écriture des tests de Catch2 et ajoute sa propre bibliothèque C++17 : tests natifs fondés sur les propriétés, instantanés et résultats structurés.",
      disclaimer:
        "Catch3 est maintenu de façon indépendante. Ce n’est pas une version officielle de Catch2, et il n’est pas approuvé par les mainteneurs de Catch2.",
      exampleTitle: "Une première propriété",
      featuresTitle: "Ce qu’apporte Catch3",
      features: [
        [
          "Des tests familiers",
          "Les assertions, les sections, les reporters, les benchmarks et la ligne de commande continuent de fonctionner grâce à la surface compatible avec Catch2.",
        ],
        [
          "Une réduction qui tient toujours",
          "Les entrées se réduisent à travers leurs choix enregistrés, de sorte qu’un contre-exemple plus petit satisfait encore chaque filtre et chaque dépendance.",
        ],
        [
          "Des échecs qui reviennent",
          "Une base d’exemples rejoue d’abord les échecs à l’exécution suivante, sur chaque machine qui la partage, jusqu’à ce qu’ils soient corrigés.",
        ],
        [
          "Des oracles sans valeurs attendues",
          "Equivalent, Metamorphic, RoundTrip et Idempotent vérifient des propriétés qui n’ont besoin d’aucun résultat attendu, et des machines à états testent le code à état.",
        ],
        [
          "Recherche et couverture",
          "Des scores cibles orientent la recherche vers des entrées rares, et Cover fait échouer une propriété qui atteint trop rarement un cas intéressant.",
        ],
        [
          "Instantanés et résultats",
          "Des instantanés de texte avec des fichiers explicites, et un modèle de résultats structuré écrit en XML au format JUnit.",
        ],
      ],
      roadmapTitle: "Sur la feuille de route",
      roadmap: [
        "Un runner de tests indépendant",
        "Le mocking",
        "La couverture par test",
        "La sélection et la priorisation des tests selon l’impact des changements",
        "Les tests de mutation",
        "La génération de tests guidée par la couverture et la mutation",
      ],
    },
  },
};

export function getSitesMessages(locale: Locale): SitesMessages {
  return sitesMessages[locale];
}
