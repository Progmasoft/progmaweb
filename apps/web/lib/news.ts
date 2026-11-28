// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";
import { productFacts, type ProductSlug } from "./products.ts";

/** The words of one article in one language. */
interface ArticleText {
  title: string;
  summary: string;
  body: string[];
}

interface ArticleSource {
  date: string;
  product: ProductSlug;
  /** The release the article announces, when it announces one. */
  release?: string;
  text: Record<Locale, ArticleText>;
}

/** An article of news.progmasoft.com, with its address. */
export interface Article extends ArticleSource {
  slug: string;
}

/**
 * The address of an article: its English title in lower case, every run of
 * other characters a single hyphen, as in "tazel-0-2-0-shares-results".
 */
export function slugOf(title: string): string {
  return title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const sources: ArticleSource[] = [
  {
    date: "2026-11-27",
    product: "tazel",
    release: "0.2.0",
    text: {
      "en-US": {
        title: "Tazel 0.2.0 shares results through a remote cache",
        summary:
          "Builds take the results of actions from a cache that speaks Bazel's HTTP protocol, and readers accept only results signed with their key.",
        body: [
          "Tazel 0.2.0 takes the results of actions from a remote cache that speaks Bazel's HTTP protocol, such as bazel-remote, and gives it the results of the actions it runs. Keys do not depend on where the module is checked out, so two machines share their work. Before a result is used, every header the compiler found is checked by its digest and every file by its SHA-256. A cache that cannot be reached is reported once, and the build goes on.",
          "Results can be signed. A writer signs each result with Ed25519, RSA-4096 or ML-DSA-65, and a reader takes only results signed with its key's algorithm and verified by that key. tazel cache keygen makes a pair.",
          "Project files are compiled once and kept, so a command whose MODULE.csx and BUILD.csx did not change no longer starts the C# compiler: on a module of a dozen packages, a build with nothing to do went from about three seconds to under half a second. Every message can now be written as rich terminal output, plain lines for scripts, JSON lines or XML, with --message-format.",
        ],
      },
      "de-DE": {
        title: "Tazel 0.2.0 teilt Ergebnisse über einen entfernten Cache",
        summary:
          "Builds holen Ergebnisse von Aktionen aus einem Cache, der Bazels HTTP-Protokoll spricht, und Leser nehmen nur Ergebnisse an, die mit ihrem Schlüssel signiert sind.",
        body: [
          "Tazel 0.2.0 holt die Ergebnisse von Aktionen aus einem entfernten Cache, der Bazels HTTP-Protokoll spricht, etwa bazel-remote, und gibt ihm die Ergebnisse der Aktionen, die es ausführt. Die Schlüssel hängen nicht davon ab, wo das Modul liegt, sodass zwei Rechner ihre Arbeit teilen. Bevor ein Ergebnis verwendet wird, wird jeder vom Compiler gefundene Header über seinen Digest und jede Datei über ihren SHA-256 geprüft. Ein unerreichbarer Cache wird einmal gemeldet, und der Build läuft weiter.",
          "Ergebnisse können signiert werden. Ein Schreiber signiert jedes Ergebnis mit Ed25519, RSA-4096 oder ML-DSA-65, und ein Leser nimmt nur Ergebnisse an, die mit dem Algorithmus seines Schlüssels signiert und von ihm bestätigt sind. tazel cache keygen erzeugt ein Schlüsselpaar.",
          "Projektdateien werden einmal kompiliert und aufbewahrt: Ein Befehl, dessen MODULE.csx und BUILD.csx sich nicht geändert haben, startet den C#-Compiler nicht mehr. Bei einem Modul mit einem Dutzend Paketen sank ein Build ohne Arbeit von etwa drei Sekunden auf unter eine halbe. Mit --message-format erscheint jede Meldung als reiche Terminalausgabe, als einfache Zeilen für Skripte, als JSON-Zeilen oder als XML.",
        ],
      },
      "ru-RU": {
        title: "Tazel 0.2.0 делится результатами через удалённый кеш",
        summary:
          "Сборки берут результаты действий из кеша, работающего по HTTP-протоколу Bazel, а читатели принимают только результаты, подписанные их ключом.",
        body: [
          "Tazel 0.2.0 берёт результаты действий из удалённого кеша, работающего по HTTP-протоколу Bazel, например bazel-remote, и отдаёт ему результаты действий, которые выполняет сам. Ключи не зависят от того, где лежит модуль, поэтому две машины делят свою работу. Прежде чем результат будет использован, каждый найденный компилятором заголовок проверяется по дайджесту, а каждый файл — по SHA-256. О недоступном кеше сообщается один раз, и сборка продолжается.",
          "Результаты можно подписывать. Записывающий подписывает каждый результат ключом Ed25519, RSA-4096 или ML-DSA-65, а читающий принимает только результаты, подписанные алгоритмом его ключа и проверенные им. Пару ключей создаёт tazel cache keygen.",
          "Файлы проекта компилируются один раз и сохраняются: команда, у которой MODULE.csx и BUILD.csx не изменились, больше не запускает компилятор C#. На модуле из дюжины пакетов сборка, которой нечего делать, ускорилась примерно с трёх секунд до менее чем половины секунды. С --message-format каждое сообщение выводится как насыщенный вывод терминала, простые строки для скриптов, строки JSON или XML.",
        ],
      },
      "fr-FR": {
        title: "Tazel 0.2.0 partage ses résultats par un cache distant",
        summary:
          "Les builds reprennent les résultats d'actions d'un cache qui parle le protocole HTTP de Bazel, et les lecteurs n'acceptent que les résultats signés avec leur clé.",
        body: [
          "Tazel 0.2.0 reprend les résultats d'actions d'un cache distant qui parle le protocole HTTP de Bazel, comme bazel-remote, et lui confie les résultats des actions qu'il exécute. Les clés ne dépendent pas de l'endroit où se trouve le module : deux machines partagent leur travail. Avant d'utiliser un résultat, chaque en-tête trouvé par le compilateur est vérifié par son empreinte et chaque fichier par son SHA-256. Un cache injoignable est signalé une fois, et le build continue.",
          "Les résultats peuvent être signés. Un écrivain signe chaque résultat avec Ed25519, RSA-4096 ou ML-DSA-65, et un lecteur n'accepte que les résultats signés avec l'algorithme de sa clé et vérifiés par elle. tazel cache keygen crée une paire.",
          "Les fichiers de projet sont compilés une fois et conservés : une commande dont MODULE.csx et BUILD.csx n'ont pas changé ne lance plus le compilateur C#. Sur un module d'une douzaine de paquets, un build sans rien à faire est passé d'environ trois secondes à moins d'une demi-seconde. Avec --message-format, chaque message s'écrit en sortie de terminal riche, en lignes simples pour les scripts, en lignes JSON ou en XML.",
        ],
      },
    },
  },
  {
    date: "2026-11-20",
    product: "opentala",
    release: "0.1.0",
    text: {
      "en-US": {
        title: "OpenTala 0.1.0 boots on amd64 and arm64",
        summary:
          "The first release of OpenTala runs programs in user mode through Darwin's system call ABI and Mach IPC, on QEMU for both architectures.",
        body: [
          "OpenTala 0.1.0 is the first release of the kernel. It boots on amd64 through Multiboot and on arm64 on QEMU's virt machine, enters user mode, runs a program and gives every page back when the program ends.",
          "Programs speak Darwin's system call ABI: syscall on amd64 and svc #0x80 on arm64, the BSD table and the Mach trap table with XNU's numbers, and the carry flag with errno on an error. Mach IPC has ports, a space of names per task with its rights, and mach_msg. A call that is not there ends in SIGSYS, and an exception kills the process with its signal instead of stopping the kernel.",
          "User pages are no-execute, the kernel's memory is closed to user mode, and SMEP and SMAP are on from the start on amd64, PXN, UXN and PAN on arm64. Every boot in CI checks the kernel on both machines, and the release carries the two kernels with their SHA-256 sums.",
        ],
      },
      "de-DE": {
        title: "OpenTala 0.1.0 bootet auf amd64 und arm64",
        summary:
          "Die erste Version von OpenTala führt Programme im Benutzermodus über Darwins Systemaufruf-ABI und Mach IPC aus, in QEMU für beide Architekturen.",
        body: [
          "OpenTala 0.1.0 ist die erste Version des Kernels. Er bootet auf amd64 über Multiboot und auf arm64 auf der virt-Maschine von QEMU, wechselt in den Benutzermodus, führt ein Programm aus und gibt jede Seite zurück, wenn das Programm endet.",
          "Programme sprechen Darwins Systemaufruf-ABI: syscall auf amd64 und svc #0x80 auf arm64, die BSD-Tabelle und die Mach-Trap-Tabelle mit den Nummern von XNU, und bei einem Fehler das Carry-Flag mit errno. Mach IPC bietet Ports, einen Namensraum je Task mit seinen Rechten und mach_msg. Ein fehlender Aufruf endet mit SIGSYS, und eine Ausnahme beendet den Prozess mit seinem Signal, statt den Kernel anzuhalten.",
          "Benutzerseiten sind nicht ausführbar, der Speicher des Kernels ist für den Benutzermodus gesperrt, und SMEP und SMAP sind auf amd64 von Anfang an aktiv, PXN, UXN und PAN auf arm64. Jeder Bootvorgang in der CI prüft den Kernel auf beiden Maschinen, und die Version enthält beide Kernel mit ihren SHA-256-Summen.",
        ],
      },
      "ru-RU": {
        title: "OpenTala 0.1.0 загружается на amd64 и arm64",
        summary:
          "Первый выпуск OpenTala запускает программы в пользовательском режиме через ABI системных вызовов Darwin и Mach IPC, в QEMU для обеих архитектур.",
        body: [
          "OpenTala 0.1.0 — первый выпуск ядра. Оно загружается на amd64 через Multiboot и на arm64 на машине virt в QEMU, переходит в пользовательский режим, запускает программу и возвращает каждую страницу, когда программа завершается.",
          "Программы говорят на ABI системных вызовов Darwin: syscall на amd64 и svc #0x80 на arm64, таблица BSD и таблица ловушек Mach с номерами XNU, а при ошибке — флаг переноса и errno. Mach IPC даёт порты, пространство имён каждой задачи с её правами и mach_msg. Отсутствующий вызов завершается сигналом SIGSYS, а исключение завершает процесс его сигналом, не останавливая ядро.",
          "Пользовательские страницы не исполняемы, память ядра закрыта для пользовательского режима, SMEP и SMAP включены с самого начала на amd64, PXN, UXN и PAN — на arm64. Каждая загрузка в CI проверяет ядро на обеих машинах, а выпуск содержит оба ядра с их суммами SHA-256.",
        ],
      },
      "fr-FR": {
        title: "OpenTala 0.1.0 démarre sur amd64 et arm64",
        summary:
          "La première version d'OpenTala exécute des programmes en mode utilisateur par l'ABI d'appels système de Darwin et Mach IPC, sous QEMU pour les deux architectures.",
        body: [
          "OpenTala 0.1.0 est la première version du noyau. Il démarre sur amd64 par Multiboot et sur arm64 sur la machine virt de QEMU, passe en mode utilisateur, exécute un programme et rend chaque page quand le programme se termine.",
          "Les programmes parlent l'ABI d'appels système de Darwin : syscall sur amd64 et svc #0x80 sur arm64, la table BSD et la table des traps Mach avec les numéros de XNU, et en cas d'erreur le drapeau de retenue avec errno. Mach IPC offre des ports, un espace de noms par tâche avec ses droits, et mach_msg. Un appel absent se termine par SIGSYS, et une exception tue le processus avec son signal au lieu d'arrêter le noyau.",
          "Les pages utilisateur ne sont pas exécutables, la mémoire du noyau est fermée au mode utilisateur, SMEP et SMAP sont actifs dès le départ sur amd64, PXN, UXN et PAN sur arm64. Chaque démarrage en CI vérifie le noyau sur les deux machines, et la version fournit les deux noyaux avec leurs sommes SHA-256.",
        ],
      },
    },
  },
  {
    date: "2026-11-15",
    product: "catch3",
    release: "0.4.0",
    text: {
      "en-US": {
        title: "Catch3 0.4.0 maps every test to the lines it runs",
        summary:
          "The Catch3 runner records coverage per test, and keeps secrets out of the processes it starts.",
        body: [
          "With --coverage=DIR, the Catch3 runner runs every test in a process of its own and keeps what each one reached: coverage.json maps each test to the lines it ran, and coverage.lcov holds the whole run. It reads LLVM source-based coverage from Clang and gcov from GCC.",
          "Workers and the processes the runner starts no longer inherit environment variables whose names look like secrets, such as TOKEN, SECRET or PASSWORD. A test that needs one names it with --pass-env, or with pass-env in the project configuration.",
          "Versions of Catch3 have three numbers again from this release on, MAJOR.MINOR.PATCH, as Semantic Versioning writes them. The repository tools are now C++17 programs run through Bazel.",
        ],
      },
      "de-DE": {
        title: "Catch3 0.4.0 ordnet jedem Test die Zeilen zu, die er ausführt",
        summary:
          "Der Catch3-Runner erfasst die Abdeckung je Test und hält Geheimnisse aus den Prozessen heraus, die er startet.",
        body: [
          "Mit --coverage=DIR führt der Catch3-Runner jeden Test in einem eigenen Prozess aus und hält fest, was jeder erreicht hat: coverage.json ordnet jedem Test die ausgeführten Zeilen zu, und coverage.lcov enthält den gesamten Lauf. Er liest die quellbasierte Abdeckung von LLVM aus Clang und gcov aus GCC.",
          "Worker und die vom Runner gestarteten Prozesse erben keine Umgebungsvariablen mehr, deren Namen nach Geheimnissen aussehen, etwa TOKEN, SECRET oder PASSWORD. Ein Test, der eine braucht, nennt sie mit --pass-env oder mit pass-env in der Projektkonfiguration.",
          "Versionen von Catch3 haben ab dieser Version wieder drei Zahlen, MAJOR.MINOR.PATCH, wie Semantic Versioning sie schreibt. Die Werkzeuge des Repositorys sind jetzt C++17-Programme, die über Bazel laufen.",
        ],
      },
      "ru-RU": {
        title: "Catch3 0.4.0 сопоставляет каждому тесту выполненные им строки",
        summary:
          "Исполнитель Catch3 записывает покрытие для каждого теста и не пускает секреты в запускаемые им процессы.",
        body: [
          "С --coverage=DIR исполнитель Catch3 запускает каждый тест в отдельном процессе и сохраняет, до чего он дошёл: coverage.json сопоставляет каждому тесту выполненные строки, а coverage.lcov содержит весь прогон. Он читает покрытие LLVM по исходному коду из Clang и gcov из GCC.",
          "Рабочие процессы и процессы, которые запускает исполнитель, больше не наследуют переменные окружения, чьи имена похожи на секреты, например TOKEN, SECRET или PASSWORD. Тест, которому такая нужна, называет её через --pass-env или pass-env в конфигурации проекта.",
          "С этого выпуска версии Catch3 снова состоят из трёх чисел, MAJOR.MINOR.PATCH, как их пишет Semantic Versioning. Инструменты репозитория теперь программы на C++17, запускаемые через Bazel.",
        ],
      },
      "fr-FR": {
        title: "Catch3 0.4.0 relie chaque test aux lignes qu'il exécute",
        summary:
          "Le lanceur de Catch3 enregistre la couverture de chaque test et tient les secrets à l'écart des processus qu'il démarre.",
        body: [
          "Avec --coverage=DIR, le lanceur de Catch3 exécute chaque test dans un processus à part et garde ce que chacun a atteint : coverage.json relie chaque test aux lignes qu'il a exécutées, et coverage.lcov contient l'exécution entière. Il lit la couverture par sources de LLVM avec Clang et gcov avec GCC.",
          "Les workers et les processus que lance le lanceur n'héritent plus des variables d'environnement dont le nom ressemble à un secret, comme TOKEN, SECRET ou PASSWORD. Un test qui en a besoin la nomme avec --pass-env, ou avec pass-env dans la configuration du projet.",
          "À partir de cette version, les versions de Catch3 ont de nouveau trois nombres, MAJOR.MINOR.PATCH, comme les écrit Semantic Versioning. Les outils du dépôt sont désormais des programmes C++17 lancés par Bazel.",
        ],
      },
    },
  },
];

/** Every article, newest first. */
export const articles: Article[] = sources
  .map((source) => ({ ...source, slug: slugOf(source.text["en-US"].title) }))
  .sort((a, b) => b.date.localeCompare(a.date));

export function findArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function articleUrl(article: Article): string {
  return `https://news.progmasoft.com/${article.slug}`;
}

/** The release notes an article points to, from the catalog. */
export function releaseNotes(article: Article): string | undefined {
  const release = productFacts(article.product).latestRelease;
  return release && release.version === article.release
    ? release.url
    : undefined;
}

interface NewsMessages {
  title: string;
  description: string;
  latest: string;
  back: string;
  notes: string;
  product: string;
  read: string;
}

const newsMessages: Record<Locale, NewsMessages> = {
  "en-US": {
    title: "News",
    description: "Releases and announcements from Progmasoft.",
    latest: "Latest news",
    back: "All news",
    notes: "Release notes",
    product: "About {name}",
    read: "Read the announcement",
  },
  "de-DE": {
    title: "Neuigkeiten",
    description: "Versionen und Ankündigungen von Progmasoft.",
    latest: "Neueste Meldungen",
    back: "Alle Neuigkeiten",
    notes: "Versionshinweise",
    product: "Über {name}",
    read: "Ankündigung lesen",
  },
  "ru-RU": {
    title: "Новости",
    description: "Выпуски и объявления Progmasoft.",
    latest: "Последние новости",
    back: "Все новости",
    notes: "Примечания к выпуску",
    product: "О {name}",
    read: "Читать объявление",
  },
  "fr-FR": {
    title: "Actualités",
    description: "Versions et annonces de Progmasoft.",
    latest: "Dernières actualités",
    back: "Toutes les actualités",
    notes: "Notes de version",
    product: "À propos de {name}",
    read: "Lire l'annonce",
  },
};

/**
 * The pages of news.progmasoft.com and the internal routes that render them:
 * the list, and one page per article.
 */
export function newsRoute(pathname: string): string | null {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  if (path === "/") {
    return "/news";
  }
  const slug = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(path)?.[1];
  return slug && findArticle(slug) ? `/news/${slug}` : null;
}

/** The words of news.progmasoft.com in one language. */
export function getNewsMessages(locale: Locale): NewsMessages {
  return newsMessages[locale];
}

/** An article in one language. */
export function articleText(article: Article, locale: Locale): ArticleText {
  return article.text[locale];
}
