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
   sitemaps, `/api/v1/status`, registration validation, and the existing Tala host.
6. On failure, restore the previous `current` target and restart only the Progmaweb services.

## Account database

The API keeps accounts and sessions in PostgreSQL. It reads the connection string from `ConnectionStrings__Accounts`
in `/etc/progmaweb/account.env`, the file the service unit already loads.

The connection uses the Unix socket of the local server and peer authentication: PostgreSQL accepts the operating
system user `progmaweb` as the database role `progmaweb`. No password exists, so none can leak:

```text
ConnectionStrings__Accounts=Host=/var/run/postgresql;Database=progmaweb_accounts;Username=progmaweb
```

Prepare the database once, before the first release that needs it:

1. Create the role and its database as the `postgres` user: a role `progmaweb` that may log in and nothing else, and
   a database `progmaweb_accounts` owned by it. The role must not be a superuser and needs no rights in any other
   database.
2. Confirm that `pg_hba.conf` has a `local ... peer` line that covers the database. Do not add a TCP rule or a
   password for this role.
3. Add the line above to `/etc/progmaweb/account.env`. Keep the file `root:progmaweb` with mode `0640`.
4. Check the connection as the service user before starting the service:
   `runuser -u progmaweb -- psql -d progmaweb_accounts -c 'select current_user'`.

The API creates and upgrades its own tables when it starts, in one transaction, and records the steps in
`account_schema_versions`. It does not start when the database cannot be reached or when the database is newer than
the release. `/health` on the loopback port answers 503 while the database does not answer.

A production API without a connection string does not start. Keeping accounts in memory there has to be asked for
with `Accounts__Store=Memory`, which loses every account at each restart; use it only for a host that must run
without a database for a short time.

The account database belongs to Progmaweb alone. Other services on the host have their own databases and roles; do
not share a role or a database with them.

### Releases and rollback

- Restarting the API keeps every account and session. Step 4 of the activation contract applies to both services.
- A release that adds a schema step upgrades the database at its first start. The previous release then refuses to
  start, because the database is newer than it. Before activating such a release, take a dump with
  `pg_dump --format=custom progmaweb_accounts`; rolling back means restoring that dump and then pointing `current`
  at the previous release.
- A release without a schema step rolls back as before: `current` points at the previous directory and the services
  restart.

There is no scheduled backup yet; see [Known limitations](../docs/LIMITATIONS.md).

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

The Progmasoft and ViGet Nginx hosts must never reuse `/srv/xsharp/website/current`. Tala compiler and language
content belongs to `tala.run` and its subdomains; sharing an origin server does not imply sharing a document root or
application process. The temporary ViGet status API remains on its dedicated loopback service while catalog pages are served by
Progmaweb.

## Mail boundary

The `mail/` directory is the operational baseline for `mail.progmasoft.com`, transactional messages from Progmasoft
Account, and the interactive `support@progmasoft.com` mailbox. It lives here because account verification and recovery
are Progmaweb responsibilities; the Tala and ViGet website repository does not own identity or mail services.

Apply those fragments deliberately rather than copying the directory over `/etc`. The accompanying mail README records
the DNS, TLS, OpenDKIM, Postfix, Dovecot, sender-login, filesystem-permission, and secret-handling contract.

## Progmasoft OAuth

The account API also serves Progmasoft OAuth, the OAuth 2.1 and OpenID Connect provider (see
[OAuth](../docs/OAUTH.md)), on three hosts. Nginx sends their API paths to the account API and every other path to the
Next.js site:

| Host | To the account API | Next.js pages |
| --- | --- | --- |
| `credentials.progmasoft.com` (issuer) | `/connect`, `/.well-known`, `/api` | the home page |
| `authorize.progmasoft.com` | `/connect`, `/api` | sign-in, consent, allowed applications |
| `console.progmasoft.com` | `/api` | the Progmasoft Console |

The API answers only the paths of each host there. The console uses the account session, whose cookie production
shares with `progmasoft.com` (`AccountSessions__CookieDomain`, set in `appsettings.json`). The OAuth tables
(`oauth_*`) live in the account database and are created by the API at start, like the account tables.

