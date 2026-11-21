<!-- SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com> -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->

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
5. Verify apex HTTPS, the canonical `www` redirect, account routes, host-specific robots and
   sitemaps, `/api/v1/status`, and registration validation.
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

### Deleting an account

The Privacy Policy lets an owner ask, from the address of the account, to have it deleted. The API has no deletion
endpoint, so support does it in the database, after checking that the request came from that address. Dump the
database first (`pg_dump progmaweb_accounts`), then, as the `progmaweb` role, in one transaction, with the `id` of the
account (`select id from accounts where normalized_account_name = upper('<Name>')`):

```sql
BEGIN;
-- What the account allowed applications to do: OpenIddict keeps the account id as the subject.
DELETE FROM oauth_tokens WHERE "Subject" = '<id>';
DELETE FROM oauth_authorizations WHERE "Subject" = '<id>';
-- Applications the account alone owns, with what was issued for them.
CREATE TEMP TABLE owned ON COMMIT DROP AS
    SELECT "ApplicationId" AS id FROM oauth_application_owners GROUP BY "ApplicationId"
    HAVING bool_and("AccountId" = '<id>');
DELETE FROM oauth_tokens WHERE "ApplicationId" IN (SELECT id FROM owned);
DELETE FROM oauth_authorizations WHERE "ApplicationId" IN (SELECT id FROM owned);
DELETE FROM oauth_applications WHERE "Id" IN (SELECT id FROM owned);
-- The account; its sessions and its remaining application ownerships go with it (ON DELETE CASCADE).
DELETE FROM accounts WHERE id = '<id>';
COMMIT;
```

Delete the dump once the deletion is confirmed.

### Logs without client addresses

The logs keep no IP address. On both servers the `main` log format of
`/etc/nginx/nginx.conf` therefore has no `$remote_addr` and no `$http_x_forwarded_for`, and `error_log` keeps only
`crit` entries, because a lower level names the client of a failed request. The change was applied by hand on the
first server on 2026-11-06, with a copy of the previous file in `/root/policy-20261106`. A new site in `conf.d` uses the `main` format or one of its own without an address.

### Visitor addresses behind Cloudflare

Cloudflare proxies the hosts, so Nginx is reached by Cloudflare edges, and one visitor's requests arrive from
many of them. `nginx/cloudflare-real-ip.conf`, installed as `/etc/nginx/conf.d/00-cloudflare-real-ip.conf`, takes
the visitor from `CF-Connecting-IP` when, and only when, the peer is in a Cloudflare range. Without it the API
rate-limits sign-in by edge: one visitor never reaches the limit and unrelated visitors share one. Compare its ranges
with <https://www.cloudflare.com/ips/> when Cloudflare announces a change. The address is used for the limit
alone; the logs above still keep none.

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

Every host of this server that Progmaweb serves has its own server block in `ops/nginx/progmaweb.conf`;
`viget.progmasoft.com` answers 410 Gone on every address: ViGet was closed on 2026-11-18.

## Mail boundary

The `mail/` directory is the operational baseline for `mail.progmasoft.com`, transactional messages from Progmasoft
Account, and the interactive `support@progmasoft.com` mailbox. It lives here because account verification and recovery
are Progmaweb responsibilities.

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
`console.progmasoft.com`, `product.progmasoft.com`, `license.progmasoft.com` and `catch3.progmasoft.com` as well; expand it with certbot's webroot plugin before the vhosts are enabled, then check
`/.well-known/openid-configuration`, the sign-in page and the console from outside. `catch3.progmasoft.com` only
sends a 308 to `catch3.uk`, the site of Catch3. That site is not Progmaweb's: it is the static output of
Progmasoft/catch3.uk, served by its own nginx file (`catch3-uk.conf`), with a certificate of its own for `catch3.uk`
and `www.catch3.uk` (`certbot certonly --webroot -w /var/lib/letsencrypt -d catch3.uk -d www.catch3.uk --key-type
ecdsa`).

## Reserved accounts

Public registration refuses the reserved names, `Progmasoft` and `Leitwolf`, which identify Progmasoft itself and its
administrator. They are created on the server by the person who will use them, in an interactive terminal; the
command asks for the password twice without showing it, so it never reaches a command line or a log:

```sh
systemd-run --quiet --wait --pty --uid=progmaweb --gid=progmaweb \
  -p EnvironmentFile=/etc/progmaweb/account.env -p Environment=ASPNETCORE_ENVIRONMENT=Production \
  -p WorkingDirectory=/srv/progmaweb/current/api \
  /usr/bin/dotnet /srv/progmaweb/current/api/Progmaweb.Api.dll \
  accounts provision-reserved Progmasoft support@progmasoft.com
```

The name, the email address and the password follow the rules of registration; only the reserved names are accepted,
and an existing account is never replaced. The account then signs in on `account.progmasoft.com` like any other.

## Closing ViGet

