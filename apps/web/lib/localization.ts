// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

export const supportedLocales = ["en-US", "de-DE", "ru-RU", "he-IL"] as const;
export type Locale = (typeof supportedLocales)[number];

/** The language of a visitor whose browser asks for none that is published. */
export const fallbackLocale: Locale = "en-US";

export function isLocale(value: string | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
}

/** Each language named in that language, as a language menu shows it. */
export const localeNames: Record<Locale, string> = {
  "en-US": "English",
  "de-DE": "Deutsch",
  "ru-RU": "Русский",
  "he-IL": "עברית",
};

/**
 * The direction in which the text of a language runs.
 *
 * Only text follows it. The page layout, the navigation and code samples keep
 * their left-to-right arrangement in every language.
 */
export function textDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "he-IL" ? "rtl" : "ltr";
}

/** The arrow that points onward in the reading direction of a language. */
export function forwardArrow(locale: Locale): string {
  return textDirection(locale) === "rtl" ? "←" : "→";
}

// Primary language subtags and the published locale each one selects. `iw` is
// the former code for Hebrew, which some browsers still send.
const localeByLanguage = new Map<string, Locale>([
  ["en", "en-US"],
  ["de", "de-DE"],
  ["ru", "ru-RU"],
  ["he", "he-IL"],
  ["iw", "he-IL"],
]);

/**
 * Chooses the published locale a browser prefers.
 *
 * The argument is an `Accept-Language` header: a list of language ranges,
 * each with an optional quality. The range with the highest quality whose
 * primary language is published wins, and the order of the header breaks
 * ties. A missing header, a header without a published language and a range
 * the visitor refuses with quality zero all give the fallback locale. The
 * header comes from the browser and is not trusted, so only its beginning is
 * read.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return fallbackLocale;
  }
  let selected: Locale = fallbackLocale;
  let selectedQuality = 0;
  for (const range of acceptLanguage.slice(0, 1024).split(",")) {
    const [tag = "", ...parameters] = range.trim().split(";");
    const language = tag.trim().split("-", 1)[0] ?? "";
    const locale = localeByLanguage.get(language.toLowerCase());
    if (!locale) {
      continue;
    }
    let quality = 1;
    for (const parameter of parameters) {
      const [name, value] = parameter.trim().split("=");
      if (name === "q") {
        quality = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value ?? "")
          ? Number(value)
          : 0;
      }
    }
    if (quality > selectedQuality) {
      selected = locale;
      selectedQuality = quality;
    }
  }
  return selected;
}

export const localeCookieName = "progmasoft_locale";

export interface LocaleCookieOptions {
  domain: string | undefined;
  httpOnly: true;
  maxAge: number;
  sameSite: "lax";
  secure: boolean;
}

/**
 * Attributes of the language-preference cookie.
 *
 * The preference is shared by every Progmasoft host, so on a production host
 * the cookie belongs to the registrable domain. Any other host, such as a
 * local development name, keeps a host-only cookie. The proxy redirect and
 * the in-page language switch must write the same cookie, or one would leave
 * a second cookie behind that shadows the other.
 */
export function localeCookieOptions(
  host: string,
  secure: boolean,
): LocaleCookieOptions {
  const isProductionHost =
    host === "progmasoft.com" || host.endsWith(".progmasoft.com");
  return {
    domain: isProductionHost ? ".progmasoft.com" : undefined,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure,
  };
}

/** The host a request was addressed to, without its port and in lower case. */
export function requestHost(
  forwardedHost: string | null,
  host: string | null,
): string {
  return (forwardedHost ?? host)?.split(":", 1)[0]?.toLowerCase() ?? "";
}