Production needs two keys, kept outside the releases so that tokens survive a release and a restart:

```sh
install -d -m 0750 -o root -g progmaweb /etc/progmaweb/oauth
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out /etc/progmaweb/oauth/signing.pem
openssl rand -base64 32 > /etc/progmaweb/oauth/encryption.key
chown root:progmaweb /etc/progmaweb/oauth/*; chmod 0640 /etc/progmaweb/oauth/*
restorecon -R /etc/progmaweb/oauth
```

`/etc/progmaweb/account.env` names them:

```text
OAuth__SigningKeyPath=/etc/progmaweb/oauth/signing.pem
OAuth__EncryptionKeyPath=/etc/progmaweb/oauth/encryption.key
```

The service refuses to start in production without them. Replacing the signing key invalidates identity tokens that
clients still hold; replacing the encryption key invalidates every access token, authorization code and refresh
token, so every application has to ask again. Back up both files with the database.

The certificate of `progmasoft.com` must name `credentials.progmasoft.com`, `authorize.progmasoft.com`,
`console.progmasoft.com`, `product.progmasoft.com`, `ides.progmasoft.com` and `catch3.progmasoft.com` as well; expand
it with certbot's webroot plugin before the vhosts are enabled, then check
`/.well-known/openid-configuration`, the sign-in page and the console from outside.

## ViGet: Tazel plugins

ViGet opens in stages. Now only the accounts that `ViGet__TazelPublishers` names (Progmasoft by default) publish Tazel
plugins, and they publish on the server; later every account will publish through the API. The catalog lives in the
account database (`viget_*` tables, created by the API at start) and the JARs in `/srv/viget/files`, which Nginx
serves:

| Address on `viget.progmasoft.com` | Served by |
| --- | --- |
| `/dslplugins/tazel`, `/dslplugins/tazel/<Publisher>/<Name>`, `/dslplugins/gradle` | the Next.js site |
| `/dslplugins/tazel/<Publisher>/<Name>/index.json` | the account API, `/api/v1/viget/dslplugins/tazel/...` |
| `/dslplugins/tazel/<Publisher>/<Name>/<Version>/<Name>-<Version>.jar` | the files below `/srv/viget/files` |

The directory belongs to the service user, and Nginx reads it:

```sh
install -d -m 0755 -o progmaweb -g progmaweb /srv/viget /srv/viget/files
semanage fcontext -a -t httpd_sys_content_t '/srv/viget/files(/.*)?'
restorecon -R /srv/viget/files
```

A plugin JAR is published with the configuration of the service, as its user:

```sh
cd /srv/progmaweb/current/api
runuser -u progmaweb -- env $(grep -v '^#' /etc/progmaweb/account.env | xargs) \
  ./Progmaweb.Api viget publish-tazel-plugin /tmp/CMake-0.1.0.jar
restorecon -R /srv/viget/files
```

The command checks the descriptor of the JAR, the publisher, its account and the version, which is never replaced.
`viget yank-tazel-plugin <Publisher> <Name> <Version>` yanks a version, and `--undo` takes the yank back.

## Maven repository

`maven.progmasoft.com/tazel` is a static Maven repository: it holds `com.progmasoft.tazel:tazel-api`, which plugins of
Tazel compile against. It lives in `/srv/maven/tazel`, labelled like the files of ViGet:

```sh
install -d -m 0755 /srv/maven /srv/maven/tazel
semanage fcontext -a -t httpd_sys_content_t '/srv/maven(/.*)?'
restorecon -R /srv/maven
```

A release of Tazel publishes the API into a local copy of the repository and copies it back, so that
`maven-metadata.xml` keeps the versions published before:

```sh
scp -r root@91.151.88.130:/srv/maven/tazel/. build/maven/        # in the Tazel checkout
./gradlew :tazel-api:publishAllPublicationsToStagingRepository
scp -r build/maven/. root@91.151.88.130:/srv/maven/tazel/
ssh root@91.151.88.130 'chown -R root:root /srv/maven && restorecon -R /srv/maven'
```

Published versions are never changed. The certificate of `progmasoft.com` must name `maven.progmasoft.com`.
