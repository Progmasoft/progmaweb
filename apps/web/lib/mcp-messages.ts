// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Locale } from "./localization";

/** The text of agencelandmcp.progmasoft.com, the Agenceland MCP Marketplace. */
export interface McpMessages {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  serversHeading: string;
  noServers: string;
  uploadsHeading: string;
  uploadsClosed: string;
  installHeading: string;
  install: string;
}

/** The marketplace in every published language. */
export const mcpMessages: Record<Locale, McpMessages> = {
  "en-US": {
    metadataTitle: "Agenceland MCP Marketplace",
    metadataDescription:
      "The MCP servers Agenceland installs, from verified publishers with pinned versions.",
    eyebrow: "Agenceland",
    title: "Agenceland MCP Marketplace",
    description:
      "MCP servers for Agenceland from verified publishers, each with a pinned version and the permissions it asks for shown before it is installed.",
    serversHeading: "Servers",
    noServers: "The marketplace lists no server.",
    uploadsHeading: "Publishing",
    uploadsClosed:
      "The marketplace takes no uploads. Publishing opens to Progmasoft accounts later; the Privacy Policy and the Security Policy say what applies to uploads.",
    installHeading: "Installing",
    install:
      "Agenceland installs a server with agenceland mcp add <Account>.<Server>, or from the MCP Marketplace inside Agenceland.",
  },
  "de-DE": {
    metadataTitle: "Agenceland MCP Marketplace",
    metadataDescription:
      "Die MCP-Server, die Agenceland installiert, von verifizierten Herausgebern mit festen Versionen.",
    eyebrow: "Agenceland",
    title: "Agenceland MCP Marketplace",
    description:
      "MCP-Server für Agenceland von verifizierten Herausgebern, jeder mit fester Version und den Berechtigungen, die er verlangt, angezeigt vor der Installation.",
    serversHeading: "Server",
    noServers: "Der Marketplace führt keinen Server.",
    uploadsHeading: "Veröffentlichen",
    uploadsClosed:
      "Der Marketplace nimmt keine Uploads an. Das Veröffentlichen öffnet sich später für Progmasoft-Konten; was für Uploads gilt, sagen die Datenschutzerklärung und die Sicherheitsrichtlinie.",
    installHeading: "Installieren",
    install:
      "Agenceland installiert einen Server mit agenceland mcp add <Konto>.<Server> oder über den MCP Marketplace in Agenceland.",
  },
  "ru-RU": {
    metadataTitle: "Agenceland MCP Marketplace",
    metadataDescription:
      "MCP-серверы, которые устанавливает Agenceland, от проверенных издателей с закреплёнными версиями.",
    eyebrow: "Agenceland",
    title: "Agenceland MCP Marketplace",
    description:
      "MCP-серверы для Agenceland от проверенных издателей: у каждого закреплённая версия, а разрешения, которые он запрашивает, показываются до установки.",
    serversHeading: "Серверы",
    noServers: "В Marketplace нет ни одного сервера.",
    uploadsHeading: "Публикация",
    uploadsClosed:
      "Marketplace не принимает загрузки. Публикация откроется для учётных записей Progmasoft позже; что относится к загрузкам, говорят Политика конфиденциальности и Политика безопасности.",
    installHeading: "Установка",
    install:
      "Agenceland устанавливает сервер командой agenceland mcp add <Учётная запись>.<Сервер> или через MCP Marketplace внутри Agenceland.",
  },
  "fr-FR": {
    metadataTitle: "Agenceland MCP Marketplace",
    metadataDescription:
      "Les serveurs MCP qu’Agenceland installe, d’éditeurs vérifiés, en versions fixées.",
    eyebrow: "Agenceland",
    title: "Agenceland MCP Marketplace",
    description:
      "Des serveurs MCP pour Agenceland d’éditeurs vérifiés, chacun en version fixée, avec les autorisations qu’il demande affichées avant l’installation.",
    serversHeading: "Serveurs",
    noServers: "Le Marketplace ne référence aucun serveur.",
    uploadsHeading: "Publication",
    uploadsClosed:
      "Le Marketplace n’accepte aucun envoi. La publication s’ouvrira plus tard aux comptes Progmasoft ; la Politique de confidentialité et la Politique de sécurité disent ce qui s’applique aux envois.",
    installHeading: "Installation",
    install:
      "Agenceland installe un serveur avec agenceland mcp add <Compte>.<Serveur>, ou depuis le MCP Marketplace dans Agenceland.",
  },
};

export function getMcpMessages(locale: Locale): McpMessages {
  return mcpMessages[locale];
}

/** Drops the trailing slash of every path but the root. */
function trimmed(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

/** The public pages of agencelandmcp.progmasoft.com: the marketplace alone. */
export function mcpRoute(pathname: string): string | null {
  return trimmed(pathname) === "/" ? "/mcp" : null;
}