export const messages = {
  "en-US": {
    metadata: {
      homeTitle: "Progmasoft",
      homeDescription:
        "Progmasoft builds programming-language, package-management, and developer-tooling systems.",
      accountTitle: "Account",
      accountDescription: "Access and manage your Progmasoft account.",
      loginTitle: "Sign in",
      registerTitle: "Create account",
      recoveryTitle: "Recover your account",
      recoveryDescription: "Get help regaining access to a Progmasoft account.",
      dashboardTitle: "Dashboard",
      vigetTitle: "ViGet Package Registry by Progmasoft",
      vigetDescription:
        "The Visual X# package registry is online, but no packages have been published yet.",
      dslPluginsTitle: "DSL Plugins · ViGet Package Registry by Progmasoft",
      dslPluginsDescription:
        "The ViGet Kotlin DSL plugin catalog is online, but no plugins have been published yet.",
    },
    navigation: {
      primary: "Primary navigation",
      organization: "Organization",
      products: "Products",
      principles: "Principles",
      account: "Account",
      dashboard: "Dashboard",
      signIn: "Sign in",
      createAccount: "Create account",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      language: "Language",
    },
    footer: {
      summary:
        "Programming-language infrastructure and developer systems built with durable contracts.",
      products: "Products",
      openSource: "Open source",
      organization: "Organization",
      support: "Support",
      websiteSource: "Website source",
      closing: "Designed for clarity, security, and long-term maintenance.",
    },
    home: {
      heroEyebrow: "Developer systems by Progmasoft",
      heroTitleStart: "Tools should make hard work",
      heroTitleAccent: "understandable.",
      heroDescription:
        "We build programming-language infrastructure, package systems, and developer tools around explicit contracts instead of accidental complexity.",
      exploreProducts: "Explore products",
      browseSource: "Browse source",
      facts: [
        ["Open", "Public engineering"],
        ["Typed", "Contracts before shortcuts"],
        ["Native", "Performance without mystery"],
      ],
      visualLabel: "Progmasoft product principles",
      stack: [
        [
          "Products",
          "Focused experiences",
          "Clear purpose · durable names · public identity",
        ],
        [
          "Platform",
          "Shared account foundation",
          "Authentication · service access · recovery",
        ],
        [
          "Operations",
          "First-party infrastructure",
          "Observable · maintainable · directly operated",
        ],
      ],
      productsEyebrow: "Products and projects",
      productsTitle: "One ecosystem, clear boundaries.",
      productsDescription:
        "Each surface has one responsibility and a documented contract with the next layer.",
      products: [
        [
          "Programming language",
          "Visual X#",
          "A modern programming language developed by Progmasoft, with its own dedicated product and documentation site.",
          "Explore Visual X#",
        ],
        [
          "Package registry",
          "ViGet",
          "The canonical package and DSL-plugin registry for the Visual X# ecosystem, operated directly by Progmasoft.",
          "Open ViGet",
        ],
        [
          "Developer tooling",
          "Open engineering",
          "Compiler, formatter, linter, analyzer, project-system, and editor work developed in public repositories.",
          "View on GitHub",
        ],
      ],
      principlesEyebrow: "Engineering principles",
      principlesTitle: "Built to remain legible.",
      principlesDescription:
        "Architecture is useful only when a new contributor can understand where a decision belongs and how to verify it.",
      principles: [
        [
          "Explicit contracts",
          "Typed boundaries make ownership, compatibility, and failure behavior visible.",
        ],
        [
          "Real verification",
          "Tests exercise installed artifacts, production-shaped paths, and observable behavior.",
        ],
        [
          "Durable naming",
          "Public vocabulary follows the product model rather than historical implementation accidents.",
        ],
      ],
      accountEyebrow: "Progmasoft account",
      accountTitle: "A single identity for Progmasoft services.",
      accountDescription:
        "Manage your profile and future service access from the dedicated account surface.",
      openAccount: "Open account",
    },
    account: {
      securityLabel: "Account security properties",
      trust: [
        "Secure session cookie",
        "Server-side password hashing",
        "Rate-limited authentication",
      ],
      landingEyebrow: "Progmasoft account",
      landingTitle: "One clear identity for every supported service.",
      landingDescription:
        "Your account keeps profile, authentication, and service access under a dedicated security boundary.",
      identity: [
        [
          "Account name",
          "Your durable public identity and ViGet publisher name",
        ],
        ["Email", "Recovery and security notices"],
        ["Session", "Secure, revocable browser access"],
      ],
      features: [
        [
          "Deliberate security",
          "Passwords are hashed server-side and session tokens are stored only as digests.",
        ],
        [
          "Predictable names",
          "Canonical account names prevent ambiguous URLs and case-only impersonation. ViGet uses this exact name as the package publisher; it does not create a second identity.",
        ],
        [
          "Service boundaries",
          "Products request explicit account access instead of sharing hidden application state.",
        ],
      ],
      loginEyebrow: "Progmasoft account",
      loginTitle: "Sign in securely.",
      loginDescription:
        "Continue to your account dashboard and connected services.",
      registerEyebrow: "Create an identity",
      registerTitle: "Start with a durable account.",
      registerDescription:
        "Choose the name used in your Progmasoft account URL.",
      recoveryEyebrow: "Account support",
      recoveryTitle: "Recover your account.",
      recoveryDescription:
        "Use the verified support channel when you can no longer sign in.",
      recoveryPanelEyebrow: "Account recovery",
      recoveryPanelTitle: "Regain access safely",
      recoveryPanelDescription:
        "Automated password recovery is not available during the initial account-system rollout. Contact Progmasoft support from the email address registered to your account so ownership can be verified.",
      recoveryEmailSubject: "Progmasoft account recovery",
      contactSupport: "Contact support",
      rememberedPassword: "Remembered your password?",
      returnToSignIn: "Return to sign in",
    },
    auth: {
      createHeading: "Create your account",
      loginHeading: "Welcome back",
      createDescription:
        "Use one Progmasoft identity across supported services.",
      loginDescription:
        "Sign in with the email address attached to your Progmasoft account.",
      accountName: "Account name",
      accountHint:
        "Use 8–128 ASCII letters or digits and begin with an uppercase letter.",
      email: "Email address",
      password: "Password",
      forgotPassword: "Forgot password?",
      passwordHint:
        "Use at least 12 characters. Long passphrases are supported.",
      confirmPassword: "Confirm password",
      show: "Show",
      hide: "Hide",
      working: "Working…",
      create: "Create account",
      signIn: "Sign in",
      or: "or",
      google: "Continue with Google",
      already: "Already have an account?",
      newUser: "New to Progmasoft?",
      createLink: "Create an account",
      mismatch: "The password confirmation does not match.",
      unreachable:
        "The account service is temporarily unreachable. Try again shortly.",
      missingName: "The server did not return an account name.",
      unreadableName: "The Account name field could not be read.",
      requestFailed: "The request could not be completed.",
      googleSignInFailed: "Google sign-in could not be completed. Try again.",
      googleAccountNameRequired:
        "Choose an Account name before continuing with Google.",
      googleAccountNameUnavailable:
        "That Account name is unavailable. Choose another name.",
      googleInvalidAccountName:
        "Use a valid Account name before continuing with Google.",
    },
    dashboard: {
      loading: "Loading account…",
      loadFailed: "The dashboard could not be loaded.",
      unreachable: "The account service is temporarily unreachable.",
      navigation: "Dashboard navigation",
      overview: "Overview",
      security: "Security",
      services: "Services",
      signOut: "Sign out",
      eyebrow: "Account overview",
      welcome: "Welcome",
      description: "Manage the identity used by Progmasoft services.",
      profile: "Profile",
      identity: "Account identity",
      accountName: "Account name",
      publisherName: "ViGet publisher name",
      email: "Email",
      created: "Created",
      passwordSessions: "Password and sessions",
      securityDescription:
        "Your browser uses an HttpOnly secure session cookie. Session secrets are never stored as plaintext.",
      changePassword: "Change password",
      products: "Connected Progmasoft products",
      publisherPrefix: "Publisher name",
      sameAccount: "your Account name",
      profileDescription: "Developer ecosystem profile",
      planned: "Planned",
    },
    viget: {
      navigationLabel: "Registry navigation",
      packages: "Packages",
      dslPlugins: "DSL plugins",
      account: "Account",
      login: "Log in",
      register: "Register",
      homeEyebrow: "ViGet package registry",
      homeTitle: "Packages for the Visual X# ecosystem.",
      homeDescription:
        "ViGet is the canonical source for Visual X# packages and project DSL plugins, operated directly by Progmasoft.",
      createAccount: "Create account",
      exploreVisualXSharp: "Explore Visual X#",
      available: "Registry available",
      emptyTitle: "The public catalog is empty.",
      emptyDescription:
        "No package releases have been published yet. ViGet will show real packages here as they become available.",
      packageFormat: "Package format",
      publisherIdentity: "Publisher identity",
      publishing: "Publishing",
      publishingClosed: "Not open yet",
      catalogsEyebrow: "Catalogs",
      catalogsTitle: "Two artifact types, one registry.",
      catalogsDescription:
        "Packages and project DSL plugins have separate, predictable coordinate spaces.",
      visualPackages: "Visual X# packages",
      vipkgCatalog: "ViPkg catalog",
      vipkgDescription:
        "Libraries and applications authored in Visual X#, distributed as .vipkg artifacts.",
      projectExtensions: "Project extensions",
      kotlinPlugins: "Kotlin DSL plugins",
      kotlinDescription:
        "Kotlin JAR plugins that extend Visual.XSharp.kts project configuration.",
      openCatalog: "Open catalog",
      contractEyebrow: "Registry contract",
      contractTitle: "Clear ownership from identity to artifact.",
      principles: [
        [
          "One account name",
          "Your Progmasoft Account name is also your ViGet publisher name.",
        ],
        [
          "Case-sensitive coordinates",
          "Publisher and package names retain their exact public spelling.",
        ],
        [
          "No placeholder releases",
          "The catalog stays honestly empty until a real signed artifact is published.",
        ],
      ],
      pluginEyebrow: "ViGet · Kotlin DSL plugins",
      pluginTitle: "Extend the project model.",
      pluginDescription:
        "Kotlin DSL plugins are JAR artifacts for Visual.XSharp.kts. They are separate from Visual X# .vipkg packages.",
      backToPackages: "Back to packages",
      followDevelopment: "Follow development",
      pluginAvailable: "Catalog available",
      pluginEmptyTitle: "No public DSL plugins yet.",
      pluginEmptyDescription:
        "The catalog is ready and intentionally contains no placeholder artifacts.",
      guidance: [
        [
          "Format",
          "Kotlin JAR",
          "DSL plugins run as Kotlin/JVM project extensions.",
        ],
        [
          "Location",
          "Dedicated catalog",
          "Plugin coordinates always begin with /dslplugins.",
        ],
        [
          "Availability",
          "Publishing closed",
          "Publishing opens only after the signed plugin contract is complete.",
        ],
      ],
      footerDescription:
        "ViGet is the package and Kotlin DSL plugin registry for the Visual X# ecosystem.",
      registry: "Registry",
      support: "Support",
      source: "Source",
      footerClosing: "ViGet Package Registry by Progmasoft",
    },
  },
  "de-DE": {
    metadata: {
      homeTitle: "Progmasoft",
      homeDescription:
        "Progmasoft entwickelt Systeme für Programmiersprachen, Paketverwaltung und Entwicklerwerkzeuge.",
      accountTitle: "Konto",
      accountDescription: "Öffnen und verwalten Sie Ihr Progmasoft-Konto.",
      loginTitle: "Anmelden",
      registerTitle: "Konto erstellen",
      recoveryTitle: "Konto wiederherstellen",
      recoveryDescription:
        "Erhalten Sie Hilfe beim Wiederherstellen des Zugriffs auf ein Progmasoft-Konto.",
      dashboardTitle: "Kontoübersicht",
      vigetTitle: "ViGet-Paketregistrierung von Progmasoft",
      vigetDescription:
        "Die Visual-X#-Paketregistrierung ist online, enthält aber noch keine veröffentlichten Pakete.",
      dslPluginsTitle: "DSL-Plugins · ViGet-Paketregistrierung von Progmasoft",
      dslPluginsDescription:
        "Der ViGet-Katalog für Kotlin-DSL-Plugins ist online, enthält aber noch keine veröffentlichten Plugins.",
    },
    navigation: {
      primary: "Hauptnavigation",
      organization: "Organisation",
      products: "Produkte",
      principles: "Grundsätze",
      account: "Konto",
      dashboard: "Übersicht",
      signIn: "Anmelden",
      createAccount: "Konto erstellen",
      theme: "Darstellung",
      light: "Hell",
      dark: "Dunkel",
      language: "Sprache",
    },
    footer: {
      summary:
        "Programmiersprachen-Infrastruktur und Entwicklersysteme auf der Grundlage beständiger Verträge.",
      products: "Produkte",
      openSource: "Open Source",
      organization: "Organisation",
      support: "Support",
      websiteSource: "Quellcode der Website",
      closing:
        "Entwickelt für Klarheit, Sicherheit und langfristige Wartbarkeit.",
    },
    home: {
      heroEyebrow: "Entwicklersysteme von Progmasoft",
      heroTitleStart: "Werkzeuge sollen schwierige Arbeit",
      heroTitleAccent: "verständlich machen.",
      heroDescription:
        "Wir entwickeln Programmiersprachen-Infrastruktur, Paketsysteme und Entwicklerwerkzeuge rund um eindeutige Verträge statt zufälliger Komplexität.",
      exploreProducts: "Produkte entdecken",
      browseSource: "Quellcode ansehen",
      facts: [
        ["Offen", "Öffentliche Entwicklung"],
        ["Typisiert", "Verträge vor Abkürzungen"],
        ["Nativ", "Leistung ohne Rätsel"],
      ],
      visualLabel: "Produktgrundsätze von Progmasoft",
      stack: [
        [
          "Produkte",
          "Fokussierte Erlebnisse",
          "Klarer Zweck · beständige Namen · öffentliche Identität",
        ],
        [
          "Plattform",
          "Gemeinsame Kontobasis",
          "Authentifizierung · Dienstzugriff · Wiederherstellung",
        ],
        [
          "Betrieb",
          "Eigene Infrastruktur",
          "Beobachtbar · wartbar · direkt betrieben",
        ],
      ],
      productsEyebrow: "Produkte und Projekte",
      productsTitle: "Ein Ökosystem, klare Grenzen.",
      productsDescription:
        "Jede Oberfläche hat eine Aufgabe und einen dokumentierten Vertrag mit der nächsten Schicht.",
      products: [
        [
          "Programmiersprache",
          "Visual X#",
          "Eine moderne, von Progmasoft entwickelte Programmiersprache mit eigener Produkt- und Dokumentationsseite.",
          "Visual X# entdecken",
        ],
        [
          "Paketregistrierung",
          "ViGet",
          "Die offizielle Paket- und DSL-Plugin-Registrierung für das Visual-X#-Ökosystem, direkt von Progmasoft betrieben.",
          "ViGet öffnen",
        ],
        [
          "Entwicklerwerkzeuge",
          "Offene Entwicklung",
          "Compiler, Formatter, Linter, Analyzer, Projektsystem und Editor werden in öffentlichen Repositorys entwickelt.",
          "Auf GitHub ansehen",
        ],
      ],
      principlesEyebrow: "Entwicklungsgrundsätze",
      principlesTitle: "Auf dauerhafte Verständlichkeit ausgelegt.",
      principlesDescription:
        "Architektur ist nur dann nützlich, wenn neue Mitwirkende erkennen, wohin eine Entscheidung gehört und wie sie geprüft wird.",
      principles: [
        [
          "Eindeutige Verträge",
          "Typisierte Grenzen machen Zuständigkeit, Kompatibilität und Fehlerverhalten sichtbar.",
        ],
        [
          "Echte Verifikation",
          "Tests prüfen installierte Artefakte, produktionsnahe Pfade und beobachtbares Verhalten.",
        ],
        [
          "Beständige Benennung",
          "Öffentliche Begriffe folgen dem Produktmodell statt historischen Implementierungszufällen.",
        ],
      ],
      accountEyebrow: "Progmasoft-Konto",
      accountTitle: "Eine Identität für Progmasoft-Dienste.",
      accountDescription:
        "Verwalten Sie Ihr Profil und künftige Dienstzugriffe in der dafür vorgesehenen Kontooberfläche.",
      openAccount: "Konto öffnen",
    },
    account: {
      securityLabel: "Sicherheitsmerkmale des Kontos",
      trust: [
        "Sicheres Sitzungs-Cookie",
        "Serverseitiges Passwort-Hashing",
        "Begrenzte Anmeldeversuche",
      ],
      landingEyebrow: "Progmasoft-Konto",
      landingTitle: "Eine klare Identität für jeden unterstützten Dienst.",
      landingDescription:
        "Ihr Konto hält Profil, Authentifizierung und Dienstzugriff in einem eigenen Sicherheitsbereich.",
      identity: [
        [
          "Kontoname",
          "Ihre beständige öffentliche Identität und Ihr ViGet-Publishername",
        ],
        ["E-Mail", "Wiederherstellungs- und Sicherheitshinweise"],
        ["Sitzung", "Sicherer, widerrufbarer Browserzugriff"],
      ],
      features: [
        [
          "Bewusste Sicherheit",
          "Passwörter werden serverseitig gehasht; Sitzungstoken werden nur als Digests gespeichert.",
        ],
        [
          "Eindeutige Namen",
          "Kanonische Kontonamen verhindern mehrdeutige URLs und Nachahmung nur durch Groß-/Kleinschreibung. ViGet verwendet exakt diesen Namen als Publisher und erstellt keine zweite Identität.",
        ],
        [
          "Klare Dienstgrenzen",
          "Produkte fordern ausdrücklichen Kontozugriff an, statt verborgenen Anwendungszustand zu teilen.",
        ],
      ],
      loginEyebrow: "Progmasoft-Konto",
      loginTitle: "Sicher anmelden.",
      loginDescription:
        "Weiter zur Kontoübersicht und zu verbundenen Diensten.",
      registerEyebrow: "Identität erstellen",
      registerTitle: "Beginnen Sie mit einem beständigen Konto.",
      registerDescription:
        "Wählen Sie den Namen für Ihre Progmasoft-Konto-URL.",
      recoveryEyebrow: "Kontosupport",
      recoveryTitle: "Konto wiederherstellen.",
      recoveryDescription:
        "Nutzen Sie den verifizierten Supportkanal, wenn Sie sich nicht mehr anmelden können.",
      recoveryPanelEyebrow: "Kontowiederherstellung",
      recoveryPanelTitle: "Zugriff sicher wiederherstellen",
      recoveryPanelDescription:
        "Die automatische Passwortwiederherstellung ist während der ersten Einführung des Kontosystems nicht verfügbar. Kontaktieren Sie den Progmasoft-Support von der im Konto registrierten E-Mail-Adresse, damit die Inhaberschaft geprüft werden kann.",
      recoveryEmailSubject: "Wiederherstellung des Progmasoft-Kontos",
      contactSupport: "Support kontaktieren",
      rememberedPassword: "Passwort wieder eingefallen?",
      returnToSignIn: "Zur Anmeldung",
    },
    auth: {
      createHeading: "Konto erstellen",
      loginHeading: "Willkommen zurück",
      createDescription:
        "Nutzen Sie eine Progmasoft-Identität für alle unterstützten Dienste.",
      loginDescription:
        "Melden Sie sich mit der E-Mail-Adresse Ihres Progmasoft-Kontos an.",
      accountName: "Kontoname",
      accountHint:
        "Verwenden Sie 8–128 ASCII-Buchstaben oder Ziffern und beginnen Sie mit einem Großbuchstaben.",
      email: "E-Mail-Adresse",
      password: "Passwort",
      forgotPassword: "Passwort vergessen?",
      passwordHint:
        "Verwenden Sie mindestens 12 Zeichen. Lange Passphrasen werden unterstützt.",
      confirmPassword: "Passwort bestätigen",
      show: "Anzeigen",
      hide: "Ausblenden",
      working: "Wird verarbeitet…",
      create: "Konto erstellen",
      signIn: "Anmelden",
      or: "oder",
      google: "Mit Google fortfahren",
      already: "Sie haben bereits ein Konto?",
      newUser: "Neu bei Progmasoft?",
      createLink: "Konto erstellen",
      mismatch: "Die Passwortbestätigung stimmt nicht überein.",
      unreachable:
        "Der Kontodienst ist vorübergehend nicht erreichbar. Versuchen Sie es gleich noch einmal.",
      missingName: "Der Server hat keinen Kontonamen zurückgegeben.",
      unreadableName:
        "Das Feld für den Kontonamen konnte nicht gelesen werden.",
      requestFailed: "Die Anfrage konnte nicht abgeschlossen werden.",
      googleSignInFailed:
        "Die Anmeldung mit Google konnte nicht abgeschlossen werden. Versuchen Sie es erneut.",
      googleAccountNameRequired:
        "Wählen Sie einen Kontonamen, bevor Sie mit Google fortfahren.",
      googleAccountNameUnavailable:
        "Dieser Kontoname ist nicht verfügbar. Wählen Sie einen anderen Namen.",
      googleInvalidAccountName:
        "Verwenden Sie einen gültigen Kontonamen, bevor Sie mit Google fortfahren.",
    },
    dashboard: {
      loading: "Konto wird geladen…",
      loadFailed: "Die Kontoübersicht konnte nicht geladen werden.",
      unreachable: "Der Kontodienst ist vorübergehend nicht erreichbar.",
      navigation: "Navigation der Kontoübersicht",
      overview: "Übersicht",
      security: "Sicherheit",
      services: "Dienste",
      signOut: "Abmelden",
      eyebrow: "Kontoübersicht",
      welcome: "Willkommen",
      description:
        "Verwalten Sie die von Progmasoft-Diensten verwendete Identität.",
      profile: "Profil",
      identity: "Kontoidentität",
      accountName: "Kontoname",
      publisherName: "ViGet-Publishername",
      email: "E-Mail",
      created: "Erstellt",
      passwordSessions: "Passwort und Sitzungen",
      securityDescription:
        "Ihr Browser verwendet ein sicheres HttpOnly-Sitzungs-Cookie. Sitzungsgeheimnisse werden niemals im Klartext gespeichert.",
      changePassword: "Passwort ändern",
      products: "Verbundene Progmasoft-Produkte",
      publisherPrefix: "Publishername",
      sameAccount: "Ihr Kontoname",
      profileDescription: "Profil im Entwicklerökosystem",
      planned: "Geplant",
    },
    viget: {
      navigationLabel: "Navigation der Paketregistrierung",
      packages: "Pakete",
      dslPlugins: "DSL-Plugins",
      account: "Konto",
      login: "Anmelden",
      register: "Registrieren",
      homeEyebrow: "ViGet-Paketregistrierung",
      homeTitle: "Pakete für das Visual-X#-Ökosystem.",
      homeDescription:
        "ViGet ist die kanonische Quelle für Visual-X#-Pakete und Projekt-DSL-Plugins und wird direkt von Progmasoft betrieben.",
      createAccount: "Konto erstellen",
      exploreVisualXSharp: "Visual X# entdecken",
      available: "Paketregistrierung verfügbar",
      emptyTitle: "Der öffentliche Katalog ist leer.",
      emptyDescription:
        "Es wurden noch keine Pakete veröffentlicht. ViGet zeigt hier echte Pakete, sobald sie verfügbar sind.",
      packageFormat: "Paketformat",
      publisherIdentity: "Publisher-Identität",
      publishing: "Veröffentlichung",
      publishingClosed: "Noch nicht geöffnet",
      catalogsEyebrow: "Kataloge",
      catalogsTitle: "Zwei Artefakttypen, eine Paketregistrierung.",
      catalogsDescription:
        "Pakete und Projekt-DSL-Plugins besitzen getrennte, vorhersehbare Koordinatenräume.",
      visualPackages: "Visual-X#-Pakete",
      vipkgCatalog: "ViPkg-Katalog",
      vipkgDescription:
        "In Visual X# entwickelte Bibliotheken und Anwendungen, verteilt als .vipkg-Artefakte.",
      projectExtensions: "Projekterweiterungen",
      kotlinPlugins: "Kotlin-DSL-Plugins",
      kotlinDescription:
        "Kotlin-JAR-Plugins, die die Projektkonfiguration Visual.XSharp.kts erweitern.",
      openCatalog: "Katalog öffnen",
      contractEyebrow: "Vertrag der Paketregistrierung",
      contractTitle: "Klare Zuständigkeit von der Identität bis zum Artefakt.",
      principles: [
        [
          "Ein Kontoname",
          "Ihr Progmasoft-Kontoname ist zugleich Ihr ViGet-Publishername.",
        ],
        [
          "Groß-/Kleinschreibung in Koordinaten",
          "Publisher- und Paketnamen behalten ihre exakte öffentliche Schreibweise.",
        ],
        [
          "Keine Platzhalter-Releases",
          "Der Katalog bleibt ehrlich leer, bis ein echtes signiertes Artefakt veröffentlicht wird.",
        ],
      ],
      pluginEyebrow: "ViGet · Kotlin-DSL-Plugins",
      pluginTitle: "Das Projektmodell erweitern.",
      pluginDescription:
        "Kotlin-DSL-Plugins sind JAR-Artefakte für Visual.XSharp.kts. Sie sind von Visual-X#-.vipkg-Paketen getrennt.",
      backToPackages: "Zurück zu den Paketen",
      followDevelopment: "Entwicklung verfolgen",
      pluginAvailable: "Katalog verfügbar",
      pluginEmptyTitle: "Noch keine öffentlichen DSL-Plugins.",
      pluginEmptyDescription:
        "Der Katalog ist bereit und enthält absichtlich keine Platzhalter-Artefakte.",
      guidance: [
        [
          "Format",
          "Kotlin JAR",
          "DSL-Plugins werden als Kotlin/JVM-Projekterweiterungen ausgeführt.",
        ],
        [
          "Ort",
          "Eigener Katalog",
          "Plugin-Koordinaten beginnen immer mit /dslplugins.",
        ],
        [
          "Verfügbarkeit",
          "Veröffentlichung geschlossen",
          "Die Veröffentlichung wird erst nach Fertigstellung des signierten Plugin-Vertrags geöffnet.",
        ],
      ],
      footerDescription:
        "ViGet ist die Paket- und Kotlin-DSL-Plugin-Registrierung für das Visual-X#-Ökosystem.",
      registry: "Paketregistrierung",
      support: "Support",
      source: "Quellcode",
      footerClosing: "ViGet-Paketregistrierung von Progmasoft",
    },
  },
  "ru-RU": {
    metadata: {
      homeTitle: "Progmasoft",
      homeDescription:
        "Progmasoft разрабатывает системы для языков программирования, управления пакетами и инструментов разработчика.",
      accountTitle: "Аккаунт",
      accountDescription: "Откройте свой аккаунт Progmasoft и управляйте им.",
      loginTitle: "Вход",
      registerTitle: "Создание аккаунта",
      recoveryTitle: "Восстановление аккаунта",
      recoveryDescription:
        "Получите помощь в восстановлении доступа к аккаунту Progmasoft.",
      dashboardTitle: "Панель управления",
      vigetTitle: "Реестр пакетов ViGet от Progmasoft",
      vigetDescription:
        "Реестр пакетов Visual X# работает, но опубликованных пакетов пока нет.",
      dslPluginsTitle: "DSL-плагины · Реестр пакетов ViGet от Progmasoft",
      dslPluginsDescription:
        "Каталог Kotlin DSL-плагинов ViGet работает, но опубликованных плагинов пока нет.",
    },
    navigation: {
      primary: "Основная навигация",
      organization: "Организация",
      products: "Продукты",
      principles: "Принципы",
      account: "Аккаунт",
      dashboard: "Панель управления",
      signIn: "Войти",
      createAccount: "Создать аккаунт",
      theme: "Тема",
      light: "Светлая",
      dark: "Тёмная",
      language: "Язык",
    },
    footer: {
      summary:
        "Инфраструктура языков программирования и системы для разработчиков, построенные на надёжных контрактах.",
      products: "Продукты",
      openSource: "Открытый исходный код",
      organization: "Организация",
      support: "Поддержка",
      websiteSource: "Исходный код сайта",
      closing:
        "Создано ради ясности, безопасности и долгосрочного сопровождения.",
    },
    home: {
      heroEyebrow: "Системы для разработчиков от Progmasoft",
      heroTitleStart: "Инструменты должны делать сложную работу",
      heroTitleAccent: "понятной.",
      heroDescription:
        "Мы создаём инфраструктуру языков программирования, системы пакетов и инструменты разработчика на основе явных контрактов, а не случайной сложности.",
      exploreProducts: "Обзор продуктов",
      browseSource: "Исходный код",
      facts: [
        ["Открыто", "Публичная разработка"],
        ["Типизировано", "Контракты важнее обходных путей"],
        ["Нативно", "Производительность без загадок"],
      ],
      visualLabel: "Принципы продуктов Progmasoft",
      stack: [
        [
          "Продукты",
          "Сфокусированные решения",
          "Ясное назначение · устойчивые имена · публичная идентичность",
        ],
        [
          "Платформа",
          "Общая основа аккаунтов",
          "Аутентификация · доступ к сервисам · восстановление",
        ],
        [
          "Эксплуатация",
          "Собственная инфраструктура",
          "Наблюдаемая · сопровождаемая · под нашим прямым управлением",
        ],
      ],
      productsEyebrow: "Продукты и проекты",
      productsTitle: "Одна экосистема, чёткие границы.",
      productsDescription:
        "У каждой части одна зона ответственности и документированный контракт со следующим уровнем.",
      products: [
        [
          "Язык программирования",
          "Visual X#",
          "Современный язык программирования, разрабатываемый Progmasoft, с собственным сайтом продукта и документации.",
          "Подробнее о Visual X#",
        ],
        [
          "Реестр пакетов",
          "ViGet",
          "Канонический реестр пакетов и DSL-плагинов экосистемы Visual X#, которым напрямую управляет Progmasoft.",
          "Открыть ViGet",
        ],
        [
          "Инструменты разработчика",
          "Открытая разработка",
          "Компилятор, форматтер, линтер, анализатор, система проектов и редактор разрабатываются в публичных репозиториях.",
          "Смотреть на GitHub",
        ],
      ],
      principlesEyebrow: "Инженерные принципы",
      principlesTitle: "Создано, чтобы оставаться понятным.",
      principlesDescription:
        "Архитектура полезна только тогда, когда новый участник может понять, к чему относится решение и как его проверить.",
      principles: [
        [
          "Явные контракты",
          "Типизированные границы делают видимыми ответственность, совместимость и поведение при сбоях.",
        ],
        [
          "Настоящая проверка",
          "Тесты проверяют установленные артефакты, пути, близкие к рабочим, и наблюдаемое поведение.",
        ],
        [
          "Устойчивые имена",
          "Публичная терминология следует модели продукта, а не историческим случайностям реализации.",
        ],
      ],
      accountEyebrow: "Аккаунт Progmasoft",
      accountTitle: "Единая учётная запись для сервисов Progmasoft.",
      accountDescription:
        "Управляйте профилем и будущим доступом к сервисам на отдельном сайте аккаунта.",
      openAccount: "Открыть аккаунт",
    },
    account: {
      securityLabel: "Свойства безопасности аккаунта",
      trust: [
        "Защищённый сеансовый cookie",
        "Хеширование паролей на сервере",
        "Ограничение частоты попыток входа",
      ],
      landingEyebrow: "Аккаунт Progmasoft",
      landingTitle:
        "Одна понятная учётная запись для всех поддерживаемых сервисов.",
      landingDescription:
        "Аккаунт хранит профиль, аутентификацию и доступ к сервисам в отдельном контуре безопасности.",
      identity: [
        [
          "Имя аккаунта",
          "Ваше постоянное публичное имя и имя издателя в ViGet",
        ],
        ["Эл. почта", "Восстановление и уведомления безопасности"],
        ["Сеанс", "Защищённый отзываемый доступ из браузера"],
      ],
      features: [
        [
          "Продуманная безопасность",
          "Пароли хешируются на сервере, а токены сеансов хранятся только в виде дайджестов.",
        ],
        [
          "Предсказуемые имена",
          "Канонические имена аккаунтов исключают неоднозначные URL и подмену имени, отличающегося только регистром. ViGet использует именно это имя как издателя пакетов и не создаёт вторую учётную запись.",
        ],
        [
          "Границы сервисов",
          "Продукты запрашивают явный доступ к аккаунту, а не разделяют скрытое состояние приложения.",
        ],
      ],
      loginEyebrow: "Аккаунт Progmasoft",
      loginTitle: "Безопасный вход.",
      loginDescription:
        "Перейдите к панели управления аккаунтом и подключённым сервисам.",
      registerEyebrow: "Создание учётной записи",
      registerTitle: "Начните с постоянного аккаунта.",
      registerDescription:
        "Выберите имя, которое будет использоваться в URL вашего аккаунта Progmasoft.",
      recoveryEyebrow: "Поддержка аккаунта",
      recoveryTitle: "Восстановите свой аккаунт.",
      recoveryDescription:
        "Если вы больше не можете войти, используйте проверенный канал поддержки.",
      recoveryPanelEyebrow: "Восстановление аккаунта",
      recoveryPanelTitle: "Безопасное восстановление доступа",
      recoveryPanelDescription:
        "Автоматическое восстановление пароля недоступно на этапе первоначального запуска системы аккаунтов. Напишите в поддержку Progmasoft с адреса электронной почты, указанного в вашем аккаунте, чтобы мы могли подтвердить право владения.",
      recoveryEmailSubject: "Восстановление аккаунта Progmasoft",
      contactSupport: "Написать в поддержку",
      rememberedPassword: "Вспомнили пароль?",
      returnToSignIn: "Вернуться ко входу",
    },
    auth: {
      createHeading: "Создайте аккаунт",
      loginHeading: "С возвращением",
      createDescription:
        "Используйте одну учётную запись Progmasoft во всех поддерживаемых сервисах.",
      loginDescription:
        "Войдите, указав адрес электронной почты, привязанный к вашему аккаунту Progmasoft.",
      accountName: "Имя аккаунта",
      accountHint:
        "От 8 до 128 букв ASCII или цифр; первая буква должна быть заглавной.",
      email: "Адрес электронной почты",
      password: "Пароль",
      forgotPassword: "Забыли пароль?",
      passwordHint:
        "Не менее 12 символов. Длинные парольные фразы поддерживаются.",
      confirmPassword: "Подтверждение пароля",
      show: "Показать",
      hide: "Скрыть",
      working: "Выполняется…",
      create: "Создать аккаунт",
      signIn: "Войти",
      or: "или",
      google: "Продолжить с Google",
      already: "Уже есть аккаунт?",
      newUser: "Впервые в Progmasoft?",
      createLink: "Создайте аккаунт",
      mismatch: "Подтверждение пароля не совпадает.",
      unreachable:
        "Сервис аккаунтов временно недоступен. Повторите попытку чуть позже.",
      missingName: "Сервер не вернул имя аккаунта.",
      unreadableName: "Не удалось прочитать поле «Имя аккаунта».",
      requestFailed: "Не удалось выполнить запрос.",
      googleSignInFailed:
        "Не удалось выполнить вход через Google. Повторите попытку.",
      googleAccountNameRequired:
        "Выберите имя аккаунта, прежде чем продолжить с Google.",
      googleAccountNameUnavailable:
        "Это имя аккаунта недоступно. Выберите другое.",
      googleInvalidAccountName:
        "Укажите допустимое имя аккаунта, прежде чем продолжить с Google.",
    },
    dashboard: {
      loading: "Загрузка аккаунта…",
      loadFailed: "Не удалось загрузить панель управления.",
      unreachable: "Сервис аккаунтов временно недоступен.",
      navigation: "Навигация панели управления",
      overview: "Обзор",
      security: "Безопасность",
      services: "Сервисы",
      signOut: "Выйти",
      eyebrow: "Обзор аккаунта",
      welcome: "Добро пожаловать",
      description:
        "Управляйте учётной записью, которую используют сервисы Progmasoft.",
      profile: "Профиль",
      identity: "Учётная запись",
      accountName: "Имя аккаунта",
      publisherName: "Имя издателя в ViGet",
      email: "Эл. почта",
      created: "Создан",
      passwordSessions: "Пароль и сеансы",
      securityDescription:
        "Ваш браузер использует защищённый сеансовый cookie с флагом HttpOnly. Секреты сеансов никогда не хранятся в открытом виде.",
      changePassword: "Сменить пароль",
      products: "Подключённые продукты Progmasoft",
      publisherPrefix: "Имя издателя",
      sameAccount: "ваше имя аккаунта",
      profileDescription: "Профиль в экосистеме разработчика",
      planned: "Запланировано",
    },
    viget: {
      navigationLabel: "Навигация реестра",
      packages: "Пакеты",
      dslPlugins: "DSL-плагины",
      account: "Аккаунт",
      login: "Войти",
      register: "Регистрация",
      homeEyebrow: "Реестр пакетов ViGet",
      homeTitle: "Пакеты для экосистемы Visual X#.",
      homeDescription:
        "ViGet — канонический источник пакетов Visual X# и DSL-плагинов проектов, которым напрямую управляет Progmasoft.",
      createAccount: "Создать аккаунт",
      exploreVisualXSharp: "Подробнее о Visual X#",
      available: "Реестр доступен",
      emptyTitle: "Публичный каталог пуст.",
      emptyDescription:
        "Ни один выпуск пакета пока не опубликован. ViGet покажет здесь настоящие пакеты, когда они появятся.",
      packageFormat: "Формат пакета",
      publisherIdentity: "Имя издателя",
      publishing: "Публикация",
      publishingClosed: "Пока не открыта",
      catalogsEyebrow: "Каталоги",
      catalogsTitle: "Два вида артефактов, один реестр.",
      catalogsDescription:
        "У пакетов и DSL-плагинов проектов отдельные предсказуемые пространства координат.",
      visualPackages: "Пакеты Visual X#",
      vipkgCatalog: "Каталог ViPkg",
      vipkgDescription:
        "Библиотеки и приложения, написанные на Visual X#, распространяются как артефакты .vipkg.",
      projectExtensions: "Расширения проектов",
      kotlinPlugins: "Kotlin DSL-плагины",
      kotlinDescription:
        "Плагины в виде Kotlin JAR, расширяющие конфигурацию проекта Visual.XSharp.kts.",
      openCatalog: "Открыть каталог",
      contractEyebrow: "Контракт реестра",
      contractTitle: "Ясная ответственность от учётной записи до артефакта.",
      principles: [
        [
          "Одно имя аккаунта",
          "Имя вашего аккаунта Progmasoft — это и ваше имя издателя в ViGet.",
        ],
        [
          "Координаты с учётом регистра",
          "Имена издателей и пакетов сохраняют точное публичное написание.",
        ],
        [
          "Никаких выпусков-заглушек",
          "Каталог честно остаётся пустым, пока не опубликован настоящий подписанный артефакт.",
        ],
      ],
      pluginEyebrow: "ViGet · Kotlin DSL-плагины",
      pluginTitle: "Расширяйте модель проекта.",
      pluginDescription:
        "Kotlin DSL-плагины — это JAR-артефакты для Visual.XSharp.kts. Они отделены от пакетов Visual X# в формате .vipkg.",
      backToPackages: "Назад к пакетам",
      followDevelopment: "Следить за разработкой",
      pluginAvailable: "Каталог доступен",
      pluginEmptyTitle: "Публичных DSL-плагинов пока нет.",
      pluginEmptyDescription:
        "Каталог готов и намеренно не содержит артефактов-заглушек.",
      guidance: [
        [
          "Формат",
          "Kotlin JAR",
          "DSL-плагины работают как расширения проектов на Kotlin/JVM.",
        ],
        [
          "Расположение",
          "Отдельный каталог",
          "Координаты плагинов всегда начинаются с /dslplugins.",
        ],
        [
          "Доступность",
          "Публикация закрыта",
          "Публикация откроется только после завершения контракта подписанных плагинов.",
        ],
      ],
      footerDescription:
        "ViGet — реестр пакетов и Kotlin DSL-плагинов экосистемы Visual X#.",
      registry: "Реестр",
      support: "Поддержка",
      source: "Исходный код",
      footerClosing: "Реестр пакетов ViGet от Progmasoft",
    },
  },
  "he-IL": {
    metadata: {
      homeTitle: "Progmasoft",
      homeDescription:
        "Progmasoft בונה מערכות לשפות תכנות, לניהול חבילות ולכלי פיתוח.",
      accountTitle: "חשבון",
      accountDescription: "גישה לחשבון Progmasoft שלך וניהולו.",
      loginTitle: "כניסה",
      registerTitle: "יצירת חשבון",
      recoveryTitle: "שחזור החשבון",
      recoveryDescription: "קבלת עזרה בשחזור הגישה לחשבון Progmasoft.",
      dashboardTitle: "לוח בקרה",
      vigetTitle: "מאגר החבילות ViGet מבית Progmasoft",
      vigetDescription:
        "מאגר החבילות של Visual X#‎ פעיל, אך עדיין לא פורסמו בו חבילות.",
      dslPluginsTitle: "תוספי DSL · מאגר החבילות ViGet מבית Progmasoft",
      dslPluginsDescription:
        "קטלוג תוספי Kotlin DSL של ViGet פעיל, אך עדיין לא פורסמו בו תוספים.",
    },
    navigation: {
      primary: "ניווט ראשי",
      organization: "הארגון",
      products: "מוצרים",
      principles: "עקרונות",
      account: "חשבון",
      dashboard: "לוח בקרה",
      signIn: "כניסה",
      createAccount: "יצירת חשבון",
      theme: "ערכת נושא",
      light: "בהיר",
      dark: "כהה",
      language: "שפה",
    },
    footer: {
      summary: "תשתית לשפות תכנות ומערכות למפתחים, הבנויות על חוזים יציבים.",
      products: "מוצרים",
      openSource: "קוד פתוח",
      organization: "הארגון",
      support: "תמיכה",
      websiteSource: "קוד המקור של האתר",
      closing: "מתוכנן לבהירות, לאבטחה ולתחזוקה ארוכת טווח.",
    },
    home: {
      heroEyebrow: "מערכות למפתחים מבית Progmasoft",
      heroTitleStart: "כלים צריכים להפוך עבודה קשה",
      heroTitleAccent: "למובנת.",
      heroDescription:
        "אנחנו בונים תשתית לשפות תכנות, מערכות חבילות וכלי פיתוח סביב חוזים מפורשים במקום מורכבות מקרית.",
      exploreProducts: "למוצרים",
      browseSource: "לעיון בקוד המקור",
      facts: [
        ["פתוח", "הנדסה גלויה לציבור"],
        ["מוגדר טיפוסים", "חוזים לפני קיצורי דרך"],
        ["מקומי", "ביצועים בלי מסתורין"],
      ],
      visualLabel: "עקרונות המוצר של Progmasoft",
      stack: [
        ["מוצרים", "חוויות ממוקדות", "מטרה ברורה · שמות יציבים · זהות ציבורית"],
        ["פלטפורמה", "בסיס חשבון משותף", "אימות · גישה לשירותים · שחזור"],
        ["תפעול", "תשתית עצמית", "ניתנת לניטור · ניתנת לתחזוקה · בהפעלה ישירה"],
      ],
      productsEyebrow: "מוצרים ופרויקטים",
      productsTitle: "מערכת אחת, גבולות ברורים.",
      productsDescription: "לכל משטח יש אחריות אחת וחוזה מתועד מול השכבה הבאה.",
      products: [
        [
          "שפת תכנות",
          "Visual X#",
          "שפת תכנות מודרנית שמפתחת Progmasoft, עם אתר מוצר ותיעוד ייעודי משלה.",
          "להכיר את Visual X#‎",
        ],
        [
          "מאגר חבילות",
          "ViGet",
          "המאגר הרשמי של חבילות ותוספי DSL למערכת Visual X#‎, בהפעלה ישירה של Progmasoft.",
          "לפתיחת ViGet",
        ],
        [
          "כלי פיתוח",
          "הנדסה פתוחה",
          "מהדר, מעצב קוד, linter, מנתח, מערכת פרויקטים ועורך, המפותחים במאגרים ציבוריים.",
          "לצפייה ב-GitHub",
        ],
      ],
      principlesEyebrow: "עקרונות הנדסיים",
      principlesTitle: "בנוי כדי להישאר קריא.",
      principlesDescription:
        "ארכיטקטורה מועילה רק כאשר תורם חדש יכול להבין לאן שייכת החלטה וכיצד לאמת אותה.",
      principles: [
        [
          "חוזים מפורשים",
          "גבולות מוגדרי טיפוסים חושפים בעלות, תאימות והתנהגות בעת כשל.",
        ],
        [
          "אימות אמיתי",
          "הבדיקות מפעילות תוצרים מותקנים, נתיבים דמויי סביבת ייצור והתנהגות נצפית.",
        ],
        [
          "שמות יציבים",
          "אוצר המילים הציבורי נגזר ממודל המוצר ולא מתאונות מימוש היסטוריות.",
        ],
      ],
      accountEyebrow: "חשבון Progmasoft",
      accountTitle: "זהות אחת לשירותי Progmasoft.",
      accountDescription:
        "ניהול הפרופיל והגישה העתידית לשירותים ממשטח החשבון הייעודי.",
      openAccount: "לחשבון",
    },
    account: {
      securityLabel: "מאפייני האבטחה של החשבון",
      trust: [
        "עוגיית הפעלה מאובטחת",
        "גיבוב סיסמאות בצד השרת",
        "אימות עם הגבלת קצב",
      ],
      landingEyebrow: "חשבון Progmasoft",
      landingTitle: "זהות ברורה אחת לכל שירות נתמך.",
      landingDescription:
        "החשבון שומר את הפרופיל, האימות והגישה לשירותים בתוך גבול אבטחה ייעודי.",
      identity: [
        ["שם החשבון", "הזהות הציבורית היציבה שלך ושם המפרסם שלך ב-ViGet"],
        ["דוא״ל", "שחזור והודעות אבטחה"],
        ["הפעלה", "גישה מאובטחת מהדפדפן שניתן לבטל"],
      ],
      features: [
        [
          "אבטחה מכוונת",
          "הסיסמאות מגובבות בצד השרת, ואסימוני ההפעלה נשמרים כתקצירים בלבד.",
        ],
        [
          "שמות צפויים",
          "שמות חשבון קנוניים מונעים כתובות דו־משמעיות והתחזות שמבוססת על הבדלי אותיות גדולות וקטנות בלבד. ViGet משתמש בשם הזה בדיוק כשם מפרסם החבילה ואינו יוצר זהות שנייה.",
        ],
        [
          "גבולות בין שירותים",
          "המוצרים מבקשים גישה מפורשת לחשבון במקום לשתף מצב יישום נסתר.",
        ],
      ],
      loginEyebrow: "חשבון Progmasoft",
      loginTitle: "כניסה מאובטחת.",
      loginDescription: "המשך ללוח הבקרה של החשבון ולשירותים המקושרים.",
      registerEyebrow: "יצירת זהות",
      registerTitle: "מתחילים עם חשבון יציב.",
      registerDescription: "בחירת השם שישמש בכתובת חשבון Progmasoft שלך.",
      recoveryEyebrow: "תמיכה בחשבון",
      recoveryTitle: "שחזור החשבון.",
      recoveryDescription:
        "כשאי אפשר עוד להיכנס, יש לפנות בערוץ התמיכה המאומת.",
      recoveryPanelEyebrow: "שחזור חשבון",
      recoveryPanelTitle: "שחזור גישה בבטחה",
      recoveryPanelDescription:
        "שחזור סיסמה אוטומטי אינו זמין בשלב ההשקה הראשוני של מערכת החשבונות. יש לפנות לתמיכה של Progmasoft מכתובת הדוא״ל הרשומה בחשבון, כדי שניתן יהיה לאמת את הבעלות.",
      recoveryEmailSubject: "שחזור חשבון Progmasoft",
      contactSupport: "פנייה לתמיכה",
      rememberedPassword: "נזכרת בסיסמה?",
      returnToSignIn: "חזרה לכניסה",
    },
    auth: {
      createHeading: "יצירת החשבון שלך",
      loginHeading: "ברוך שובך",
      createDescription: "זהות Progmasoft אחת לכל השירותים הנתמכים.",
      loginDescription: "כניסה עם כתובת הדוא״ל המשויכת לחשבון Progmasoft שלך.",
      accountName: "שם החשבון",
      accountHint:
        "8 עד 128 אותיות ASCII או ספרות, כשהתו הראשון הוא אות גדולה.",
      email: "כתובת דוא״ל",
      password: "סיסמה",
      forgotPassword: "שכחת את הסיסמה?",
      passwordHint: "לפחות 12 תווים. יש תמיכה במשפטי סיסמה ארוכים.",
      confirmPassword: "אימות הסיסמה",
      show: "הצגה",
      hide: "הסתרה",
      working: "בתהליך…",
      create: "יצירת חשבון",
      signIn: "כניסה",
      or: "או",
      google: "המשך עם Google",
      already: "כבר יש לך חשבון?",
      newUser: "חדש ב-Progmasoft?",
      createLink: "יצירת חשבון",
      mismatch: "אימות הסיסמה אינו תואם.",
      unreachable: "שירות החשבונות אינו זמין זמנית. יש לנסות שוב בקרוב.",
      missingName: "השרת לא החזיר שם חשבון.",
      unreadableName: "לא ניתן היה לקרוא את השדה ״שם החשבון״.",
      requestFailed: "לא ניתן היה להשלים את הבקשה.",
      googleSignInFailed:
        "לא ניתן היה להשלים את הכניסה עם Google. יש לנסות שוב.",
      googleAccountNameRequired: "יש לבחור שם חשבון לפני ההמשך עם Google.",
      googleAccountNameUnavailable: "שם החשבון הזה אינו זמין. יש לבחור שם אחר.",
      googleInvalidAccountName: "יש להזין שם חשבון תקין לפני ההמשך עם Google.",
    },
    dashboard: {
      loading: "החשבון נטען…",
      loadFailed: "לא ניתן היה לטעון את לוח הבקרה.",
      unreachable: "שירות החשבונות אינו זמין זמנית.",
      navigation: "ניווט בלוח הבקרה",
      overview: "סקירה",
      security: "אבטחה",
      services: "שירותים",
      signOut: "יציאה",
      eyebrow: "סקירת החשבון",
      welcome: "ברוך הבא",
      description: "ניהול הזהות שמשמשת את שירותי Progmasoft.",
      profile: "פרופיל",
      identity: "זהות החשבון",
      accountName: "שם החשבון",
      publisherName: "שם המפרסם ב-ViGet",
      email: "דוא״ל",
      created: "נוצר",
      passwordSessions: "סיסמה והפעלות",
      securityDescription:
        "הדפדפן שלך משתמש בעוגיית הפעלה מאובטחת מסוג HttpOnly. סודות ההפעלה לעולם אינם נשמרים כטקסט גלוי.",
      changePassword: "שינוי סיסמה",
      products: "מוצרי Progmasoft מקושרים",
      publisherPrefix: "שם המפרסם",
      sameAccount: "שם החשבון שלך",
      profileDescription: "פרופיל במערכת המפתחים",
      planned: "מתוכנן",
    },
    viget: {
      navigationLabel: "ניווט במאגר",
      packages: "חבילות",
      dslPlugins: "תוספי DSL",
      account: "חשבון",
      login: "כניסה",
      register: "הרשמה",
      homeEyebrow: "מאגר החבילות ViGet",
      homeTitle: "חבילות למערכת Visual X#‎.",
      homeDescription:
        "ViGet הוא המקור הרשמי לחבילות Visual X#‎ ולתוספי DSL לפרויקטים, בהפעלה ישירה של Progmasoft.",
      createAccount: "יצירת חשבון",
      exploreVisualXSharp: "להכיר את Visual X#‎",
      available: "המאגר זמין",
      emptyTitle: "הקטלוג הציבורי ריק.",
      emptyDescription:
        "עדיין לא פורסמו גרסאות של חבילות. ViGet יציג כאן חבילות אמיתיות כשיהיו זמינות.",
      packageFormat: "תבנית החבילה",
      publisherIdentity: "זהות המפרסם",
      publishing: "פרסום",
      publishingClosed: "עדיין לא נפתח",
      catalogsEyebrow: "קטלוגים",
      catalogsTitle: "שני סוגי תוצרים, מאגר אחד.",
      catalogsDescription:
        "לחבילות ולתוספי DSL לפרויקטים יש מרחבי קואורדינטות נפרדים וצפויים.",
      visualPackages: "חבילות Visual X#‎",
      vipkgCatalog: "קטלוג ViPkg",
      vipkgDescription:
        "ספריות ויישומים שנכתבו ב-Visual X#‎ ומופצים כתוצרי ‎.vipkg.",
      projectExtensions: "הרחבות לפרויקטים",
      kotlinPlugins: "תוספי Kotlin DSL",
      kotlinDescription:
        "תוספי Kotlin בתבנית JAR שמרחיבים את תצורת הפרויקט Visual.XSharp.kts.",
      openCatalog: "לפתיחת הקטלוג",
      contractEyebrow: "חוזה המאגר",
      contractTitle: "בעלות ברורה מהזהות ועד לתוצר.",
      principles: [
        [
          "שם חשבון אחד",
          "שם חשבון Progmasoft שלך הוא גם שם המפרסם שלך ב-ViGet.",
        ],
        [
          "קואורדינטות תלויות רישיות",
          "שמות המפרסם והחבילה שומרים על האיות הציבורי המדויק שלהם.",
        ],
        ["בלי גרסאות דמה", "הקטלוג נשאר ריק ביושר עד שמתפרסם תוצר חתום אמיתי."],
      ],
      pluginEyebrow: "ViGet · תוספי Kotlin DSL",
      pluginTitle: "להרחיב את מודל הפרויקט.",
      pluginDescription:
        "תוספי Kotlin DSL הם תוצרי JAR עבור Visual.XSharp.kts. הם נפרדים מחבילות ‎.vipkg של Visual X#‎.",
      backToPackages: "חזרה לחבילות",
      followDevelopment: "למעקב אחר הפיתוח",
      pluginAvailable: "הקטלוג זמין",
      pluginEmptyTitle: "עדיין אין תוספי DSL ציבוריים.",
      pluginEmptyDescription: "הקטלוג מוכן, ובכוונה אינו מכיל תוצרי דמה.",
      guidance: [
        [
          "תבנית",
          "Kotlin JAR",
          "תוספי DSL פועלים כהרחבות פרויקט של Kotlin/JVM.",
        ],
        [
          "מיקום",
          "קטלוג ייעודי",
          "קואורדינטות של תוסף מתחילות תמיד ב-‎/dslplugins.",
        ],
        [
          "זמינות",
          "הפרסום סגור",
          "הפרסום ייפתח רק לאחר השלמת חוזה התוספים החתומים.",
        ],
      ],
      footerDescription:
        "ViGet הוא מאגר החבילות ותוספי Kotlin DSL של מערכת Visual X#‎.",
      registry: "מאגר",
      support: "תמיכה",
      source: "קוד מקור",
      footerClosing: "מאגר החבילות ViGet מבית Progmasoft",
    },
  },
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}