ViGet was closed on 2026-11-18. The API no longer has its endpoints, its command or its scopes, and Nginx answers
410 Gone on `viget.progmasoft.com`. What it left on the first server is removed once, as root, after a dump:

```sh
install -d -m 0700 /root/viget-20261118
runuser -u progmaweb -- pg_dump --table='viget_*' progmaweb_accounts > /root/viget-20261118/viget.sql
cp -a /srv/viget /root/viget-20261118/files
runuser -u progmaweb -- psql -d progmaweb_accounts -c 'DROP TABLE viget_tazel_plugin_versions, viget_tazel_plugins, viget_schema_versions'
rm -r /srv/viget
semanage fcontext -d -t httpd_sys_content_t '/srv/viget/files(/.*)?'
```

`ViGet__*` values go out of `/etc/progmaweb/account.env`.

## Maven repository

`maven.progmasoft.com/tazel` is a static Maven repository: it holds `com.progmasoft.tazel:tazel-api`, which plugins of
Tazel compile against. It lives in `/srv/maven/tazel`, labelled so that Nginx may read it:

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

## JSON Schemas

`schemastore.progmasoft.com/json/` serves the JSON Schemas of Progmasoft's file formats, such as
`progmasoft-cpp-index.json` for the `index.json` of each folder of guidelines in Progmasoft/progmasoft-cpp. The schemas
are in `ops/schemastore/json`, under MIT-0, and are served from `/srv/schemastore/json` by
`ops/schemastore/nginx/schemastore.conf` (installed as `/etc/nginx/conf.d/schemastore.conf`), to any origin, with GET
only:

```sh
install -d -m 0755 /srv/schemastore /srv/schemastore/json
semanage fcontext -a -t httpd_sys_content_t '/srv/schemastore(/.*)?'
scp ops/schemastore/json/*.json root@91.151.88.130:/srv/schemastore/json/
ssh root@91.151.88.130 'chown -R root:root /srv/schemastore && chmod 0644 /srv/schemastore/json/*.json && restorecon -R /srv/schemastore'
```

A schema's `$id` is its address. A change that would reject files the schema accepted before gets a new file name
instead. The certificate of `progmasoft.com` must name `schemastore.progmasoft.com`.

## Storage

`storage.progmasoft.com` serves files Progmasoft publishes, each beside its `.sha256sums`: the license texts in
`/pm-spl/<version>/` as `LICENSE-<version>.txt`, `.md` and `.rst`, the same files as in Progmasoft/licenses. It has no
listing and no pages; a published version never changes, so its files are cached as immutable. Files live in
`/srv/progmasoft-storage`, served by `ops/storage/nginx/storage.conf` (installed as
`/etc/nginx/conf.d/storage.conf`):

```sh
semanage fcontext -a -t httpd_sys_content_t '/srv/progmasoft-storage(/.*)?'
install -d -m 0755 /srv/progmasoft-storage/pm-spl/1.0
scp LICENSE-1.0.* root@91.151.88.130:/srv/progmasoft-storage/pm-spl/1.0/
ssh root@91.151.88.130 'chown -R root:root /srv/progmasoft-storage && restorecon -R /srv/progmasoft-storage'
```

The certificate of `progmasoft.com` must name `storage.progmasoft.com`.

## Cargo registry

`rustreg.progmasoft.com` is Progmasoft's Cargo registry: a sparse index under `/index/` and the crates under
`/crates/<name>/<name>-<version>.crate`, files in `/srv/rustreg` served by `ops/rustreg/nginx/rustreg.conf` (installed as
`/etc/nginx/conf.d/rustreg.conf`). The index is served with `Cache-Control: no-cache`; a crate never changes, so it is
cached as immutable. Nothing on the server writes: there is no publish API, so no token can be stolen to publish.
A crate made by `cargo package` is published over SSH by `ops/rustreg/publish-crate.py`, which writes the index line
from the manifest Cargo normalized into the crate and refuses a version that is published already:

```sh
semanage fcontext -a -t httpd_sys_content_t '/srv/rustreg(/.*)?'
install -d -m 0755 /srv/rustreg/index /srv/rustreg/crates
echo '{"dl":"https://rustreg.progmasoft.com/crates/{crate}/{crate}-{version}.crate"}' > /srv/rustreg/index/config.json
restorecon -R /srv/rustreg

cargo package -p <crate>
python3 ops/rustreg/publish-crate.py target/package/<crate>-<version>.crate
```

A project that uses the registry names it in `.cargo/config.toml`:

```toml
[registries.progmasoft]
index = "sparse+https://rustreg.progmasoft.com/index/"
```

The certificate of `progmasoft.com` must name `rustreg.progmasoft.com`.

## Git mirrors

`git.progmasoft.com` shows read-only mirrors of the public repositories under development, such as
`https://git.progmasoft.com/tazel`. GitHub stays where development happens: issues, pull requests and CI, and the source
links of the sites. Private and archived repositories are not mirrored.

