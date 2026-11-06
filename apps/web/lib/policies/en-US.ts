// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { PolicyMessages } from "../policies";

export const enUS: PolicyMessages = {
  versionLabel: "Version of",
  versionDate: "6 November 2026",
  seeAlso: "See also",
  privacy: {
    title: "Privacy Policy",
    description:
      "What Progmasoft keeps about you, why it keeps it, and what it never does with it.",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "Progmasoft runs progmasoft.com, Progmasoft Account, Progmasoft Credentials and the Progmasoft Console, ViGet, AI Support and the Progmasoft product sites. This policy covers all of them. Write to support@progmasoft.com with any question about it.",
        ],
      },
      {
        heading: "What your account keeps",
        paragraphs: [
          "Your account name, your email address, and either a hash of your password or the identifier Google gives your Google identity. We never keep your password itself: it is hashed before it is stored. We also keep when the account was created, and which version of these policies you accepted and when.",
          "While you are signed in we keep a digest of your session token and the moment the session ends. The token itself exists only in your browser.",
          "If you register an application in the Progmasoft Console, we keep what you enter for it.",
        ],
      },
      {
        heading: "Your IP address",
        paragraphs: [
          "We keep your IP address for one purpose only. When you upload a package or a plugin to ViGet, we record the IP address the upload came from, together with the upload. If the upload turns out to contain malicious software, we use that address to establish where it came from and give it to the competent authorities. We use it for nothing else.",
          "We do not keep IP addresses with your account, with your sessions or in the access logs of our web servers.",
          "To slow down password guessing, the sign-in service counts requests per address for a few minutes. The count is held in memory and never written down.",
        ],
      },
      {
        heading: "We do not sell your data",
        paragraphs: [
          "We do not sell, rent or trade your data to anyone, and that includes your IP address. We do not use it for advertising, and we do not build a profile of you.",
        ],
      },
      {
        heading: "Services that see your requests",
        paragraphs: [
          "Our sites are served through Cloudflare, which carries every request to us and protects the sites against attacks. To do that, Cloudflare processes your IP address under its own privacy policy. The pages use Cloudflare Web Analytics, which counts visits without cookies and without identifying you.",
          "If you sign in with Google, Google tells us the identifier and the email address of your Google identity, and nothing else of your Google account.",
          "Questions asked on AI Support are answered by a model that runs on our own server. They are not stored, and they are not sent to anyone else.",
        ],
      },
      {
        heading: "Cookies and storage",
        paragraphs: [
          "We set only the cookies the sites need: the cookie of your session, the short-lived cookies of Google sign-in and of Progmasoft Credentials, and the cookie that remembers your language. Your choice between light and dark is kept in the storage of your browser. None of them is used to track you.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Account data is kept for as long as the account exists. A session is removed once it has ended. The IP address of a ViGet upload is kept while the upload is on ViGet and for one year after it was removed, so that a report that arrives late can still be followed.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Write to support@progmasoft.com from the address of your account to learn what we keep about you, to correct it, or to have the account deleted. We answer within 30 days.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "A new version of this policy carries a new date on this page. We write to the owners of accounts before a new version takes effect.",
        ],
      },
    ],
  },
  security: {
    title: "Security Policy",
    description:
      "How Progmasoft protects your account and ViGet, what is forbidden on ViGet, and how to report a weakness.",
    sections: [
      {
        heading: "Your account",
        paragraphs: [
          "A password has at least 12 characters and is stored only as a hash. Attempts to sign in are limited in rate.",
          "A session lasts at most 30 days and ends when you sign out. Its cookie cannot be read by scripts on the page and is sent only over HTTPS.",
        ],
      },
      {
        heading: "Connections",
        paragraphs: [
          "Every Progmasoft site is served only over HTTPS, and browsers are told to keep it that way (HSTS). Every page carries a Content Security Policy, which allows only the scripts the page itself names.",
        ],
      },
      {
        heading: "Malicious software on ViGet",
        paragraphs: [
          "Uploading malicious software to ViGet is forbidden: software that harms, spies on or takes control of the computers it runs on, or that does something other than what it says it does.",
          "When we find such software or are told about it, we remove it, close the account that uploaded it, and give the IP address of the upload to the competent authorities, as the Privacy Policy describes.",
          "Every plugin ViGet serves is listed with its SHA-256 digest, and Tazel checks the digest before it uses the plugin.",
        ],
      },
      {
        heading: "What we ask of you",
        paragraphs: [
          "Choose a password you use nowhere else, sign in only on devices you trust, and sign out on a computer you share.",
        ],
      },
      {
        heading: "Reporting a weakness",
        paragraphs: [
          "If you find a security weakness in a Progmasoft site, product or package, write to support@progmasoft.com with what you found. Please give us time to fix it before you make it public, and do not read or change the data of other people while you test.",
        ],
      },
    ],
  },
};
