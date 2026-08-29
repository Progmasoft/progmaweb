# SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
# SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

set shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

install:
    pnpm install --frozen-lockfile

web-check:
    pnpm check

web-build:
    pnpm build

api-build:
    dotnet build Progmaweb.slnx --configuration Release

api-test:
    dotnet test --project apps/api-tests/Progmaweb.Api.Tests.csproj --configuration Release

verify: web-check web-build api-build api-test
