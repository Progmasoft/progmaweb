// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Locale } from "./localization";
import type { ApplicationKind, OAuthScope } from "./credentials";

/**
 * The text of the Progmasoft OAuth pages at credentials.progmasoft.com, in
 * every published language. Placeholders in braces are filled by
 * {@link format}.
 */
interface CredentialsMessages {
  metadata: {
    home: string;
    signIn: string;
    portal: string;
    newToken: string;
    application: string;
    consent: string;
    allowed: string;
  };
  common: {
    product: string;
    developers: string;
    console: string;
    allowedApplications: string;
    organization: string;
    back: string;
    signIn: string;
    signOut: string;
    signedInAs: string;
    signInRequired: string;
    signInAccount: string;
    loading: string;
    unreachable: string;
    notFound: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    signedOut: string;
    developersText: string;
    allowedText: string;
    discovery: string;
  };
  signIn: {
    eyebrow: string;
    title: string;
    description: string;
    email: string;
    password: string;
    submit: string;
    working: string;
    failed: string;
    noAccount: string;
    createAccount: string;
  };
  overview: {
    eyebrow: string;
    title: string;
    description: string;
    credentialsText: string;
    allowedText: string;
    docs: string;
    docsText: string;
  };
  portal: {
    eyebrow: string;
    title: string;
    description: string;
    newToken: string;
    empty: string;
    limit: string;
    endpoints: string;
  };
  kinds: Record<ApplicationKind, { title: string; description: string }> & {
    chooseTitle: string;
    chooseDescription: string;
    label: string;
  };
  form: {
    name: string;
    homepage: string;
    redirectUris: string;
    postLogoutRedirectUris: string;
    scopes: string;
    scopesNote: string;
    serviceNote: string;
    create: string;
    save: string;
    saved: string;
    working: string;
    hints: Record<ApplicationKind, string>;
  };
  details: {
    clientId: string;
    clientSecret: string;
    created: string;
    copyNow: string;
    noSecret: string;
    secretHeading: string;
    rotate: string;
    rotateNote: string;
    deleteHeading: string;
    deleteNote: string;
    delete: string;
    confirmDelete: string;
    tokenCreated: string;
    newSecret: string;
  };
  scopes: Record<OAuthScope, string> & { account: string };
  consent: {
    eyebrow: string;
    title: string;
    wants: string;
    registeredBy: string;
    returnTo: string;
    signedInAs: string;
    withdrawLater: string;
    allow: string;
    deny: string;
    invalid: string;
  };
  allowed: {
    eyebrow: string;
    title: string;
    description: string;
    empty: string;
    since: string;
    deleted: string;
    withdraw: string;
  };
}

