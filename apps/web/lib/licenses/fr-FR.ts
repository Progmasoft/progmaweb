// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  type LicenseMessages,
  examplesA,
  examplesB,
  examplesX,
} from "../licenses.ts";

export const frFR: LicenseMessages = {
  metadataTitle: "Licences de Progmasoft",
  metadataDescription:
    "Les licences écrites par Progmasoft : leurs textes, ce qu’elles permettent et interdisent, et comment les utiliser.",
  name: "Progmasoft Proprietary Source License, version 1.0",
  short: "PM-SPL 1.0",
  notice:
    "Cette page explique la licence ; elle n’est pas la licence. C’est le texte publié qui s’applique.",
  pages: {
    information: "Informations",
    faq: "Questions et réponses",
    categories: "Licences tierces",
  },
  texts: "Le texte",
  sums: "Sommes SHA-256",
  identifiers: "Identifiants SPDX :",
  index: {
    title: "Licences de Progmasoft",
    description:
      "Des licences que Progmasoft a écrites pour ses propres logiciels. Chacune a un texte publié qui ne change pas ; une modification est une nouvelle version.",
    pmSpl:
      "Pour les logiciels dont Progmasoft publie la source sans en faire de l’open source, comme le plugin IntelliJ IDEA d’Agenceland. Gratuit ; la source peut être lue, compilée, exécutée et modifiée pour son propre usage, et seul Progmasoft la distribue.",
  },
  information: {
    description:
      "Ce qu’est la PM-SPL 1.0, ce qu’elle permet et interdit, et comment un projet l’utilise.",
    sections: [
      {
        heading: "Ce qu’elle est",
        paragraphs: [
          "La PM-SPL est une licence à source disponible : la source du logiciel est publique, mais la licence n’est pas une licence open source. Le concédant est Progmasoft, et le logiciel est fourni gratuitement. Le même texte sert de licence d’utilisateur final du logiciel sur JetBrains Marketplace.",
        ],
      },
      {
        heading: "Ce qu’elle permet",
        paragraphs: [
          "Lire et étudier le logiciel ; le compiler et l’exécuter sur des ordinateurs que vous ou votre organisation contrôlez, à toute fin, travail commercial compris ; le modifier pour l’usage de votre organisation et garder les modifications ; y chercher des vulnérabilités et les signaler à Progmasoft ; citer de courts extraits dans des tickets, des discussions et des revues.",
        ],
      },
      {
        heading: "Ce qu’elle interdit",
        paragraphs: [
          "Donner le logiciel ou une version modifiée à quiconque hors de votre organisation, en source ou en build : seul Progmasoft le distribue. Le vendre, le louer ou le sous-licencier, ou l’inclure dans un autre produit. L’offrir, ou ce qui en dérive pour l’essentiel, comme service hébergé ou en réseau. Retirer les mentions de droit d’auteur, de licence ou d’attribution, et contourner les mesures techniques qui en contrôlent l’accès.",
        ],
      },
      {
        heading: "Noms et publicité",
        paragraphs: [
          "La licence ne donne aucun droit sur les noms Progmasoft, Agenceland ou tout autre produit de Progmasoft, au-delà de la description de l’origine du logiciel. Personne ne peut les utiliser, ni des noms prêtant à confusion avec eux, pour présenter sa propre version, son produit ou son service comme officiel, comme fait, approuvé ou pris en charge par Progmasoft, ou comme un produit de Progmasoft. Une publicité liée à Progmasoft ou à l’un de ses produits doit indiquer qu’elle se rapporte à Progmasoft ou à ce produit.",
        ],
      },
      {
        heading: "Forks, contributions et code tiers",
        paragraphs: [
          "Les conditions de GitHub permettent à ses utilisateurs de consulter et de forker un dépôt public au sein de GitHub, et la licence ne restreint pas cela ; un fork reste sous la licence et n’est pas distribué hors de GitHub.",
          "Les contributions sont les bienvenues. Un contributeur accorde à Progmasoft une licence étendue sur sa contribution, relicenciement compris, et confirme en avoir le droit.",
          "Le matériel tiers présent dans le logiciel garde sa propre licence et ses mentions.",
        ],
      },
      {
        heading: "Brevets, résiliation et droit applicable",
        paragraphs: [
          "La Progmasoft Patent Grant 1.1 s’applique là où le fichier PATENTS.md du logiciel l’indique, pour les usages que la licence permet. Quiconque prétend que le logiciel enfreint un brevet perd les licences de brevet qu’il a reçues pour lui.",
          "Une violation met fin à la licence. Une première violation est pardonnée si elle est corrigée dans les 30 jours suivant une notification de Progmasoft.",
          "Le logiciel est fourni tel quel, sans garantie, et la responsabilité est limitée dans la mesure permise par la loi. La licence est régie par le droit de l’Angleterre et du pays de Galles, devant les tribunaux d’Angleterre et du pays de Galles siégeant à Londres.",
        ],
      },
      {
        heading: "L’utiliser dans un projet",
        paragraphs: [
          "Un projet copie le texte brut dans LICENSES/LicenseRef-PM-SPL-1.0-only.txt ou LICENSES/LicenseRef-PM-SPL-1.0-or-later.txt et indique cet identifiant dans l’en-tête SPDX de chaque fichier. Avec -only, le logiciel reste sous la version 1.0 ; avec -or-later, un utilisateur peut choisir une version ultérieure publiée par Progmasoft.",
          "Le texte brut fait foi. Les formes Markdown et reStructuredText portent les mêmes mots, seulement balisés. Chaque fichier a sa somme SHA-256 à côté de lui, et les mêmes fichiers se trouvent dans le dépôt Progmasoft/licenses.",
        ],
      },
    ],
  },
  faq: {
    description: "Des réponses courtes sur la PM-SPL 1.0.",
    questions: [
      [
        "La PM-SPL est-elle une licence open source ?",
        "Non. La source est publique, mais la distribution est réservée à Progmasoft ; la licence ne répond donc pas à l’Open Source Definition.",
      ],
      [
        "Coûte-t-elle quelque chose ?",
        "Non. Les logiciels sous PM-SPL 1.0 sont fournis gratuitement.",
      ],
      [
        "Puis-je l’utiliser au travail ?",
        "Oui. Vous pouvez le compiler et l’exécuter sur des ordinateurs que vous ou votre organisation contrôlez, à toute fin, travail commercial compris.",
      ],
      [
        "Puis-je le modifier ?",
        "Oui, pour l’usage de votre organisation, et vous pouvez garder les modifications pour vous. Vous ne pouvez pas donner une version modifiée à quiconque hors de votre organisation.",
      ],
      [
        "Puis-je partager un build ou le publier ?",
        "Non. Seul Progmasoft distribue le logiciel, par exemple sur JetBrains Marketplace. Renvoyez les autres vers la publication de Progmasoft.",
      ],
      [
        "Puis-je forker le dépôt sur GitHub ?",
        "Oui, au sein de GitHub, comme ses conditions le permettent. Le fork reste sous PM-SPL et n’est pas distribué hors de GitHub.",
      ],
      [
        "Puis-je le faire fonctionner comme service pour d’autres ?",
        "Non. Offrir le logiciel, ou ce qui en dérive pour l’essentiel, comme service hébergé ou en réseau est interdit.",
      ],
      [
        "Puis-je contribuer ?",
        "Oui. Les contributions sont les bienvenues ; en contribuant, vous accordez à Progmasoft une licence étendue sur votre contribution, relicenciement compris.",
      ],
      [
        "J’ai trouvé une faiblesse de sécurité. Que faire ?",
        "Chercher des vulnérabilités est permis. Écrivez à support@progmasoft.com en décrivant ce que vous avez trouvé.",
      ],
      [
        "Que se passe-t-il si j’enfreins la licence ?",
        "Elle prend fin. Pour une première violation, vos droits reviennent si vous la corrigez dans les 30 jours suivant la notification de Progmasoft.",
      ],
      [
        "Quelle version s’applique à moi ?",
        "Celle que nomme le logiciel : LicenseRef-PM-SPL-1.0-only est la seule version 1.0 ; LicenseRef-PM-SPL-1.0-or-later vous laisse choisir une version ultérieure publiée par Progmasoft.",
      ],
      [
        "Quel texte fait foi ?",
        "Le fichier en texte brut. Les fichiers Markdown et reStructuredText portent les mêmes mots ; les sommes SHA-256 à côté de chaque fichier vous permettent de vérifier que vous avez le texte publié.",
      ],
    ],
  },
  categories: {
    description:
      "Les licences tierces que peuvent utiliser les logiciels sous PM-SPL, dans les trois catégories de l’Apache Software Foundation.",
    intro:
      "C’est une règle que Progmasoft suit pour ses logiciels sous PM-SPL ; elle ne fait pas partie du texte de la licence. Elle décide quel code tiers peut être une dépendance d’un logiciel sous PM-SPL ou y être copié.",
    category: "Catégorie",
    license: "Licence",
    identifier: "Identifiant SPDX",
    items: [
      {
        letter: "A",
        name: "Permissives",
        rule: "Peut être une dépendance et peut être copié, avec ses mentions conservées.",
        examples: examplesA,
      },
      {
        letter: "B",
        name: "Copyleft faible",
        rule: "Seulement sans modification, comme partie séparée, avec ses mentions ; jamais mêlé au code sous PM-SPL.",
        examples: examplesB,
      },
      {
        letter: "X",
        name: "Copyleft fort",
        rule: "Jamais : ni comme dépendance ni copié, car toute l’œuvre devrait alors prendre sa licence.",
        examples: examplesX,
      },
    ],
  },
};
