#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
# SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

# Deploys a release of AI Support on the second Progmasoft server, as root:
#
#   deploy.sh <commit> <published.tar.gz>
#
# The archive is the output of `dotnet publish apps/aisupport -c Release`. The release is assembled in a directory of
# its own, with the index of the documents of its corpus.json, and only a complete one is moved to
# /srv/aisupport/releases/<commit>; a failed run leaves nothing in the way of the next one. A release is never changed
# afterwards, and it carries its own index (index.json, a link into /srv/aisupport/index), so pointing
# /srv/aisupport/current back at an earlier release and restarting aisupport restores its documents too.
set -euo pipefail

commit=$1
archive=$2
[[ $commit =~ ^[0-9a-f]{40}$ ]] || { echo "not a commit: $commit" >&2; exit 1; }
release=/srv/aisupport/releases/$commit
[[ ! -e $release ]] || { echo "$release exists already" >&2; exit 1; }

# The archive holds regular files and directories with relative names only: a link or an absolute name could make
# the extraction, which runs as root, write outside the release.
if tar --list --verbose --gzip --file "$archive" | grep -Eq '^[^-d]'; then
    echo "the archive holds something other than files and directories" >&2
    exit 1
fi
if tar --list --gzip --file "$archive" | grep -Eq '(^/|(^|/)\.\.(/|$))'; then
    echo "the archive names a path outside the release" >&2
    exit 1
fi

staging=$(mktemp --directory /srv/aisupport/releases/.staging.XXXXXX)
corpus=$(mktemp --directory /srv/aisupport/.corpus.XXXXXX)
trap 'rm -rf "$staging" "$corpus"' EXIT

tar --extract --gzip --file "$archive" --directory "$staging" --no-same-owner --no-same-permissions
rm -f "$staging/RELEASE.txt" "$staging/index.json"
echo "$commit" > "$staging/RELEASE.txt"

# The documents: one directory per repository, from the branch corpus.json names.
python3 -c 'import json,sys; [print(s["repository"], s["branch"]) for s in json.load(open(sys.argv[1]))["sources"]]' \
    "$staging/corpus.json" |
while read -r repository branch; do
    install -d -m 0755 "$corpus/$repository"
    curl --fail --location --silent --show-error \
        "https://codeload.github.com/Progmasoft/$repository/tar.gz/refs/heads/$branch" |
        tar --extract --gzip --directory "$corpus/$repository" --strip-components=1 --no-same-owner
done
chmod -R a+rX "$staging" "$corpus"
restorecon -R "$staging" "$corpus"

# The index of this release starts from the one the running release uses, so unchanged passages keep their vectors.
index=/srv/aisupport/index/$commit.json
previous=$(readlink -f /srv/aisupport/current/index.json 2>/dev/null || true)
if [[ -n $previous && -f $previous && ! -e $index ]]; then
    install -m 0640 -o aisupport -g aisupport "$previous" "$index"
fi
runuser -u aisupport -- /usr/bin/dotnet "$staging/Progmaweb.AiSupport.dll" index \
    "$staging/corpus.json" "$corpus" "$index"
ln -s "$index" "$staging/index.json"

chmod 0755 "$staging"
mv -T "$staging" "$release"
ln -sfn "$release" /srv/aisupport/current.new
mv -T /srv/aisupport/current.new /srv/aisupport/current
systemctl restart aisupport.service

for _ in $(seq 1 30); do
    if curl --fail --silent http://127.0.0.1:5300/healthz; then
        echo
        exit 0
    fi
    sleep 1
done
echo "the service did not answer after the switch" >&2
exit 1
