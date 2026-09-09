// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

export const supportedLocales = ["en-US", "de-DE"] as const;
export type Locale = (typeof supportedLocales)[number];

export function isLocale(value: string | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
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
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}
