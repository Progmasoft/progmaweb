<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

# Known limitations

This page lists what Progmaweb does not do yet, so that nobody has to discover it in production. Each entry says what
is missing, what follows from it, and what would close it.

## The backup is at most a day old

Accounts, sessions and OAuth data are kept in PostgreSQL. Every night the database is dumped with `pg_dump` and copied
with restic to the second Progmasoft server, with the OAuth keys of `/etc/progmaweb`; a restore has been tried.

- **Consequence.** Losing the host loses what changed since the last night's backup.

## Accounts cannot be deleted by their owners

The store has no operation that removes an account, and the API has no endpoint for it.

- **Consequence.** A request to erase an account is carried out by support in the database, with the procedure in
  [Operations](../ops/README.md) ("Deleting an account").
- **What closes it.** A deletion operation in the store with an endpoint or an operator command, and a decision about
  what happens to the account name afterwards.

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

## The rate limit is per process

The authentication rate limit is counted in the memory of one API process, by client address. It is reset by a
restart and would not be shared between several instances.

## The French text has not been reviewed by a native speaker

The French translation was written from the English text without a native reader. It may contain wording a native
speaker would not choose.

## Two audit advisories are ignored

The dependency audit ignores two advisories that have no fixed release and affect only the lint toolchain. The entries
and their removal condition are described in [Development](DEVELOPMENT.md).
