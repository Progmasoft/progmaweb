// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

export const supportedLocales = ["en-US", "de-DE", "ru-RU", "fr-FR"] as const;
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
  "fr-FR": "Français",
};

/**
 * A language the site published before and no longer does. A link that asks
 * for it gets the clean address and the fallback language instead.
 */
export const retiredLocales: readonly string[] = ["he-IL"];

/**
 * What a `?lang=` parameter asks of the proxy: the language to store and the
 * status of the redirect to the clean address. A published language is a
 * temporary redirect (307), as the visitor may choose again; a retired one is
 * permanent (308) and stores the fallback. Anything else is ignored.
 */
export function languageRequest(
  asked: string | undefined,
): { locale: Locale; status: 307 | 308 } | undefined {
  if (isLocale(asked)) return { locale: asked, status: 307 };
  if (asked !== undefined && retiredLocales.includes(asked)) {
    return { locale: fallbackLocale, status: 308 };
  }
  return undefined;
}

// Primary language subtags and the published locale each one selects.
const localeByLanguage = new Map<string, Locale>([
  ["en", "en-US"],
  ["de", "de-DE"],
  ["ru", "ru-RU"],
  ["fr", "fr-FR"],
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
        "Progmasoft makes build systems, testing tools, an agentic IDE and data infrastructure for developers.",
      accountTitle: "Account",
      accountDescription: "Access and manage your Progmasoft account.",
      loginTitle: "Sign in",
      registerTitle: "Create account",
      recoveryTitle: "Recover your account",
      recoveryDescription: "Get help regaining access to a Progmasoft account.",
      dashboardTitle: "Dashboard",
      vigetTitle: "ViGet Package Registry by Progmasoft",
      vigetDescription:
        "The package registry for C, C++ and Objective-C is online, but no packages have been published yet.",
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
      menu: "Menu",
      closeMenu: "Close the menu",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      language: "Language",
    },
    notFound: {
      title: "We are sorry, the page you requested cannot be found.",
      text: "The address may be misspelled, or the page you are looking for is no longer available.",
      pageTitle: "Page not found",
    },
    footer: {
      summary:
        "Developer tools and data infrastructure built with durable contracts.",
      products: "Products",
      openSource: "Open source",
      organization: "Organization",
      support: "Support",
      websiteSource: "Website source",
      closing: "Designed for clarity, security, and long-term maintenance.",
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
      googlePoliciesRequired:
        "Accept the Privacy Policy and the Security Policy before continuing with Google.",
      consentStart: "I have read and accept the ",
      consentPrivacy: "Privacy Policy",
      consentMiddle: " and the ",
      consentSecurity: "Security Policy",
      consentEnd: ".",
      consentRequired:
        "Accept the Privacy Policy and the Security Policy to create an account.",
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
      homeTitle: "Packages for C, C++ and Objective-C.",
      homeDescription:
        "ViGet is the canonical source for C, C++ and Objective-C packages and for the DSL plugins of build systems, operated directly by Progmasoft.",
      createAccount: "Create account",
      exploreTazel: "Explore Tazel",
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
      languagePackages: "Packages",
      vipkgCatalog: "ViPkg catalog",
      vipkgDescription:
        "Libraries and applications in C, C++ and Objective-C, distributed as .vipkg artifacts.",
      projectExtensions: "Project extensions",
      kotlinPlugins: "Kotlin DSL plugins",
      kotlinDescription:
        "Kotlin JAR plugins that extend the project file of Tazel.",
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
        "Kotlin DSL plugins are JAR artifacts for the project file of Tazel. They are separate from .vipkg packages.",
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
          "Plugin coordinates always begin with /dslplugins/tazel.",
        ],
        [
          "Availability",
          "Progmasoft first",
          "Progmasoft publishes the first plugins; publishing opens to every account later.",
        ],
      ],
      footerDescription:
        "ViGet is the registry of packages for C, C++ and Objective-C and of Kotlin DSL plugins.",
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
        "Progmasoft entwickelt Build-Systeme, Testwerkzeuge, eine agentische IDE und Dateninfrastruktur für Entwickler.",
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
        "Die Paketregistrierung für C, C++ und Objective-C ist online, enthält aber noch keine veröffentlichten Pakete.",
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
      menu: "Menü",
      closeMenu: "Menü schließen",
      theme: "Darstellung",
      light: "Hell",
      dark: "Dunkel",
      language: "Sprache",
    },
    notFound: {
      title: "Es tut uns leid, die angeforderte Seite wurde nicht gefunden.",
      text: "Die Adresse ist vielleicht falsch geschrieben, oder die gesuchte Seite ist nicht mehr verfügbar.",
      pageTitle: "Seite nicht gefunden",
    },
    footer: {
      summary:
        "Entwicklerwerkzeuge und Dateninfrastruktur auf der Grundlage beständiger Verträge.",
      products: "Produkte",
      openSource: "Open Source",
      organization: "Organisation",
      support: "Support",
      websiteSource: "Quellcode der Website",
      closing:
        "Entwickelt für Klarheit, Sicherheit und langfristige Wartbarkeit.",
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
      googlePoliciesRequired:
        "Nehmen Sie die Datenschutzerklärung und die Sicherheitsrichtlinie an, bevor Sie mit Google fortfahren.",
      consentStart: "Ich habe die ",
      consentPrivacy: "Datenschutzerklärung",
      consentMiddle: " und die ",
      consentSecurity: "Sicherheitsrichtlinie",
      consentEnd: " gelesen und nehme sie an.",
      consentRequired:
        "Nehmen Sie die Datenschutzerklärung und die Sicherheitsrichtlinie an, um ein Konto zu erstellen.",
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
      homeTitle: "Pakete für C, C++ und Objective-C.",
      homeDescription:
        "ViGet ist die kanonische Quelle für Pakete in C, C++ und Objective-C und für die DSL-Plugins von Build-Systemen und wird direkt von Progmasoft betrieben.",
      createAccount: "Konto erstellen",
      exploreTazel: "Tazel entdecken",
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
      languagePackages: "Pakete",
      vipkgCatalog: "ViPkg-Katalog",
      vipkgDescription:
        "Bibliotheken und Anwendungen in C, C++ und Objective-C, verteilt als .vipkg-Artefakte.",
      projectExtensions: "Projekterweiterungen",
      kotlinPlugins: "Kotlin-DSL-Plugins",
      kotlinDescription:
        "Kotlin-JAR-Plugins, die die Projektdatei von Tazel erweitern.",
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
        "Kotlin-DSL-Plugins sind JAR-Artefakte für die Projektdatei von Tazel. Sie sind von .vipkg-Paketen getrennt.",
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
          "Plugin-Koordinaten beginnen immer mit /dslplugins/tazel.",
        ],
        [
          "Verfügbarkeit",
          "Zuerst Progmasoft",
          "Progmasoft veröffentlicht die ersten Plugins; später öffnet die Veröffentlichung für jedes Konto.",
        ],
      ],
      footerDescription:
        "ViGet ist die Registrierung für Pakete in C, C++ und Objective-C und für Kotlin-DSL-Plugins.",
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
        "Progmasoft создаёт системы сборки, инструменты тестирования, агентную среду разработки и инфраструктуру данных для разработчиков.",
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
        "Реестр пакетов для C, C++ и Objective-C работает, но опубликованных пакетов пока нет.",
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
      menu: "Меню",
      closeMenu: "Закрыть меню",
      theme: "Тема",
      light: "Светлая",
      dark: "Тёмная",
      language: "Язык",
    },
    notFound: {
      title: "К сожалению, запрошенная страница не найдена.",
      text: "Возможно, адрес написан с ошибкой или страница, которую вы ищете, больше недоступна.",
      pageTitle: "Страница не найдена",
    },
    footer: {
      summary:
        "Инструменты разработчика и инфраструктура данных, построенные на надёжных контрактах.",
      products: "Продукты",
      openSource: "Открытый исходный код",
      organization: "Организация",
      support: "Поддержка",
      websiteSource: "Исходный код сайта",
      closing:
        "Создано ради ясности, безопасности и долгосрочного сопровождения.",
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
      googlePoliciesRequired:
        "Примите Политику конфиденциальности и Политику безопасности, прежде чем продолжить с Google.",
      consentStart: "Я прочитал(а) и принимаю ",
      consentPrivacy: "Политику конфиденциальности",
      consentMiddle: " и ",
      consentSecurity: "Политику безопасности",
      consentEnd: ".",
      consentRequired:
        "Примите Политику конфиденциальности и Политику безопасности, чтобы создать аккаунт.",
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
      homeTitle: "Пакеты для C, C++ и Objective-C.",
      homeDescription:
        "ViGet — канонический источник пакетов для C, C++ и Objective-C и DSL-плагинов систем сборки, которым напрямую управляет Progmasoft.",
      createAccount: "Создать аккаунт",
      exploreTazel: "Подробнее о Tazel",
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
      languagePackages: "Пакеты",
      vipkgCatalog: "Каталог ViPkg",
      vipkgDescription:
        "Библиотеки и приложения на C, C++ и Objective-C распространяются как артефакты .vipkg.",
      projectExtensions: "Расширения проектов",
      kotlinPlugins: "Kotlin DSL-плагины",
      kotlinDescription:
        "Плагины в виде Kotlin JAR, расширяющие файл проекта Tazel.",
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
        "Kotlin DSL-плагины — это JAR-артефакты для файла проекта Tazel. Они отделены от пакетов в формате .vipkg.",
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
          "Координаты плагинов всегда начинаются с /dslplugins/tazel.",
        ],
        [
          "Доступность",
          "Сначала Progmasoft",
          "Первые плагины публикует Progmasoft; позже публикация откроется для всех учётных записей.",
        ],
      ],
      footerDescription:
        "ViGet — реестр пакетов для C, C++ и Objective-C и Kotlin DSL-плагинов.",
      registry: "Реестр",
      support: "Поддержка",
      source: "Исходный код",
      footerClosing: "Реестр пакетов ViGet от Progmasoft",
    },
  },
  "fr-FR": {
    metadata: {
      homeTitle: "Progmasoft",
      homeDescription:
        "Progmasoft crée des systèmes de build, des outils de test, un IDE agentique et une infrastructure de données pour les développeurs.",
      accountTitle: "Compte",
      accountDescription: "Accédez à votre compte Progmasoft et gérez-le.",
      loginTitle: "Se connecter",
      registerTitle: "Créer un compte",
      recoveryTitle: "Récupérer votre compte",
      recoveryDescription:
        "Obtenez de l’aide pour retrouver l’accès à un compte Progmasoft.",
      dashboardTitle: "Tableau de bord",
      vigetTitle: "ViGet, le registre de paquets de Progmasoft",
      vigetDescription:
        "Le registre de paquets pour C, C++ et Objective-C est en ligne, mais aucun paquet n’a encore été publié.",
      dslPluginsTitle:
        "Plugins DSL · ViGet, le registre de paquets de Progmasoft",
      dslPluginsDescription:
        "Le catalogue des plugins DSL Kotlin de ViGet est en ligne, mais aucun plugin n’a encore été publié.",
    },
    navigation: {
      primary: "Navigation principale",
      organization: "Organisation",
      products: "Produits",
      principles: "Principes",
      account: "Compte",
      dashboard: "Tableau de bord",
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      menu: "Menu",
      closeMenu: "Fermer le menu",
      theme: "Thème",
      light: "Clair",
      dark: "Sombre",
      language: "Langue",
    },
    notFound: {
      title: "Nous sommes désolés, la page demandée est introuvable.",
      text: "L’adresse est peut-être mal orthographiée, ou la page que vous cherchez n’est plus disponible.",
      pageTitle: "Page introuvable",
    },
    footer: {
      summary:
        "Des outils pour développeurs et une infrastructure de données bâtis sur des contrats durables.",
      products: "Produits",
      openSource: "Open source",
      organization: "Organisation",
      support: "Assistance",
      websiteSource: "Source du site",
      closing:
        "Conçu pour la clarté, la sécurité et la maintenance à long terme.",
    },
    account: {
      securityLabel: "Propriétés de sécurité du compte",
      trust: [
        "Cookie de session sécurisé",
        "Hachage des mots de passe côté serveur",
        "Authentification à débit limité",
      ],
      landingEyebrow: "Compte Progmasoft",
      landingTitle: "Une identité claire pour chaque service pris en charge.",
      landingDescription:
        "Votre compte place le profil, l’authentification et l’accès aux services derrière une frontière de sécurité dédiée.",
      identity: [
        [
          "Nom de compte",
          "Votre identité publique durable et votre nom d’éditeur ViGet",
        ],
        ["E-mail", "Récupération et avis de sécurité"],
        ["Session", "Accès navigateur sécurisé et révocable"],
      ],
      features: [
        [
          "Une sécurité réfléchie",
          "Les mots de passe sont hachés côté serveur et les jetons de session ne sont conservés que sous forme d’empreintes.",
        ],
        [
          "Des noms prévisibles",
          "Les noms de compte canoniques évitent les URL ambiguës et l’usurpation par la seule casse. ViGet utilise exactement ce nom comme éditeur des paquets ; il ne crée pas de seconde identité.",
        ],
        [
          "Des frontières entre services",
          "Les produits demandent un accès explicite au compte au lieu de partager un état applicatif caché.",
        ],
      ],
      loginEyebrow: "Compte Progmasoft",
      loginTitle: "Connectez-vous en toute sécurité.",
      loginDescription:
        "Poursuivez vers le tableau de bord de votre compte et les services connectés.",
      registerEyebrow: "Créer une identité",
      registerTitle: "Commencez avec un compte durable.",
      registerDescription:
        "Choisissez le nom utilisé dans l’URL de votre compte Progmasoft.",
      recoveryEyebrow: "Assistance du compte",
      recoveryTitle: "Récupérez votre compte.",
      recoveryDescription:
        "Utilisez le canal d’assistance vérifié lorsque vous ne pouvez plus vous connecter.",
      recoveryPanelEyebrow: "Récupération du compte",
      recoveryPanelTitle: "Retrouvez l’accès en toute sécurité",
      recoveryPanelDescription:
        "La récupération automatique du mot de passe n’est pas disponible pendant le premier déploiement du système de comptes. Écrivez à l’assistance de Progmasoft depuis l’adresse e-mail enregistrée sur votre compte, afin que la propriété puisse être vérifiée.",
      recoveryEmailSubject: "Récupération du compte Progmasoft",
      contactSupport: "Contacter l’assistance",
      rememberedPassword: "Vous vous souvenez de votre mot de passe ?",
      returnToSignIn: "Revenir à la connexion",
    },
    auth: {
      createHeading: "Créez votre compte",
      loginHeading: "Bon retour",
      createDescription:
        "Utilisez une seule identité Progmasoft pour les services pris en charge.",
      loginDescription:
        "Connectez-vous avec l’adresse e-mail associée à votre compte Progmasoft.",
      accountName: "Nom de compte",
      accountHint:
        "Utilisez de 8 à 128 lettres ou chiffres ASCII, en commençant par une majuscule.",
      email: "Adresse e-mail",
      password: "Mot de passe",
      forgotPassword: "Mot de passe oublié ?",
      passwordHint:
        "Utilisez au moins 12 caractères. Les longues phrases de passe sont acceptées.",
      confirmPassword: "Confirmer le mot de passe",
      show: "Afficher",
      hide: "Masquer",
      working: "En cours…",
      create: "Créer un compte",
      signIn: "Se connecter",
      or: "ou",
      google: "Continuer avec Google",
      already: "Vous avez déjà un compte ?",
      newUser: "Nouveau chez Progmasoft ?",
      createLink: "Créer un compte",
      mismatch: "La confirmation du mot de passe ne correspond pas.",
      unreachable:
        "Le service des comptes est momentanément injoignable. Réessayez dans un instant.",
      missingName: "Le serveur n’a renvoyé aucun nom de compte.",
      unreadableName: "Le champ Nom de compte n’a pas pu être lu.",
      requestFailed: "La requête n’a pas pu aboutir.",
      googleSignInFailed:
        "La connexion avec Google n’a pas pu aboutir. Réessayez.",
      googleAccountNameRequired:
        "Choisissez un nom de compte avant de continuer avec Google.",
      googleAccountNameUnavailable:
        "Ce nom de compte n’est pas disponible. Choisissez-en un autre.",
      googleInvalidAccountName:
        "Utilisez un nom de compte valide avant de continuer avec Google.",
      googlePoliciesRequired:
        "Acceptez la politique de confidentialité et la politique de sécurité avant de continuer avec Google.",
      consentStart: "J’ai lu et j’accepte la ",
      consentPrivacy: "politique de confidentialité",
      consentMiddle: " et la ",
      consentSecurity: "politique de sécurité",
      consentEnd: ".",
      consentRequired:
        "Acceptez la politique de confidentialité et la politique de sécurité pour créer un compte.",
    },
    dashboard: {
      loading: "Chargement du compte…",
      loadFailed: "Le tableau de bord n’a pas pu être chargé.",
      unreachable: "Le service des comptes est momentanément injoignable.",
      navigation: "Navigation du tableau de bord",
      overview: "Vue d’ensemble",
      security: "Sécurité",
      services: "Services",
      signOut: "Se déconnecter",
      eyebrow: "Vue d’ensemble du compte",
      welcome: "Bienvenue",
      description: "Gérez l’identité utilisée par les services de Progmasoft.",
      profile: "Profil",
      identity: "Identité du compte",
      accountName: "Nom de compte",
      publisherName: "Nom d’éditeur ViGet",
      email: "E-mail",
      created: "Créé le",
      passwordSessions: "Mot de passe et sessions",
      securityDescription:
        "Votre navigateur utilise un cookie de session sécurisé HttpOnly. Les secrets de session ne sont jamais conservés en clair.",
      changePassword: "Changer le mot de passe",
      products: "Produits Progmasoft connectés",
      publisherPrefix: "Nom d’éditeur",
      sameAccount: "votre nom de compte",
      planned: "Prévu",
    },
    viget: {
      navigationLabel: "Navigation du registre",
      packages: "Paquets",
      dslPlugins: "Plugins DSL",
      account: "Compte",
      login: "Se connecter",
      register: "S’inscrire",
      homeEyebrow: "Registre de paquets ViGet",
      homeTitle: "Des paquets pour C, C++ et Objective-C.",
      homeDescription:
        "ViGet est la source de référence des paquets C, C++ et Objective-C et des plugins DSL des systèmes de build, exploitée directement par Progmasoft.",
      createAccount: "Créer un compte",
      exploreTazel: "Découvrir Tazel",
      available: "Registre disponible",
      emptyTitle: "Le catalogue public est vide.",
      emptyDescription:
        "Aucune version de paquet n’a encore été publiée. ViGet affichera ici de vrais paquets dès qu’ils seront disponibles.",
      packageFormat: "Format des paquets",
      publisherIdentity: "Identité de l’éditeur",
      publishing: "Publication",
      publishingClosed: "Pas encore ouverte",
      catalogsEyebrow: "Catalogues",
      catalogsTitle: "Deux types d’artefacts, un seul registre.",
      catalogsDescription:
        "Les paquets et les plugins DSL de projet ont des espaces de coordonnées distincts et prévisibles.",
      languagePackages: "Paquets",
      vipkgCatalog: "Catalogue ViPkg",
      vipkgDescription:
        "Bibliothèques et applications en C, C++ et Objective-C, distribuées sous forme d’artefacts .vipkg.",
      projectExtensions: "Extensions de projet",
      kotlinPlugins: "Plugins DSL Kotlin",
      kotlinDescription:
        "Des plugins JAR Kotlin qui étendent le fichier de projet de Tazel.",
      openCatalog: "Ouvrir le catalogue",
      contractEyebrow: "Contrat du registre",
      contractTitle: "Une propriété claire, de l’identité à l’artefact.",
      principles: [
        [
          "Un seul nom de compte",
          "Votre nom de compte Progmasoft est aussi votre nom d’éditeur ViGet.",
        ],
        [
          "Des coordonnées sensibles à la casse",
          "Les noms d’éditeur et de paquet gardent leur graphie publique exacte.",
        ],
        [
          "Aucune version factice",
          "Le catalogue reste honnêtement vide jusqu’à la publication d’un véritable artefact signé.",
        ],
      ],
      pluginEyebrow: "ViGet · Plugins DSL Kotlin",
      pluginTitle: "Étendez le modèle de projet.",
      pluginDescription:
        "Les plugins DSL Kotlin sont des artefacts JAR pour le fichier de projet de Tazel. Ils sont distincts des paquets .vipkg.",
      backToPackages: "Retour aux paquets",
      followDevelopment: "Suivre le développement",
      pluginAvailable: "Catalogue disponible",
      pluginEmptyTitle: "Aucun plugin DSL public pour l’instant.",
      pluginEmptyDescription:
        "Le catalogue est prêt et ne contient volontairement aucun artefact factice.",
      guidance: [
        [
          "Format",
          "JAR Kotlin",
          "Les plugins DSL s’exécutent comme des extensions de projet Kotlin/JVM.",
        ],
        [
          "Emplacement",
          "Catalogue dédié",
          "Les coordonnées des plugins commencent toujours par /dslplugins/tazel.",
        ],
        [
          "Disponibilité",
          "Progmasoft d’abord",
          "Progmasoft publie les premiers plugins ; la publication s’ouvrira ensuite à tous les comptes.",
        ],
      ],
      footerDescription:
        "ViGet est le registre des paquets pour C, C++ et Objective-C et des plugins DSL Kotlin.",
      registry: "Registre",
      support: "Assistance",
      source: "Source",
      footerClosing: "ViGet, le registre de paquets de Progmasoft",
    },
  },
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}