The pages are the Next.js site (`apps/web/app/git`, host `git.progmasoft.com`, internal tree `/git`): the listing, and
for each repository its files (`/<name>`, `/<name>/tree?path=&ref=`), its log (`/<name>/log`), its branches and tags
(`/<name>/refs`) and its commits (`/<name>/commit/<sha>`). They read the API on loopback
(`/api/v1/git/repositories/...`, `apps/api/Git`), which runs `git` on the mirrors: every argument is a resolved commit,
a checked name or a checked path, options end before anything a request gave, and Git runs without the system and
global configuration for at most 15 seconds. Nginx sends `/<name>/raw` and `/<name>/archive` to the API, which answers
raw files as plain text or a download and archives as `.tar.gz`, and the clone paths to git-http-backend. The API
answers the Git endpoints only on this host and on loopback, and nothing else on this host.

The files are in `ops/git`:

| File | Installed as |
| --- | --- |
| `catalog.json` | `/etc/git-mirror/catalog.json`: the sections, the repositories and their descriptions, which the API reads |
| `repositories` | `/etc/git-mirror/repositories`: what is mirrored, one name per line |
| `git-mirror.sh` | `/usr/local/libexec/git-mirror`, labelled `bin_t` |
| `systemd/git-mirror.service`, `.timer` | `/etc/systemd/system/`: every ten minutes, as `gitmirror` |
| `systemd/fcgiwrap@githttp.*.d/` | `/etc/systemd/system/`: git-http-backend as `githttp`, socket for `nginx` only |
| `selinux/progmasoft_githttp.te` | the module `progmasoft_githttp` |
| `nginx/git.conf` | `/etc/nginx/conf.d/git.conf` |

Packages: `git-core`, and `fcgiwrap` from EPEL; `checkpolicy` builds the module. `githttp` is a system user without a
shell or a home (`useradd --system --shell /sbin/nologin --no-create-home githttp`). The API reads the mirrors as
`progmaweb`; `ProtectSystem=strict` leaves `/srv` readable.

- **Mirrors.** `git-mirror` fetches only branches and tags from `https://github.com/Progmasoft/<name>.git` (never the
  pull-request refs), prunes what GitHub removed, follows its default branch, and repacks into one pack with a bitmap
  when something changed, so a clone starts sending at once. It needs no credentials. A new repository needs a line in
  `repositories` and an entry in `catalog.json` (a test checks that both name the same repositories). git-http-backend
  serves only the mirrors `git-mirror` marks with `git-daemon-export-ok`; a mirror taken off `repositories` loses the
  mark and is deleted on the next run, so a repository that becomes private or archived stops being cloned within ten
  minutes, and the API shows only repositories whose mirror exists.
- **Read only.** Nginx answers 403 to `git-receive-pack` and to the dumb protocol; git-http-backend gets no user; the
  mirrors belong to `gitmirror` and are read as `githttp` and `progmaweb`, each trusting them through `safe.directory`
  for its own runs only.
- **SELinux.** `/srv/git/mirrors` is `git_sys_content_t`. `/usr/bin/fcgiwrap` is `httpd_exec_t`, so fcgiwrap runs in
  `httpd_t` and Nginx may connect to it, and `git-http-backend` is `git_script_exec_t`, so it moves into
  `git_script_t`. systemd's sandboxing sets NoNewPrivileges; the module `progmasoft_githttp` allows exactly that one
  move under it.

  ```sh
  semanage fcontext -a -t git_sys_content_t '/srv/git/mirrors(/.*)?'
  semanage fcontext -a -t bin_t /usr/local/libexec/git-mirror
  # /usr/sbin is an equivalence of /usr/bin, so semanage takes the /usr/bin spelling; restorecon on
  # /usr/sbin/fcgiwrap then gives it httpd_exec_t (check with ls -Z).
  semanage fcontext -a -t httpd_exec_t /usr/bin/fcgiwrap
  semanage fcontext -a -t git_script_exec_t /usr/libexec/git-core/git-http-backend
  restorecon -RF /srv/git /usr/local/libexec/git-mirror /usr/sbin/fcgiwrap /usr/libexec/git-core/git-http-backend
  ```
- **No Cloudflare proxy.** `git.progmasoft.com` is a DNS-only A record: through the proxy, a clone of a large repository
  (catch3, about 25 MB) never reached the client, while the origin served it in under a minute. The address of the server
  is public through `mail.progmasoft.com` anyway; Nginx limits requests and connections per address itself, and the
  API limits its Git endpoints to 600 requests a minute per address. The record is in
  `cloudflarectl/config.progmasoft.json`.
- **Look.** The pages are those of progmasoft.com: the same header, footer, languages and theme, and their content
  security policy. A README is not rendered; files are shown as text.
- **Certificate.** The certificate of `progmasoft.com` names `git.progmasoft.com` (webroot, `--expand`).
