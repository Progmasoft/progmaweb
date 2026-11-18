// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  type LicenseMessages,
  examplesA,
  examplesB,
  examplesX,
} from "../licenses.ts";

export const deDE: LicenseMessages = {
  metadataTitle: "Lizenzen von Progmasoft",
  metadataDescription:
    "Die Lizenzen, die Progmasoft geschrieben hat: ihre Texte, was sie erlauben und verbieten und wie man sie verwendet.",
  name: "Progmasoft Proprietary Source License, Version 1.0",
  short: "PM-SPL 1.0",
  notice:
    "Diese Seite erklärt die Lizenz; sie ist nicht die Lizenz. Es gilt der veröffentlichte Text.",
  pages: {
    information: "Informationen",
    faq: "Fragen und Antworten",
    categories: "Lizenzen Dritter",
  },
  texts: "Der Text",
  sums: "SHA-256-Summen",
  identifiers: "SPDX-Bezeichner:",
  index: {
    title: "Lizenzen von Progmasoft",
    description:
      "Lizenzen, die Progmasoft für seine eigene Software geschrieben hat. Jede hat einen festen veröffentlichten Text; eine Änderung ist eine neue Version.",
    pmSpl:
      "Für Software, deren Quelltext Progmasoft veröffentlicht, ohne sie zu Open Source zu machen, etwa das IntelliJ-IDEA-Plugin von Agenceland. Kostenlos; der Quelltext darf gelesen, gebaut, ausgeführt und für den eigenen Gebrauch geändert werden, und nur Progmasoft verbreitet ihn.",
  },
  information: {
    description:
      "Was die PM-SPL 1.0 ist, was sie erlaubt und verbietet und wie ein Projekt sie verwendet.",
    sections: [
      {
        heading: "Was sie ist",
        paragraphs: [
          "Die PM-SPL ist eine Source-available-Lizenz: Der Quelltext der Software ist öffentlich, die Lizenz ist aber keine Open-Source-Lizenz. Lizenzgeber ist Progmasoft, und die Software wird kostenlos bereitgestellt. Derselbe Text dient als Endbenutzerlizenz der Software auf JetBrains Marketplace.",
        ],
      },
      {
        heading: "Was sie erlaubt",
        paragraphs: [
          "Die Software lesen und studieren; sie bauen und auf Rechnern ausführen, die Sie oder Ihre Organisation kontrollieren, für jeden Zweck, auch gewerblich; sie für den Gebrauch Ihrer Organisation ändern und die Änderungen behalten; nach Sicherheitslücken suchen und sie Progmasoft melden; kurze Auszüge in Issues, Diskussionen und Reviews zitieren.",
        ],
      },
      {
        heading: "Was sie verbietet",
        paragraphs: [
          "Die Software oder eine geänderte Fassung an jemanden außerhalb Ihrer Organisation weitergeben, als Quelltext oder als Build: Nur Progmasoft verbreitet sie. Sie verkaufen, vermieten oder unterlizenzieren oder in ein anderes Produkt aufnehmen. Sie oder im Wesentlichen daraus Abgeleitetes als gehosteten oder Netzwerkdienst anbieten. Urheberrechts-, Lizenz- oder Namensnennungshinweise entfernen und technische Maßnahmen umgehen, die den Zugang zu ihr steuern.",
        ],
      },
      {
        heading: "Namen und Werbung",
        paragraphs: [
          "Die Lizenz gibt kein Recht an den Namen Progmasoft, Agenceland oder eines anderen Produkts von Progmasoft, außer um die Herkunft der Software zu beschreiben. Niemand darf sie oder verwechselbar ähnliche Namen verwenden, um eine eigene Fassung, ein eigenes Produkt oder einen eigenen Dienst als offiziell, als von Progmasoft gemacht, gebilligt oder unterstützt oder als Produkt von Progmasoft auszugeben. Werbung im Zusammenhang mit Progmasoft oder einem seiner Produkte muss sagen, dass sie sich auf Progmasoft oder dieses Produkt bezieht.",
        ],
      },
      {
        heading: "Forks, Beiträge und Code Dritter",
        paragraphs: [
          "Die Nutzungsbedingungen von GitHub erlauben dessen Nutzern, ein öffentliches Repository innerhalb von GitHub anzusehen und zu forken, und die Lizenz schränkt das nicht ein; ein Fork bleibt unter der Lizenz und wird nicht außerhalb von GitHub verbreitet.",
          "Beiträge sind willkommen. Wer beiträgt, gibt Progmasoft eine weite Lizenz an dem Beitrag, auch zur Neulizenzierung, und bestätigt, dazu berechtigt zu sein.",
          "Material Dritter in der Software behält seine eigene Lizenz und seine Hinweise.",
        ],
      },
      {
        heading: "Patente, Beendigung und Recht",
        paragraphs: [
          "Die Progmasoft Patent Grant 1.1 gilt, wo die Datei PATENTS.md der Software es sagt, für die Nutzungen, die die Lizenz erlaubt. Wer behauptet, die Software verletze ein Patent, verliert die Patentlizenzen, die er dafür erhalten hat.",
          "Ein Verstoß beendet die Lizenz. Ein erster Verstoß wird vergeben, wenn er binnen 30 Tagen nach einer Mitteilung von Progmasoft behoben wird.",
          "Die Software wird ohne Gewähr bereitgestellt, und die Haftung ist beschränkt, soweit das Gesetz es zulässt. Die Lizenz unterliegt dem Recht von England und Wales, zuständig sind die Gerichte von England und Wales mit Sitz in London.",
        ],
      },
      {
        heading: "Verwendung in einem Projekt",
        paragraphs: [
          "Ein Projekt kopiert den reinen Text nach LICENSES/LicenseRef-PM-SPL-1.0-only.txt oder LICENSES/LicenseRef-PM-SPL-1.0-or-later.txt und nennt diesen Bezeichner im SPDX-Kopf jeder Datei. Mit -only bleibt die Software unter Version 1.0; mit -or-later darf ein Nutzer eine spätere Version wählen, die Progmasoft veröffentlicht.",
          "Maßgeblich ist der reine Text. Die Fassungen in Markdown und reStructuredText enthalten dieselben Worte, nur ausgezeichnet. Neben jeder Datei liegt ihre SHA-256-Summe, und dieselben Dateien liegen im Repository Progmasoft/licenses.",
        ],
      },
    ],
  },
  faq: {
    description: "Kurze Antworten zur PM-SPL 1.0.",
    questions: [
      [
        "Ist die PM-SPL eine Open-Source-Lizenz?",
        "Nein. Der Quelltext ist öffentlich, aber die Verbreitung bleibt Progmasoft vorbehalten; die Lizenz erfüllt daher die Open Source Definition nicht.",
      ],
      [
        "Kostet sie etwas?",
        "Nein. Software unter der PM-SPL 1.0 wird kostenlos bereitgestellt.",
      ],
      [
        "Darf ich sie bei der Arbeit verwenden?",
        "Ja. Sie dürfen sie auf Rechnern bauen und ausführen, die Sie oder Ihre Organisation kontrollieren, für jeden Zweck, auch gewerblich.",
      ],
      [
        "Darf ich sie ändern?",
        "Ja, für den Gebrauch Ihrer Organisation, und Sie dürfen die Änderungen für sich behalten. Eine geänderte Fassung dürfen Sie niemandem außerhalb Ihrer Organisation geben.",
      ],
      [
        "Darf ich einen Build weitergeben oder veröffentlichen?",
        "Nein. Nur Progmasoft verbreitet die Software, zum Beispiel auf JetBrains Marketplace. Verweisen Sie andere auf die Veröffentlichung von Progmasoft.",
      ],
      [
        "Darf ich das Repository auf GitHub forken?",
        "Ja, innerhalb von GitHub, wie dessen Nutzungsbedingungen es erlauben. Der Fork bleibt unter der PM-SPL und wird nicht außerhalb von GitHub verbreitet.",
      ],
      [
        "Darf ich sie als Dienst für andere betreiben?",
        "Nein. Die Software oder im Wesentlichen daraus Abgeleitetes als gehosteten oder Netzwerkdienst anzubieten, ist verboten.",
      ],
      [
        "Darf ich beitragen?",
        "Ja. Beiträge sind willkommen; mit einem Beitrag geben Sie Progmasoft eine weite Lizenz daran, auch zur Neulizenzierung.",
      ],
      [
        "Ich habe eine Sicherheitslücke gefunden. Was tue ich?",
        "Nach Lücken zu suchen ist erlaubt. Schreiben Sie an support@progmasoft.com, was Sie gefunden haben.",
      ],
      [
        "Was geschieht, wenn ich gegen die Lizenz verstoße?",
        "Sie endet. Bei einem ersten Verstoß erhalten Sie Ihre Rechte zurück, wenn Sie ihn binnen 30 Tagen nach der Mitteilung von Progmasoft beheben.",
      ],
      [
        "Welche Version gilt für mich?",
        "Die, die die Software nennt: LicenseRef-PM-SPL-1.0-only ist allein Version 1.0; LicenseRef-PM-SPL-1.0-or-later lässt Sie eine spätere Version wählen, die Progmasoft veröffentlicht.",
      ],
      [
        "Welcher Text ist maßgeblich?",
        "Die Datei mit reinem Text. Die Dateien in Markdown und reStructuredText enthalten dieselben Worte; mit den SHA-256-Summen neben jeder Datei prüfen Sie, dass Sie den veröffentlichten Text haben.",
      ],
    ],
  },
  categories: {
    description:
      "Welche Lizenzen Dritter Software unter der PM-SPL verwenden darf, in den drei Kategorien der Apache Software Foundation.",
    intro:
      "Dies ist eine Regel, der Progmasoft für seine PM-SPL-Software folgt; sie ist nicht Teil des Lizenztexts. Sie entscheidet, welcher Code Dritter eine Abhängigkeit von PM-SPL-Software sein oder in sie kopiert werden darf.",
    category: "Kategorie",
    license: "Lizenz",
    identifier: "SPDX-Bezeichner",
    items: [
      {
        letter: "A",
        name: "Freizügig",
        rule: "Darf eine Abhängigkeit sein und hineinkopiert werden, mit ihren Hinweisen.",
        examples: examplesA,
      },
      {
        letter: "B",
        name: "Schwaches Copyleft",
        rule: "Nur unverändert, als eigener Teil, mit ihren Hinweisen; nie mit dem PM-SPL-Code vermischt.",
        examples: examplesB,
      },
      {
        letter: "X",
        name: "Starkes Copyleft",
        rule: "Nie: weder als Abhängigkeit noch hineinkopiert, da das ganze Werk sonst ihre Lizenz annehmen müsste.",
        examples: examplesX,
      },
    ],
  },
};
