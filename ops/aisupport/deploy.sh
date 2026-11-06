#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
# SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

# Deploys a release of AI Support on the second Progmasoft server, as root:
#
#   deploy.sh <commit> <published.tar.gz>
#
# The archive is the output of `dotnet publish apps/aisupport -c Release`. The release goes to
# /srv/aisupport/releases/<commit> and is never changed afterwards. The documents of corpus.json are taken from the
# public repositories on GitHub, the index is rebuilt (only changed passages are embedded again), and the service
# moves to the new release. The previous release stays for a rollback: point /srv/aisupport/current back at it.
set -euo pipefail

commit=$1
archive=$2
release=/srv/aisupport/releases/$commit
[[ $commit =~ ^[0-9a-f]{40}$ ]] || { echo "not a commit: $commit" >&2; exit 1; }
[[ ! -e $release ]] || { echo "$release exists already" >&2; exit 1; }

install -d -m 0755 "$release"
tar --extract --gzip --file "$archive" --directory "$release" --no-same-owner
echo "$commit" > "$release/RELEASE.txt"
chmod -R a+rX "$release"

# The documents: one directory per repository, from the branch corpus.json names.
corpus=/srv/aisupport/corpus.new
rm -rf "$corpus"
install -d -m 0755 "$corpus"
python3 -c 'import json,sys; [print(s["repository"], s["branch"]) for s in json.load(open(sys.argv[1]))["sources"]]' \
    "$release/corpus.json" |
while read -r repository branch; do
    install -d -m 0755 "$corpus/$repository"
    curl --fail --location --silent --show-error \
        "https://codeload.github.com/Progmasoft/$repository/tar.gz/refs/heads/$branch" |
        tar --extract --gzip --directory "$corpus/$repository" --strip-components=1 --no-same-owner
done
chmod -R a+rX "$corpus"
rm -rf /srv/aisupport/corpus
mv "$corpus" /srv/aisupport/corpus
restorecon -R "$release" /srv/aisupport/corpus

runuser -u aisupport -- /usr/bin/dotnet "$release/Progmaweb.AiSupport.dll" index \
    "$release/corpus.json" /srv/aisupport/corpus /srv/aisupport/index/index.json

ln -sfn "$release" /srv/aisupport/current.new
mv -T /srv/aisupport/current.new /srv/aisupport/current
systemctl restart aisupport.service

for attempt in $(seq 1 30); do
    if curl --fail --silent http://127.0.0.1:5300/healthz; then
        echo
        exit 0
    fi
    sleep 1
done
echo "the service did not answer after the switch" >&2
exit 1
