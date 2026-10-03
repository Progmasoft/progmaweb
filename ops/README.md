<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1 -->

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
standalone bundle. The API is published as a framework-dependent Linux x64 deployment and is started explicitly as
`/usr/bin/dotnet /srv/progmaweb/current/api/Progmaweb.Api.dll`. Keeping the runtime invocation in the service contract
avoids depending on an apphost inode copied from a build machine retaining an executable SELinux label.

## Activation contract

1. Build into a new directory named after the full Git commit; never mutate `current` in place.
2. Verify the API directly on `127.0.0.1:5085` and the frontend on `127.0.0.1:3010` before changing Nginx.
3. Point a temporary symlink at the verified release and rename it over `current` atomically.
4. Run `systemd-analyze verify`, `nginx -t`, then restart the two Progmaweb services and reload Nginx.
5. Verify apex HTTPS, the canonical `www` redirect, account routes, ViGet catalog routes, host-specific robots and
   sitemaps, `/api/v1/status`, registration validation, and the existing Visual X# host.
6. On failure, restore the previous `current` target and restart only the Progmaweb services.

## Restarting the API deletes every account

The account store is in memory; see [Known limitations](../docs/LIMITATIONS.md). Restarting `progmaweb-api` deletes
all accounts and sessions. Until a durable store exists:

- When a release changes only `apps/web`, copy the `api` directory of the running release into the new release,
  confirm that the two directories are identical, switch `current`, and restart **only** `progmaweb-web`. The running
  API process keeps serving from the files it already opened.
- When a release changes `apps/api`, restarting the API is unavoidable. Say so before deploying, because every user
  has to register again.

Step 4 of the activation contract restarts both services; apply it to the API only in the second case.

## Lessons from past releases

- **Build the frontend on the server.** A standalone build made on another operating system carries native modules
  for that system. Send the source of the commit and run `pnpm install --frozen-lockfile` and the build on the host.
- **Test on a side port first.** Start the new `server.js` as the service user on a free loopback port, request the
  pages of each host with the matching `Host` header, then stop it. Only then switch `current`.
- **Check SELinux labels after copying.** Files copied from an administrator's home directory keep that directory's
  label. Run `restorecon -R` on the new release directory so it carries the default label of its location. Never
  switch SELinux to permissive to make a release work.
- **Keep the previous release.** A rollback is the `current` symlink pointing at the previous directory and a restart
  of the frontend service.

The Progmasoft and ViGet Nginx hosts must never reuse `/srv/xsharp/website/current`. Visual X# compiler and language
content belongs to `xsharp-lang.xyz`; sharing an origin server does not imply sharing a document root or application
process. The temporary ViGet status API remains on its dedicated loopback service while catalog pages are served by
Progmaweb.

## Mail boundary

The `mail/` directory is the operational baseline for `mail.progmasoft.com`, transactional messages from Progmasoft
Account, and the interactive `support@progmasoft.com` mailbox. It lives here because account verification and recovery
are Progmaweb responsibilities; the Visual X# and ViGet website repository does not own identity or mail services.

Apply those fragments deliberately rather than copying the directory over `/etc`. The accompanying mail README records
the DNS, TLS, OpenDKIM, Postfix, Dovecot, sender-login, filesystem-permission, and secret-handling contract.
