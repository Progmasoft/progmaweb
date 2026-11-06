// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { PolicyMessages } from "../policies";

export const deDE: PolicyMessages = {
  versionLabel: "Fassung vom",
  versionDate: "6. November 2026",
  seeAlso: "Siehe auch",
  privacy: {
    title: "Datenschutzerklärung",
    description:
      "Was Progmasoft über Sie speichert, warum, und was Progmasoft niemals damit tut.",
    sections: [
      {
        heading: "Wer wir sind",
        paragraphs: [
          "Progmasoft betreibt progmasoft.com, Progmasoft Account, Progmasoft Credentials und die Progmasoft Console, ViGet, AI Support und die Produktseiten von Progmasoft. Diese Erklärung gilt für all diese Angebote. Fragen dazu richten Sie an support@progmasoft.com.",
        ],
      },
      {
        heading: "Was Ihr Konto speichert",
        paragraphs: [
          "Ihren Kontonamen, Ihre E-Mail-Adresse und entweder einen Hash Ihres Passworts oder die Kennung, die Google Ihrer Google-Identität gibt. Ihr Passwort selbst speichern wir nie: Es wird vor dem Speichern gehasht. Außerdem speichern wir, wann das Konto erstellt wurde und welche Fassung dieser Richtlinien Sie wann angenommen haben.",
          "Solange Sie angemeldet sind, speichern wir einen Digest Ihres Sitzungstokens und den Zeitpunkt, an dem die Sitzung endet. Das Token selbst existiert nur in Ihrem Browser.",
          "Wenn Sie in der Progmasoft Console eine Anwendung registrieren, speichern wir, was Sie dafür angeben.",
        ],
      },
      {
        heading: "Ihre IP-Adresse",
        paragraphs: [
          "Wir speichern Ihre IP-Adresse nur zu einem einzigen Zweck. Wenn Sie ein Paket oder ein Plugin auf ViGet hochladen, speichern wir die IP-Adresse, von der der Upload kam, zusammen mit dem Upload. Stellt sich heraus, dass der Upload Schadsoftware enthält, verwenden wir diese Adresse, um festzustellen, woher er kam, und übergeben sie den zuständigen Behörden. Für nichts anderes verwenden wir sie.",
          "Wir speichern keine IP-Adressen zu Ihrem Konto, zu Ihren Sitzungen oder in den Zugriffsprotokollen unserer Webserver.",
          "Um das Erraten von Passwörtern zu bremsen, zählt der Anmeldedienst einige Minuten lang Anfragen je Adresse. Diese Zählung liegt nur im Arbeitsspeicher und wird nie gespeichert.",
        ],
      },
      {
        heading: "Wir verkaufen Ihre Daten nicht",
        paragraphs: [
          "Wir verkaufen, vermieten oder tauschen Ihre Daten an niemanden, auch nicht Ihre IP-Adresse. Wir verwenden sie nicht für Werbung und erstellen kein Profil von Ihnen.",
        ],
      },
      {
        heading: "Dienste, die Ihre Anfragen sehen",
        paragraphs: [
          "Unsere Seiten werden über Cloudflare ausgeliefert, das jede Anfrage zu uns trägt und die Seiten vor Angriffen schützt. Dafür verarbeitet Cloudflare Ihre IP-Adresse nach seiner eigenen Datenschutzerklärung. Die Seiten verwenden Cloudflare Web Analytics, das Besuche ohne Cookies und ohne Sie zu identifizieren zählt.",
          "Wenn Sie sich mit Google anmelden, teilt Google uns die Kennung und die E-Mail-Adresse Ihrer Google-Identität mit und sonst nichts aus Ihrem Google-Konto.",
          "Fragen an AI Support beantwortet ein Modell, das auf unserem eigenen Server läuft. Sie werden nicht gespeichert und an niemanden weitergegeben.",
        ],
      },
      {
        heading: "Cookies und Speicher",
        paragraphs: [
          "Wir setzen nur die Cookies, die die Seiten brauchen: das Cookie Ihrer Sitzung, die kurzlebigen Cookies der Google-Anmeldung und von Progmasoft Credentials sowie das Cookie, das sich Ihre Sprache merkt. Ihre Wahl zwischen hell und dunkel liegt im Speicher Ihres Browsers. Keines davon dient dazu, Sie zu verfolgen.",
        ],
      },
      {
        heading: "Wie lange wir speichern",
        paragraphs: [
          "Kontodaten bleiben gespeichert, solange das Konto besteht. Eine Sitzung wird entfernt, sobald sie beendet ist. Die IP-Adresse eines ViGet-Uploads bleibt gespeichert, solange der Upload auf ViGet liegt, und ein Jahr nach seiner Entfernung, damit auch einer spät eingehenden Meldung noch nachgegangen werden kann.",
        ],
      },
      {
        heading: "Ihre Rechte",
        paragraphs: [
          "Schreiben Sie von der Adresse Ihres Kontos an support@progmasoft.com, um zu erfahren, was wir über Sie speichern, um es zu berichtigen oder um das Konto löschen zu lassen. Wir antworten innerhalb von 30 Tagen.",
        ],
      },
      {
        heading: "Änderungen",
        paragraphs: [
          "Eine neue Fassung dieser Erklärung trägt auf dieser Seite ein neues Datum. Wir schreiben den Inhabern von Konten, bevor eine neue Fassung wirksam wird.",
        ],
      },
    ],
  },
  security: {
    title: "Sicherheitsrichtlinie",
    description:
      "Wie Progmasoft Ihr Konto und ViGet schützt, was auf ViGet verboten ist und wie Sie eine Schwachstelle melden.",
    sections: [
      {
        heading: "Ihr Konto",
        paragraphs: [
          "Ein Passwort hat mindestens 12 Zeichen und wird nur als Hash gespeichert. Anmeldeversuche sind in ihrer Häufigkeit begrenzt.",
          "Eine Sitzung dauert höchstens 30 Tage und endet, wenn Sie sich abmelden. Ihr Cookie kann von Skripten auf der Seite nicht gelesen werden und wird nur über HTTPS gesendet.",
        ],
      },
      {
        heading: "Verbindungen",
        paragraphs: [
          "Jede Seite von Progmasoft wird nur über HTTPS ausgeliefert, und Browser werden angewiesen, dabei zu bleiben (HSTS). Jede Seite trägt eine Content Security Policy, die nur die Skripte zulässt, die die Seite selbst nennt.",
        ],
      },
      {
        heading: "Schadsoftware auf ViGet",
        paragraphs: [
          "Es ist verboten, Schadsoftware auf ViGet hochzuladen: Software, die den Computern, auf denen sie läuft, schadet, sie ausspäht oder die Kontrolle über sie übernimmt, oder die etwas anderes tut, als sie angibt.",
          "Wenn wir solche Software finden oder auf sie hingewiesen werden, entfernen wir sie, schließen das Konto, das sie hochgeladen hat, und übergeben die IP-Adresse des Uploads den zuständigen Behörden, wie es die Datenschutzerklärung beschreibt.",
          "Jedes Plugin, das ViGet ausliefert, ist mit seinem SHA-256-Digest verzeichnet, und Tazel prüft den Digest, bevor es das Plugin verwendet.",
        ],
      },
      {
        heading: "Worum wir Sie bitten",
        paragraphs: [
          "Wählen Sie ein Passwort, das Sie nirgendwo sonst verwenden, melden Sie sich nur auf Geräten an, denen Sie vertrauen, und melden Sie sich an einem gemeinsam genutzten Computer ab.",
        ],
      },
      {
        heading: "Eine Schwachstelle melden",
        paragraphs: [
          "Wenn Sie eine Sicherheitslücke in einer Seite, einem Produkt oder einem Paket von Progmasoft finden, schreiben Sie an support@progmasoft.com, was Sie gefunden haben. Bitte geben Sie uns Zeit, sie zu beheben, bevor Sie sie veröffentlichen, und lesen oder ändern Sie beim Testen keine Daten anderer Personen.",
        ],
      },
    ],
  },
};
