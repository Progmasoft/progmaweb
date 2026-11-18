// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PolicyMessages } from "../policies";

export const frFR: PolicyMessages = {
  versionLabel: "Version du",
  versionDate: "6 novembre 2026",
  seeAlso: "Voir aussi",
  privacy: {
    title: "Politique de confidentialité",
    description:
      "Ce que Progmasoft conserve à votre sujet, pourquoi il le conserve, et ce qu’il n’en fait jamais.",
    sections: [
      {
        heading: "Qui nous sommes",
        paragraphs: [
          "Progmasoft exploite progmasoft.com, Progmasoft Account, Progmasoft Credentials et la Console Progmasoft, ViGet et les sites des produits Progmasoft. Cette politique les couvre tous. Écrivez à support@progmasoft.com pour toute question à son sujet.",
        ],
      },
      {
        heading: "Ce que conserve votre compte",
        paragraphs: [
          "Le nom de votre compte, votre adresse e-mail, et soit une empreinte de votre mot de passe, soit l’identifiant que Google donne à votre identité Google. Nous ne conservons jamais votre mot de passe lui-même : il est haché avant d’être enregistré. Nous conservons aussi la date de création du compte, ainsi que la version de ces politiques que vous avez acceptée et sa date.",
          "Tant que vous êtes connecté, nous conservons une empreinte de votre jeton de session et le moment où la session prend fin. Le jeton lui-même n’existe que dans votre navigateur.",
          "Si vous enregistrez une application dans la Console Progmasoft, nous conservons ce que vous saisissez pour elle.",
        ],
      },
      {
        heading: "Votre adresse IP",
        paragraphs: [
          "Nous conservons votre adresse IP dans un seul but. ViGet n’accepte pas encore d’envois depuis les comptes : seul Progmasoft y publie. Lorsqu’il les acceptera, ViGet enregistrera l’adresse IP d’où provient chaque envoi, avec l’envoi. Si un envoi se révèle contenir un logiciel malveillant, nous utiliserons cette adresse pour établir sa provenance et la transmettrons aux autorités compétentes. Nous ne l’utiliserons à rien d’autre.",
          "Nous ne conservons pas d’adresses IP avec votre compte, avec vos sessions ni dans les journaux d’accès de nos serveurs web.",
          "Pour freiner les tentatives de deviner un mot de passe, le service de connexion compte les requêtes par adresse pendant quelques minutes. Ce décompte est tenu en mémoire et n’est jamais écrit.",
        ],
      },
      {
        heading: "Nous ne vendons pas vos données",
        paragraphs: [
          "Nous ne vendons, ne louons et n’échangeons vos données avec personne, y compris votre adresse IP. Nous ne les utilisons pas pour la publicité et nous ne dressons pas de profil de vous.",
        ],
      },
      {
        heading: "Les services qui voient vos requêtes",
        paragraphs: [
          "Nos sites sont servis par Cloudflare, qui nous achemine chaque requête et protège les sites contre les attaques. Pour cela, Cloudflare traite votre adresse IP selon sa propre politique de confidentialité. Les pages utilisent Cloudflare Web Analytics, qui compte les visites sans cookies et sans vous identifier.",
          "Si vous vous connectez avec Google, Google nous communique l’identifiant et l’adresse e-mail de votre identité Google, et rien d’autre de votre compte Google.",
        ],
      },
      {
        heading: "Cookies et stockage",
        paragraphs: [
          "Nous ne déposons que les cookies dont les sites ont besoin : le cookie de votre session, les cookies de courte durée de la connexion avec Google et de Progmasoft Credentials, et le cookie qui retient votre langue. Votre choix entre clair et sombre est conservé dans le stockage de votre navigateur. Aucun d’eux ne sert à vous suivre.",
        ],
      },
      {
        heading: "Combien de temps nous les conservons",
        paragraphs: [
          "Les données du compte sont conservées aussi longtemps que le compte existe. Une session est supprimée une fois terminée. L’adresse IP d’un envoi sur ViGet sera conservée tant que l’envoi est sur ViGet et pendant un an après son retrait, afin qu’un signalement tardif puisse encore être suivi.",
        ],
      },
      {
        heading: "Vos droits",
        paragraphs: [
          "Écrivez à support@progmasoft.com depuis l’adresse de votre compte pour savoir ce que nous conservons à votre sujet, pour le corriger ou pour faire supprimer le compte. Nous répondons sous 30 jours.",
        ],
      },
      {
        heading: "Modifications",
        paragraphs: [
          "Une nouvelle version de cette politique porte une nouvelle date sur cette page. Nous écrivons aux titulaires des comptes avant qu’une nouvelle version prenne effet.",
        ],
      },
    ],
  },
  security: {
    title: "Politique de sécurité",
    description:
      "Comment Progmasoft protège votre compte et ViGet, ce qui est interdit sur ViGet, et comment signaler une faiblesse.",
    sections: [
      {
        heading: "Votre compte",
        paragraphs: [
          "Un mot de passe compte au moins 12 caractères et n’est conservé que sous forme d’empreinte. Les tentatives de connexion sont limitées en fréquence.",
          "Une session dure au plus 30 jours et prend fin lorsque vous vous déconnectez. Son cookie ne peut pas être lu par les scripts de la page et n’est envoyé que par HTTPS.",
        ],
      },
      {
        heading: "Connexions",
        paragraphs: [
          "Chaque site de Progmasoft n’est servi que par HTTPS, et les navigateurs reçoivent la consigne de s’y tenir (HSTS). Chaque page porte une Content Security Policy, qui n’autorise que les scripts que la page nomme elle-même et le script d’analyse de Cloudflare.",
        ],
      },
      {
        heading: "Logiciels malveillants sur ViGet",
        paragraphs: [
          "Il est interdit d’envoyer un logiciel malveillant sur ViGet : un logiciel qui nuit aux ordinateurs sur lesquels il s’exécute, les espionne ou en prend le contrôle, ou qui fait autre chose que ce qu’il annonce.",
          "Lorsque nous trouvons un tel logiciel ou qu’on nous le signale, nous le retirons de ViGet : ses fichiers ne sont plus servis et ne sont conservés, hors d’atteinte, qu’à titre de preuve. Nous fermons le compte qui l’a envoyé et transmettons l’adresse IP de l’envoi aux autorités compétentes, comme le décrit la politique de confidentialité.",
          "Chaque plugin que sert ViGet est listé avec son empreinte SHA-256, et Tazel vérifie l’empreinte avant d’utiliser le plugin.",
        ],
      },
      {
        heading: "Ce que nous vous demandons",
        paragraphs: [
          "Choisissez un mot de passe que vous n’utilisez nulle part ailleurs, connectez-vous uniquement sur des appareils de confiance et déconnectez-vous sur un ordinateur partagé.",
        ],
      },
      {
        heading: "Signaler une faiblesse",
        paragraphs: [
          "Si vous trouvez une faiblesse de sécurité dans un site, un produit ou un paquet de Progmasoft, écrivez à support@progmasoft.com en décrivant ce que vous avez trouvé. Laissez-nous le temps de la corriger avant de la rendre publique, et ne lisez ni ne modifiez les données d’autres personnes pendant vos essais.",
        ],
      },
    ],
  },
};