export const credentialsMessages: Record<Locale, CredentialsMessages> = {
  "en-US": {
    metadata: {
      home: "Progmasoft OAuth",
      signIn: "Sign in to Progmasoft OAuth",
      portal: "OAuth 2.1 tokens",
      newToken: "New token",
      application: "Application",
      consent: "Allow access",
      allowed: "Allowed applications",
    },
    common: {
      product: "Progmasoft OAuth",
      developers: "OAuth 2.1 tokens",
      console: "Console",
      allowedApplications: "Allowed applications",
      organization: "Progmasoft",
      back: "Back",
      signIn: "Sign in",
      signOut: "Sign out",
      signedInAs: "Signed in as {name}.",
      signInRequired:
        "Sign in to your Progmasoft account to manage the tokens of your applications.",
      signInAccount: "Sign in to Progmasoft",
      loading: "Loading…",
      unreachable: "Progmasoft OAuth could not be reached. Try again.",
      notFound: "No application of yours has this client identifier.",
    },
    home: {
      eyebrow: "OAuth 2.1 · OpenID Connect",
      title: "Sign in with Progmasoft",
      description:
        "Let people sign in to your application with their Progmasoft account and, with their consent, act on ViGet for them. Any developer can make a token.",
      signedOut:
        "Sign in to make OAuth 2.1 tokens for your applications or to review the applications you have allowed.",
      developersText: "Make and manage the tokens of your applications.",
      allowedText: "See and withdraw what applications may do for you.",
      discovery: "Discovery document",
    },
    signIn: {
      eyebrow: "Progmasoft OAuth",
      title: "Sign in to Progmasoft",
      description:
        "Use your Progmasoft account. This sign-in stays on credentials.progmasoft.com; applications never see your password.",
      email: "Email address",
      password: "Password",
      submit: "Sign in",
      working: "Signing in…",
      failed: "The email address or the password is not right.",
      noAccount: "No account yet?",
      createAccount: "Create a Progmasoft account",
    },
    overview: {
      eyebrow: "Progmasoft Console",
      title: "Build on Progmasoft",
      description:
        "Manage how your applications use Progmasoft: sign-in with Progmasoft accounts today, more Progmasoft services as they open.",
      credentialsText:
        "Tokens of your applications: web, single-page, desktop, mobile and service.",
      allowedText: "Applications that may act for your own account.",
      docs: "Developer guide",
      docsText: "Flows, scopes, consent and limits of Progmasoft OAuth.",
    },
    portal: {
      eyebrow: "Developers",
      title: "OAuth 2.1 tokens",
      description:
        "Each token is one application: its client identifier, its secret if its type has one, and where people return after signing in.",
      newToken: "New token",
      empty: "You have no token yet.",
      limit: "An account can have {count} tokens.",
      endpoints:
        "Applications that sign people in use the authorization code flow with PKCE (S256). The discovery document lists every endpoint.",
    },
    kinds: {
      chooseTitle: "New token",
      chooseDescription:
        "The type decides how the application proves itself and where Progmasoft OAuth may send people back. It cannot change later.",
      label: "Application type",
      web: {
        title: "Web application",
        description:
          "A site with a server. Authorization code flow with PKCE, and a client secret the server keeps.",
      },
      spa: {
        title: "Single-page application",
        description:
          "A browser application without a server, such as React or Vue. Authorization code flow with PKCE, no secret; the token endpoint answers its origin.",
      },
      desktop: {
        title: "Desktop application",
        description:
          "A desktop or command-line program. Authorization code flow with PKCE, no secret; returns through a loopback address or a private-use scheme.",
      },
      mobile: {
        title: "Mobile application",
        description:
          "An iOS or Android application. Authorization code flow with PKCE, no secret; returns through a private-use scheme or a claimed https:// address.",
      },
      service: {
        title: "Service",
        description:
          "A server that acts as itself, not for a person. Client credentials grant with a client secret; no account scope and no sign-in page.",
      },
    },
    form: {
      name: "Name",
      homepage: "Homepage (optional)",
      redirectUris: "Redirection addresses, one per line",
      postLogoutRedirectUris:
        "Addresses after sign-out (optional), one per line",
      scopes: "Scopes the application may request",
      scopesNote:
        "openid is always available. Each person still decides on the consent page.",
      serviceNote:
        "A service asks /connect/token with grant_type=client_credentials and its secret. The token names the application itself and carries no account scope.",
      create: "Create",
      save: "Save",
      saved: "The application was saved.",
      working: "Saving…",
      hints: {
        web: "https:// addresses; http:// only for a loopback address during development.",
        spa: "https:// addresses of the application; http:// only for a loopback address during development. The token endpoint answers the origins of these addresses.",
        desktop:
          "http:// with a loopback address (http://127.0.0.1:8400/callback), or a private-use scheme (com.example.app:/callback).",
        mobile:
          "A private-use scheme (com.example.app:/callback), or an https:// address the app claims.",
        service: "",
      },
    },
    details: {
      clientId: "Client identifier",
      clientSecret: "Client secret",
      created: "Created {date}",
      copyNow:
        "Copy the secret now. It is stored only as a hash and is never shown again; if it is lost, make a new one.",
      noSecret: "This type has no secret: it proves itself with PKCE only.",
      secretHeading: "Secret",
      rotate: "Make a new client secret",
      rotateNote: "The old secret stops working at once.",
      deleteHeading: "Delete",
      deleteNote:
        "Deleting the application ends every authorization and token it holds.",
      delete: "Delete the application",
      confirmDelete: "Delete this application and end all of its tokens?",
      tokenCreated: "Token created",
      newSecret: "New client secret",
    },
    scopes: {
      account: "Know which Progmasoft account you use.",
      profile: "Read your Progmasoft account name.",
      email: "Read the email address you sign in and registered with.",
      "viget.packages.read": "Read the packages you have published on ViGet.",
      "viget.packages.publish": "Publish packages to ViGet under your account.",
      "viget.packages.yank": "Yank packages you have published on ViGet.",
      offline_access:
        "Keep this access when you are not using the application.",
    },
    consent: {
      eyebrow: "Progmasoft OAuth",
      title: "Allow {name}?",
      wants: "{name} wants to:",
      registeredBy: "Registered by {owner}.",
      returnTo: "You will be sent back to {origin}.",
      signedInAs: "Signed in as {name}.",
      withdrawLater:
        "You can withdraw this at any time under Allowed applications.",
      allow: "Allow",
      deny: "Deny",
      invalid:
        "This request does not name a registered application, address and scopes. Go back to the application and try again.",
    },
    allowed: {
      eyebrow: "Your account",
      title: "Allowed applications",
      description:
        "Withdrawing ends the application's access and refresh tokens at once; it will have to ask you again.",
      empty: "You have not allowed any application.",
      since: "Since {date}",
      deleted: "A deleted application",
      withdraw: "Withdraw",
    },
  },
  "de-DE": {
    metadata: {
      home: "Progmasoft OAuth",
      signIn: "Bei Progmasoft OAuth anmelden",
      portal: "OAuth-2.1-Tokens",
      newToken: "Neues Token",
      application: "Anwendung",
      consent: "Zugriff erlauben",
      allowed: "Erlaubte Anwendungen",
    },
    common: {
      product: "Progmasoft OAuth",
      developers: "OAuth-2.1-Tokens",
      console: "Console",
      allowedApplications: "Erlaubte Anwendungen",
      organization: "Progmasoft",
      back: "Zurück",
      signIn: "Anmelden",
      signOut: "Abmelden",
      signedInAs: "Angemeldet als {name}.",
      signInRequired:
        "Melden Sie sich bei Ihrem Progmasoft-Konto an, um die Tokens Ihrer Anwendungen zu verwalten.",
      signInAccount: "Bei Progmasoft anmelden",
      loading: "Wird geladen …",
      unreachable:
        "Progmasoft OAuth ist nicht erreichbar. Versuchen Sie es erneut.",
      notFound: "Keine Ihrer Anwendungen hat diese Client-ID.",
    },
    home: {
      eyebrow: "OAuth 2.1 · OpenID Connect",
      title: "Mit Progmasoft anmelden",
      description:
        "Lassen Sie Menschen sich mit ihrem Progmasoft-Konto bei Ihrer Anwendung anmelden und mit ihrer Zustimmung auf ViGet für sie handeln. Jede Entwicklerin und jeder Entwickler kann ein Token erstellen.",
      signedOut:
        "Melden Sie sich an, um OAuth-2.1-Tokens für Ihre Anwendungen zu erstellen oder die Anwendungen zu prüfen, denen Sie Zugriff erlaubt haben.",
      developersText: "Tokens Ihrer Anwendungen erstellen und verwalten.",
      allowedText: "Sehen und widerrufen, was Anwendungen für Sie tun dürfen.",
      discovery: "Discovery-Dokument",
    },
    signIn: {
      eyebrow: "Progmasoft OAuth",
      title: "Bei Progmasoft anmelden",
      description:
        "Verwenden Sie Ihr Progmasoft-Konto. Diese Anmeldung bleibt auf credentials.progmasoft.com; Anwendungen sehen Ihr Passwort nie.",
      email: "E-Mail-Adresse",
      password: "Passwort",
      submit: "Anmelden",
      working: "Anmeldung läuft …",
      failed: "Die E-Mail-Adresse oder das Passwort ist nicht richtig.",
      noAccount: "Noch kein Konto?",
      createAccount: "Progmasoft-Konto erstellen",
    },
    overview: {
      eyebrow: "Progmasoft Console",
      title: "Mit Progmasoft entwickeln",
      description:
        "Verwalten Sie, wie Ihre Anwendungen Progmasoft nutzen: heute die Anmeldung mit Progmasoft-Konten, weitere Progmasoft-Dienste, sobald sie öffnen.",
      credentialsText:
        "Tokens Ihrer Anwendungen: Web, Single-Page, Desktop, Mobil und Dienst.",
      allowedText: "Anwendungen, die für Ihr eigenes Konto handeln dürfen.",
      docs: "Entwicklerhandbuch",
      docsText:
        "Flows, Berechtigungen, Zustimmung und Grenzen von Progmasoft OAuth.",
    },
    portal: {
      eyebrow: "Entwickler",
      title: "OAuth-2.1-Tokens",
      description:
        "Jedes Token ist eine Anwendung: ihre Client-ID, ihr Secret, falls ihr Typ eines hat, und wohin Menschen nach der Anmeldung zurückkehren.",
      newToken: "Neues Token",
      empty: "Sie haben noch kein Token.",
      limit: "Ein Konto kann {count} Tokens haben.",
      endpoints:
        "Anwendungen, die Menschen anmelden, verwenden den Authorization-Code-Flow mit PKCE (S256). Das Discovery-Dokument nennt jeden Endpunkt.",
    },
    kinds: {
      chooseTitle: "Neues Token",
      chooseDescription:
        "Der Typ bestimmt, wie sich die Anwendung ausweist und wohin Progmasoft OAuth Menschen zurückschicken darf. Er lässt sich später nicht ändern.",
      label: "Anwendungstyp",
      web: {
        title: "Webanwendung",
        description:
          "Eine Website mit Server. Authorization-Code-Flow mit PKCE und ein Client-Secret, das der Server aufbewahrt.",
      },
      spa: {
        title: "Single-Page-Anwendung",
        description:
          "Eine Browser-Anwendung ohne Server, etwa mit React oder Vue. Authorization-Code-Flow mit PKCE, kein Secret; der Token-Endpunkt antwortet ihrem Origin.",
      },
      desktop: {
        title: "Desktop-Anwendung",
        description:
          "Ein Desktop- oder Kommandozeilenprogramm. Authorization-Code-Flow mit PKCE, kein Secret; Rückkehr über eine Loopback-Adresse oder ein privates Schema.",
      },
      mobile: {
        title: "Mobile Anwendung",
        description:
          "Eine iOS- oder Android-App. Authorization-Code-Flow mit PKCE, kein Secret; Rückkehr über ein privates Schema oder eine beanspruchte https://-Adresse.",
      },
      service: {
        title: "Dienst",
        description:
          "Ein Server, der für sich selbst handelt, nicht für eine Person. Client-Credentials-Grant mit Client-Secret; keine Kontoberechtigung und keine Anmeldeseite.",
      },
    },
    form: {
      name: "Name",
      homepage: "Startseite (optional)",
      redirectUris: "Weiterleitungsadressen, eine pro Zeile",
      postLogoutRedirectUris:
        "Adressen nach der Abmeldung (optional), eine pro Zeile",
      scopes: "Berechtigungen, die die Anwendung anfragen darf",
      scopesNote:
        "openid ist immer verfügbar. Jede Person entscheidet weiterhin auf der Zustimmungsseite.",
      serviceNote:
        "Ein Dienst fragt /connect/token mit grant_type=client_credentials und seinem Secret an. Das Token nennt die Anwendung selbst und trägt keine Kontoberechtigung.",
      create: "Erstellen",
      save: "Speichern",
      saved: "Die Anwendung wurde gespeichert.",
      working: "Wird gespeichert …",
      hints: {
        web: "https://-Adressen; http:// nur für eine Loopback-Adresse während der Entwicklung.",
        spa: "https://-Adressen der Anwendung; http:// nur für eine Loopback-Adresse während der Entwicklung. Der Token-Endpunkt antwortet den Origins dieser Adressen.",
        desktop:
          "http:// mit einer Loopback-Adresse (http://127.0.0.1:8400/callback) oder ein privates Schema (com.example.app:/callback).",
        mobile:
          "Ein privates Schema (com.example.app:/callback) oder eine https://-Adresse, die die App beansprucht.",
        service: "",
      },
    },
    details: {
      clientId: "Client-ID",
      clientSecret: "Client-Secret",
      created: "Erstellt am {date}",
      copyNow:
        "Kopieren Sie das Secret jetzt. Es wird nur als Hash gespeichert und nie wieder angezeigt; erstellen Sie ein neues, wenn es verloren geht.",
      noSecret: "Dieser Typ hat kein Secret: Er weist sich nur mit PKCE aus.",
      secretHeading: "Secret",
      rotate: "Neues Client-Secret erstellen",
      rotateNote: "Das alte Secret funktioniert sofort nicht mehr.",
      deleteHeading: "Löschen",
      deleteNote:
        "Das Löschen beendet jede Autorisierung und jedes Token der Anwendung.",
      delete: "Anwendung löschen",
      confirmDelete: "Diese Anwendung löschen und alle ihre Tokens beenden?",
      tokenCreated: "Token erstellt",
      newSecret: "Neues Client-Secret",
    },
    scopes: {
      account: "Wissen, welches Progmasoft-Konto Sie verwenden.",
      profile: "Ihren Progmasoft-Kontonamen lesen.",
      email:
        "Die E-Mail-Adresse lesen, mit der Sie sich angemeldet und registriert haben.",
      "viget.packages.read":
        "Die Pakete lesen, die Sie auf ViGet veröffentlicht haben.",
      "viget.packages.publish":
        "Pakete unter Ihrem Konto auf ViGet veröffentlichen.",
      "viget.packages.yank":
        "Pakete zurückziehen, die Sie auf ViGet veröffentlicht haben.",
      offline_access:
        "Diesen Zugriff behalten, wenn Sie die Anwendung nicht verwenden.",
    },
    consent: {
      eyebrow: "Progmasoft OAuth",
      title: "{name} erlauben?",
      wants: "{name} möchte:",
      registeredBy: "Registriert von {owner}.",
      returnTo: "Sie werden zu {origin} zurückgeschickt.",
      signedInAs: "Angemeldet als {name}.",
      withdrawLater:
        "Sie können dies jederzeit unter „Erlaubte Anwendungen“ widerrufen.",
      allow: "Erlauben",
      deny: "Ablehnen",
      invalid:
        "Diese Anfrage nennt keine registrierte Anwendung, Adresse und Berechtigungen. Kehren Sie zur Anwendung zurück und versuchen Sie es erneut.",
    },
    allowed: {
      eyebrow: "Ihr Konto",
      title: "Erlaubte Anwendungen",
      description:
        "Der Widerruf beendet die Zugriffs- und Aktualisierungstokens der Anwendung sofort; sie muss Sie erneut fragen.",
      empty: "Sie haben noch keiner Anwendung Zugriff erlaubt.",
      since: "Seit {date}",
      deleted: "Eine gelöschte Anwendung",
      withdraw: "Widerrufen",
    },
  },
  "ru-RU": {
    metadata: {
      home: "Progmasoft OAuth",
      signIn: "Вход в Progmasoft OAuth",
      portal: "Токены OAuth 2.1",
      newToken: "Новый токен",
      application: "Приложение",
      consent: "Разрешить доступ",
      allowed: "Разрешённые приложения",
    },
    common: {
      product: "Progmasoft OAuth",
      developers: "Токены OAuth 2.1",
      console: "Консоль",
      allowedApplications: "Разрешённые приложения",
      organization: "Progmasoft",
      back: "Назад",
      signIn: "Войти",
      signOut: "Выйти",
      signedInAs: "Вы вошли как {name}.",
      signInRequired:
        "Войдите в аккаунт Progmasoft, чтобы управлять токенами своих приложений.",
      signInAccount: "Войти в Progmasoft",
      loading: "Загрузка…",
      unreachable: "Progmasoft OAuth недоступен. Попробуйте ещё раз.",
      notFound:
        "Ни у одного из ваших приложений нет такого идентификатора клиента.",
    },
    home: {
      eyebrow: "OAuth 2.1 · OpenID Connect",
      title: "Вход через Progmasoft",
      description:
        "Позвольте людям входить в ваше приложение с аккаунтом Progmasoft и с их согласия действовать от их имени в ViGet. Создать токен может любой разработчик.",
      signedOut:
        "Войдите, чтобы создавать токены OAuth 2.1 для своих приложений или просмотреть приложения, которым вы дали доступ.",
      developersText: "Создавайте токены своих приложений и управляйте ими.",
      allowedText:
        "Смотрите и отзывайте то, что приложениям разрешено делать от вашего имени.",
      discovery: "Документ обнаружения",
    },
    signIn: {
      eyebrow: "Progmasoft OAuth",
      title: "Вход в Progmasoft",
      description:
        "Используйте аккаунт Progmasoft. Этот вход остаётся на credentials.progmasoft.com; приложения никогда не видят ваш пароль.",
      email: "Адрес электронной почты",
      password: "Пароль",
      submit: "Войти",
      working: "Выполняется вход…",
      failed: "Неверный адрес электронной почты или пароль.",
      noAccount: "Ещё нет аккаунта?",
      createAccount: "Создать аккаунт Progmasoft",
    },
    overview: {
      eyebrow: "Progmasoft Console",
      title: "Разработка на Progmasoft",
      description:
        "Управляйте тем, как ваши приложения используют Progmasoft: сегодня вход с аккаунтами Progmasoft, другие сервисы Progmasoft — по мере их открытия.",
      credentialsText:
        "Токены ваших приложений: веб, одностраничных, настольных, мобильных и сервисов.",
      allowedText:
        "Приложения, которые могут действовать от имени вашего аккаунта.",
      docs: "Руководство разработчика",
      docsText: "Потоки, разрешения, согласие и ограничения Progmasoft OAuth.",
    },
    portal: {
      eyebrow: "Разработчикам",
      title: "Токены OAuth 2.1",
      description:
        "Каждый токен — это одно приложение: его идентификатор клиента, секрет, если он есть у этого типа, и адреса, куда люди возвращаются после входа.",
      newToken: "Новый токен",
      empty: "У вас ещё нет токенов.",
      limit: "У аккаунта может быть не более {count} токенов.",
      endpoints:
        "Приложения, через которые люди входят, используют поток authorization code с PKCE (S256). Все конечные точки перечислены в документе обнаружения.",
    },
    kinds: {
      chooseTitle: "Новый токен",
      chooseDescription:
        "Тип определяет, как приложение подтверждает себя и куда Progmasoft OAuth может возвращать людей. Позже его изменить нельзя.",
      label: "Тип приложения",
      web: {
        title: "Веб-приложение",
        description:
          "Сайт с сервером. Поток authorization code с PKCE и секрет клиента, который хранит сервер.",
      },
      spa: {
        title: "Одностраничное приложение",
        description:
          "Браузерное приложение без сервера, например на React или Vue. Поток authorization code с PKCE, без секрета; конечная точка токенов отвечает его origin.",
      },
      desktop: {
        title: "Настольное приложение",
        description:
          "Настольная или консольная программа. Поток authorization code с PKCE, без секрета; возврат через loopback-адрес или собственную схему.",
      },
      mobile: {
        title: "Мобильное приложение",
        description:
          "Приложение для iOS или Android. Поток authorization code с PKCE, без секрета; возврат через собственную схему или закреплённый адрес https://.",
      },
      service: {
        title: "Сервис",
        description:
          "Сервер, который действует от своего имени, а не от имени человека. Грант client credentials с секретом клиента; без разрешений аккаунта и без страницы входа.",
      },
    },
    form: {
      name: "Название",
      homepage: "Домашняя страница (необязательно)",
      redirectUris: "Адреса перенаправления, по одному на строку",
      postLogoutRedirectUris:
        "Адреса после выхода (необязательно), по одному на строку",
      scopes: "Разрешения, которые приложение может запрашивать",
      scopesNote:
        "openid доступен всегда. Каждый человек всё равно решает сам на странице согласия.",
      serviceNote:
        "Сервис обращается к /connect/token с grant_type=client_credentials и своим секретом. Токен называет само приложение и не содержит разрешений аккаунта.",
      create: "Создать",
      save: "Сохранить",
      saved: "Приложение сохранено.",
      working: "Сохранение…",
      hints: {
        web: "Адреса https://; http:// только для loopback-адреса во время разработки.",
        spa: "Адреса https:// приложения; http:// только для loopback-адреса во время разработки. Конечная точка токенов отвечает origin этих адресов.",
        desktop:
          "http:// с loopback-адресом (http://127.0.0.1:8400/callback) или собственная схема (com.example.app:/callback).",
        mobile:
          "Собственная схема (com.example.app:/callback) или адрес https://, закреплённый за приложением.",
        service: "",
      },
    },
    details: {
      clientId: "Идентификатор клиента",
      clientSecret: "Секрет клиента",
      created: "Создан {date}",
      copyNow:
        "Скопируйте секрет сейчас. Он хранится только в виде хеша и больше не будет показан; если он потерян, создайте новый.",
      noSecret:
        "У этого типа нет секрета: приложение подтверждает себя только через PKCE.",
      secretHeading: "Секрет",
      rotate: "Создать новый секрет клиента",
      rotateNote: "Старый секрет сразу перестаёт работать.",
      deleteHeading: "Удаление",
      deleteNote:
        "Удаление приложения прекращает все его авторизации и токены.",
      delete: "Удалить приложение",
      confirmDelete: "Удалить это приложение и прекратить все его токены?",
      tokenCreated: "Токен создан",
      newSecret: "Новый секрет клиента",
    },
    scopes: {
      account: "Знать, каким аккаунтом Progmasoft вы пользуетесь.",
      profile: "Видеть имя вашего аккаунта Progmasoft.",
      email:
        "Видеть адрес электронной почты, с которым вы входите и регистрировались.",
      "viget.packages.read": "Видеть пакеты, которые вы опубликовали в ViGet.",
      "viget.packages.publish":
        "Публиковать пакеты в ViGet от имени вашего аккаунта.",
      "viget.packages.yank":
        "Отзывать (yank) пакеты, которые вы опубликовали в ViGet.",
      offline_access:
        "Сохранять этот доступ, когда вы не пользуетесь приложением.",
    },
    consent: {
      eyebrow: "Progmasoft OAuth",
      title: "Разрешить {name}?",
      wants: "{name} запрашивает:",
      registeredBy: "Зарегистрировано пользователем {owner}.",
      returnTo: "Вы вернётесь на {origin}.",
      signedInAs: "Вы вошли как {name}.",
      withdrawLater:
        "Вы можете отозвать это в любое время в разделе «Разрешённые приложения».",
      allow: "Разрешить",
      deny: "Отклонить",
      invalid:
        "В этом запросе нет зарегистрированного приложения, адреса и разрешений. Вернитесь в приложение и попробуйте ещё раз.",
    },
    allowed: {
      eyebrow: "Ваш аккаунт",
      title: "Разрешённые приложения",
      description:
        "Отзыв сразу прекращает токены доступа и обновления приложения; ему придётся спросить вас снова.",
      empty: "Вы ещё не дали доступ ни одному приложению.",
      since: "С {date}",
      deleted: "Удалённое приложение",
      withdraw: "Отозвать",
    },
  },
  "he-IL": {
    metadata: {
      home: "Progmasoft OAuth",
      signIn: "כניסה ל־Progmasoft OAuth",
      portal: "אסימוני OAuth 2.1",
      newToken: "אסימון חדש",
      application: "אפליקציה",
      consent: "מתן גישה",
      allowed: "אפליקציות מורשות",
    },
    common: {
      product: "Progmasoft OAuth",
      developers: "אסימוני OAuth 2.1",
      console: "קונסולה",
      allowedApplications: "אפליקציות מורשות",
      organization: "Progmasoft",
      back: "חזרה",
      signIn: "כניסה",
      signOut: "יציאה",
      signedInAs: "מחובר/ת בתור {name}.",
      signInRequired:
        "היכנסו לחשבון Progmasoft שלכם כדי לנהל את אסימוני האפליקציות.",
      signInAccount: "כניסה ל־Progmasoft",
      loading: "בטעינה…",
      unreachable: "אין גישה ל־Progmasoft OAuth. נסו שוב.",
      notFound: "לאף אחת מהאפליקציות שלך אין מזהה לקוח כזה.",
    },
    home: {
      eyebrow: "OAuth 2.1 · OpenID Connect",
      title: "כניסה עם Progmasoft",
      description:
        "אפשרו לאנשים להיכנס לאפליקציה שלכם עם חשבון Progmasoft, ובהסכמתם לפעול עבורם ב־ViGet. כל מפתח/ת יכול/ה ליצור אסימון.",
      signedOut:
        "היכנסו כדי ליצור אסימוני OAuth 2.1 לאפליקציות שלכם או לעיין באפליקציות שנתתם להן גישה.",
      developersText: "יצירה וניהול של אסימוני האפליקציות שלכם.",
      allowedText: "צפייה וביטול של מה שאפליקציות רשאיות לעשות עבורכם.",
      discovery: "מסמך הגילוי",
    },
    signIn: {
      eyebrow: "Progmasoft OAuth",
      title: "כניסה ל־Progmasoft",
      description:
        "השתמשו בחשבון Progmasoft. הכניסה הזו נשארת ב־credentials.progmasoft.com; אפליקציות לעולם לא רואות את הסיסמה שלכם.",
      email: "כתובת דוא״ל",
      password: "סיסמה",
      submit: "כניסה",
      working: "מתבצעת כניסה…",
      failed: "כתובת הדוא״ל או הסיסמה שגויות.",
      noAccount: "עדיין אין חשבון?",
      createAccount: "יצירת חשבון Progmasoft",
    },
    overview: {
      eyebrow: "Progmasoft Console",
      title: "לבנות על Progmasoft",
      description:
        "נהלו איך האפליקציות שלכם משתמשות ב־Progmasoft: היום כניסה עם חשבונות Progmasoft, ושירותי Progmasoft נוספים כשייפתחו.",
      credentialsText:
        "אסימוני האפליקציות שלכם: ווב, עמוד יחיד, שולחן עבודה, נייד ושירות.",
      allowedText: "אפליקציות שרשאיות לפעול בשם החשבון שלכם.",
      docs: "מדריך למפתחים",
      docsText: "זרימות, הרשאות, הסכמה ומגבלות של Progmasoft OAuth.",
    },
    portal: {
      eyebrow: "מפתחים",
      title: "אסימוני OAuth 2.1",
      description:
        "כל אסימון הוא אפליקציה אחת: מזהה הלקוח שלה, הסוד שלה אם לסוג שלה יש סוד, והכתובות שאליהן אנשים חוזרים אחרי הכניסה.",
      newToken: "אסימון חדש",
      empty: "עדיין אין לך אסימונים.",
      limit: "לחשבון יכולים להיות עד {count} אסימונים.",
      endpoints:
        "אפליקציות שמכניסות אנשים משתמשות בזרימת authorization code עם PKCE (S256). מסמך הגילוי מפרט כל נקודת קצה.",
    },
    kinds: {
      chooseTitle: "אסימון חדש",
      chooseDescription:
        "הסוג קובע איך האפליקציה מזדהה ולאן Progmasoft OAuth רשאי להחזיר אנשים. אי אפשר לשנות אותו אחר כך.",
      label: "סוג האפליקציה",
      web: {
        title: "אפליקציית ווב",
        description:
          "אתר עם שרת. זרימת authorization code עם PKCE, וסוד לקוח שהשרת שומר.",
      },
      spa: {
        title: "אפליקציית עמוד יחיד",
        description:
          "אפליקציית דפדפן בלי שרת, למשל ב־React או Vue. זרימת authorization code עם PKCE, בלי סוד; נקודת הקצה של האסימונים עונה למקור שלה.",
      },
      desktop: {
        title: "אפליקציית שולחן עבודה",
        description:
          "תוכנה לשולחן העבודה או לשורת הפקודה. זרימת authorization code עם PKCE, בלי סוד; חזרה דרך כתובת loopback או סכמה פרטית.",
      },
      mobile: {
        title: "אפליקציה לנייד",
        description:
          "אפליקציית iOS או Android. זרימת authorization code עם PKCE, בלי סוד; חזרה דרך סכמה פרטית או כתובת https:// שהאפליקציה תובעת.",
      },
      service: {
        title: "שירות",
        description:
          "שרת שפועל בשם עצמו, לא בשם אדם. הענקת client credentials עם סוד לקוח; בלי הרשאות חשבון ובלי עמוד כניסה.",
      },
    },
    form: {
      name: "שם",
      homepage: "דף הבית (רשות)",
      redirectUris: "כתובות הפניה, אחת בכל שורה",
      postLogoutRedirectUris: "כתובות אחרי יציאה (רשות), אחת בכל שורה",
      scopes: "הרשאות שהאפליקציה רשאית לבקש",
      scopesNote: "openid זמין תמיד. כל אדם עדיין מחליט בעצמו בעמוד ההסכמה.",
      serviceNote:
        "שירות פונה ל־/connect/token עם grant_type=client_credentials ועם הסוד שלו. האסימון מציין את האפליקציה עצמה ואינו נושא הרשאות חשבון.",
      create: "יצירה",
      save: "שמירה",
      saved: "האפליקציה נשמרה.",
      working: "בשמירה…",
      hints: {
        web: "כתובות https://; ‏http:// רק לכתובת loopback בזמן פיתוח.",
        spa: "כתובות https:// של האפליקציה; ‏http:// רק לכתובת loopback בזמן פיתוח. נקודת הקצה של האסימונים עונה למקורות של הכתובות האלה.",
        desktop:
          "‏http:// עם כתובת loopback ‏(http://127.0.0.1:8400/callback), או סכמה פרטית ‏(com.example.app:/callback).",
        mobile:
          "סכמה פרטית ‏(com.example.app:/callback), או כתובת https:// שהאפליקציה תובעת.",
        service: "",
      },
    },
    details: {
      clientId: "מזהה לקוח",
      clientSecret: "סוד לקוח",
      created: "נוצר ב־{date}",
      copyNow:
        "העתיקו את הסוד עכשיו. הוא נשמר רק כגיבוב ולא יוצג שוב; אם הוא אבד, צרו סוד חדש.",
      noSecret: "לסוג הזה אין סוד: הוא מזדהה רק באמצעות PKCE.",
      secretHeading: "סוד",
      rotate: "יצירת סוד לקוח חדש",
      rotateNote: "הסוד הישן מפסיק לעבוד מיד.",
      deleteHeading: "מחיקה",
      deleteNote: "מחיקת האפליקציה מסיימת כל הרשאה וכל אסימון שלה.",
      delete: "מחיקת האפליקציה",
      confirmDelete: "למחוק את האפליקציה הזו ולסיים את כל האסימונים שלה?",
      tokenCreated: "האסימון נוצר",
      newSecret: "סוד לקוח חדש",
    },
    scopes: {
      account: "לדעת באיזה חשבון Progmasoft אתם משתמשים.",
      profile: "לקרוא את שם חשבון ה־Progmasoft שלכם.",
      email: "לקרוא את כתובת הדוא״ל שבה נכנסתם ונרשמתם.",
      "viget.packages.read": "לקרוא את החבילות שפרסמתם ב־ViGet.",
      "viget.packages.publish": "לפרסם חבילות ב־ViGet בשם החשבון שלכם.",
      "viget.packages.yank": "למשוך (yank) חבילות שפרסמתם ב־ViGet.",
      offline_access: "לשמור על הגישה הזו גם כשאינכם משתמשים באפליקציה.",
    },
    consent: {
      eyebrow: "Progmasoft OAuth",
      title: "לאשר את {name}?",
      wants: "{name} מבקשת:",
      registeredBy: "נרשמה על ידי {owner}.",
      returnTo: "תוחזרו אל {origin}.",
      signedInAs: "מחובר/ת בתור {name}.",
      withdrawLater: "אפשר לבטל זאת בכל עת בעמוד „אפליקציות מורשות”.",
      allow: "אישור",
      deny: "דחייה",
      invalid:
        "הבקשה הזו אינה מציינת אפליקציה, כתובת והרשאות רשומות. חזרו לאפליקציה ונסו שוב.",
    },
    allowed: {
      eyebrow: "החשבון שלך",
      title: "אפליקציות מורשות",
      description:
        "ביטול מסיים מיד את אסימוני הגישה והרענון של האפליקציה; היא תצטרך לבקש מכם שוב.",
      empty: "עדיין לא נתתם גישה לאף אפליקציה.",
      since: "מאז {date}",
      deleted: "אפליקציה שנמחקה",
      withdraw: "ביטול",
    },
  },
};

export function getCredentialsMessages(locale: Locale): CredentialsMessages {
  return credentialsMessages[locale];
}

/** Fills the `{name}` placeholders of a message. */
export function format(
  message: string,
  values: Record<string, string | number>,
): string {
  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
}
