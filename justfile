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
