set shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

node := "C:/Users/hasan/AppData/Local/Programs/nodejs"
dotnet := "C:/Program Files/JetBrains/JetBrains Rider 2026.2.0.2/lib/ReSharperHost/windows-x64/dotnet/dotnet.exe"

install:
    $env:Path = '{{node}};' + $env:Path; pnpm install --frozen-lockfile

web-check:
    $env:Path = '{{node}};' + $env:Path; pnpm check

web-build:
    $env:Path = '{{node}};' + $env:Path; pnpm build

api-build:
    & '{{dotnet}}' build Progmaweb.slnx --configuration Release

api-test:
    & '{{dotnet}}' test --project apps/api-tests/Progmaweb.Api.Tests.csproj --configuration Release

verify: web-check web-build api-build api-test
