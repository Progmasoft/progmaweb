<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1 -->

# Known limitations

This page lists what Progmaweb does not do yet, so that nobody has to discover it in production. Each entry says what
is missing, what follows from it, and what would close it.

## Accounts are kept in memory

The account API registers `InMemoryAccountStore` as its only store. Accounts and sessions live in the memory of the
API process.

- **Consequence.** Every restart of the API service deletes all accounts and signs everyone out. A deployment that
  restarts the API has this effect.
- **In operations.** Do not restart the API unless its code or configuration changed. A release that changes only the
  frontend should restart only the frontend service; see [Operations](../ops/README.md).
- **What closes it.** A durable implementation of `IAccountStore`. The interface already states the uniqueness and
  session rules such a store must keep.

## Email addresses are not verified

Registration accepts any well-formed address. Nothing proves that the person who registered owns it.

- **Consequence.** An address can be registered by someone other than its owner. For that reason a Google identity is
  never linked to an existing account by address.
- **What closes it.** A verification message and a confirmed state on the account.

## The API sends no mail

The mail host described in the [mail boundary](../ops/mail/README.md) is prepared for verification and recovery
messages, but the API contains no code that sends mail.

- **Consequence.** There is no automated password recovery. The recovery page asks the user to write to support from
  the address registered to the account.

## Passwords cannot be changed

The dashboard shows a "Change password" button that does nothing yet, and the API has no endpoint to change a
password.

## The sign-in page ignores `returnTo`

The dashboard sends a signed-out visitor to `/login?returnTo=...`. The sign-in form does not read the parameter and
always continues to the dashboard of the account that signed in.

## ViGet has no packages and no registry API here

The catalog pages are real and intentionally empty: no package or plugin has been published. Publishing is closed.

`viget.progmasoft.com/api/v1/status` is answered by a separate legacy process, not by this repository's API. Until
that route moves here, the legacy process has to keep running.

## The rate limit is per process

The authentication rate limit is counted in the memory of one API process, by client address. It is reset by a
restart and would not be shared between several instances.

## Documentation comments are not required

The DocFX gate fails on a broken link or an unresolved reference. It does not report a declaration without a
documentation comment, and most C# declarations have none, so the generated reference lists members without
descriptions.

## The Hebrew text has not been reviewed by a native speaker

The Hebrew translation was written and revised without a native reader. It may contain wording a native speaker would
not choose.

## One audit advisory is ignored

The dependency audit ignores a single advisory that has no fixed release and affects only the lint toolchain. The
entry and its removal condition are described in [Development](DEVELOPMENT.md).
