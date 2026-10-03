<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1 -->

# Progmaweb documentation

These documents describe Progmaweb as it is built today. Where something is planned but not implemented, the text says
so; [Known limitations](LIMITATIONS.md) collects those places.

| Document | Read it when you want to know |
| --- | --- |
| [Architecture](ARCHITECTURE.md) | which process serves which host, how a request travels, and where the trust boundaries are |
| [Account API](ACCOUNT-API.md) | every endpoint of the account service: requests, responses, errors, cookies and limits |
| [Localization](LOCALIZATION.md) | which languages are published, how a page picks one, how Hebrew is laid out, and how to add a language |
| [Development](DEVELOPMENT.md) | how to run, test and document the project locally, and what each CI check enforces |
| [Known limitations](LIMITATIONS.md) | what is deliberately missing or temporary, and what that means for operations |
| [Operations](../ops/README.md) | the release layout on the server and the activation contract |
| [Mail boundary](../ops/mail/README.md) | the mail host that belongs to the account service |
| [API reference](api/index.md) | the DocFX project that builds a reference from the C# sources |

The [repository README](../README.md) is the short introduction; start there if you are new.
