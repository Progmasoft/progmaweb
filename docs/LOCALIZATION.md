<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# Localization

Every page of Progmaweb is published in four languages. All of them live in `apps/web/lib/localization.ts`.

| Locale | Language |
| --- | --- |
| `en-US` | English |
| `de-DE` | German |
| `ru-RU` | Russian |
| `fr-FR` | French |

Hebrew (`he-IL`) was published until 2026-11-18 and is retired. A link that still asks for it with `?lang=he-IL` is
redirected for good (308) to the address without the parameter, and the cookie is set to `en-US`. A browser that
prefers Hebrew gets the fallback.

A page has one URL in every language. There are no language-specific paths and no `hreflang` alternatives, because a
language is a preference of the visitor, not a second address of the page.

## How a page picks its language

For each request the server decides in this order (`apps/web/lib/locale.server.ts`):

1. **The visitor's choice.** A valid `progmasoft_locale` cookie always wins.
2. **The browser.** Without that cookie the `Accept-Language` header is negotiated: the published language with the
   highest quality wins, and the order of the header breaks ties. Only the primary language is compared, so `de-AT`
   selects German.
3. **The fallback.** A browser that prefers no published language gets `en-US`.

Examples of the negotiation:

| `Accept-Language` | Page language |
| --- | --- |
| `fr-CA,fr;q=0.9,en;q=0.8` | French |
| `de-AT,de;q=0.9` | German |
| `tr-TR,tr;q=0.9,de;q=0.5` | German, the first preference that is published |
| `tr-TR,tr;q=0.9` | English, the fallback |
| `en;q=0.3,ru;q=0.9` | Russian; quality decides, not position |
| absent | English |

The header comes from the browser and is not trusted: only its first 1024 characters are read, and a malformed or
zero quality never selects a language.

## How a visitor changes the language

The language menu in the header calls the server action `selectLocale` (`apps/web/lib/locale.actions.ts`). The action
stores the cookie, and Next.js renders the current route again and applies the result in place. Nothing is reloaded:
scroll position, theme and form input stay as they are.

A link can carry the same choice as `?lang=<locale>`. The proxy stores the cookie and redirects to the URL without the
parameter, so a preference never becomes a second indexed address. The menu falls back to this link when the action
cannot reach the server.

A value that is not a published locale is ignored in both paths.

## The language cookie

| Attribute | Value |
| --- | --- |
| Name | `progmasoft_locale` |
| Domain | `.progmasoft.com` on production hosts, so the choice follows the visitor to the other Progmasoft hosts; host-only elsewhere |
| Lifetime | one year |
| Flags | `HttpOnly`, `SameSite=Lax`, and `Secure` over TLS |

Both paths write the cookie through `localeCookieOptions`. Two writers with different attributes would leave two
cookies behind, one shadowing the other.

## Message tree

`messages` holds one tree per locale with identical shape. Pages and components read it through
`getMessages(locale)`; there is no lookup by string key and no fallback from one language to another, so a missing
message is a type error or a failing test rather than an English sentence on a German page.

The tests in `apps/web/tests/localization.test.mjs` enforce that

- every locale has exactly the keys and array lengths of `en-US`, with no empty string;
- every locale has a name in its own language for the menu;
- negotiation and cookie attributes behave as described above.

## Adding a language

1. Add the locale to `supportedLocales`, its own name to `localeNames`, and its primary language to
   `localeByLanguage`.
2. Every published language is written left to right. A language written right to left needs rules for the direction
   of its text first.
3. Add a complete message tree. Copy the `en-US` tree and translate every string; keep product names and technical
   identifiers such as `BUILD.kts` unchanged.
4. Extend the tests: the list of published locales and a negotiation case for the new language.
5. Run `pnpm check`, `pnpm test`, `pnpm lint` and `pnpm build`, then read every page in the new language in a
   browser, in both themes and at a narrow width.

Have a native speaker read the text before it is published. The French text has not had that review yet; see
[Known limitations](LIMITATIONS.md).
