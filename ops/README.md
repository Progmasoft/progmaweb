# Progmaweb operations

Production uses immutable releases below `/srv/progmaweb/releases`. The `/srv/progmaweb/current` symlink selects one
release atomically. The account API and Next.js frontend listen only on loopback; Nginx is the sole public listener.

## Release layout

```text
/srv/progmaweb/
  current -> releases/<git-sha>
  releases/<git-sha>/
    api/
      Progmaweb.Api
    web/
      node_modules/
      apps/web/
        server.js
        .next/static/
        public/
```

The web directory is the full Next.js standalone output. In this pnpm monorepo the runnable server is emitted at
`apps/web/server.js`; root-level standalone modules must remain above it. Copy `.next/static` into
`apps/web/.next/static` and `public` into `apps/web/public`, because Next.js intentionally excludes those assets from the
standalone bundle. The API is published as a framework-dependent Linux x64 executable and uses the server's supported
.NET runtime.

## Activation contract

1. Build into a new directory named after the full Git commit; never mutate `current` in place.
2. Verify the API directly on `127.0.0.1:5085` and the frontend on `127.0.0.1:3010` before changing Nginx.
3. Point a temporary symlink at the verified release and rename it over `current` atomically.
4. Run `systemd-analyze verify`, `nginx -t`, then restart the two Progmaweb services and reload Nginx.
5. Verify apex HTTPS, the canonical `www` redirect, `/robots.txt`, `/api/v1/status`, registration validation, and the
   existing Visual X# and ViGet hosts.
6. On failure, restore the previous `current` target and restart only the Progmaweb services.

The Progmasoft Nginx host must never reuse `/srv/xsharp/website/current`. Visual X# compiler and language content belongs
to `xsharp-lang.xyz`; sharing an origin server does not imply sharing a document root or application process.
