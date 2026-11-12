#!/bin/sh
# SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
# SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

# Mirrors the repositories of /etc/git-mirror/repositories from https://github.com/Progmasoft into
# /srv/git/mirrors/<name>.git: branches and tags only, never the pull-request refs of GitHub, with
# what GitHub removed removed here too. Runs as gitmirror from git-mirror.service; installed as
# /usr/local/libexec/git-mirror.
set -eu

list=${GIT_MIRROR_LIST:-/etc/git-mirror/repositories}
root=${GIT_MIRROR_ROOT:-/srv/git/mirrors}
status=0

# A for loop, not a pipe: a pipe would run the loop in a subshell and lose the status.
names=$(grep -Ev '^[[:space:]]*(#|$)' "$list")
for name in $names; do
  case "$name" in
    *[!A-Za-z0-9._-]* | .* ) echo "git-mirror: skipping the name '$name'" >&2; status=1; continue ;;
  esac
  repository="$root/$name.git"
  if [ ! -d "$repository" ]; then
    git init --quiet --bare "$repository.new"
    git -C "$repository.new" config remote.origin.url "https://github.com/Progmasoft/$name.git"
    git -C "$repository.new" config remote.origin.fetch '+refs/heads/*:refs/heads/*'
    git -C "$repository.new" config --add remote.origin.fetch '+refs/tags/*:refs/tags/*'
    git -C "$repository.new" config remote.origin.tagOpt --no-tags
    git -C "$repository.new" config http.receivepack false
    mv "$repository.new" "$repository"
  fi
  # A clone is served from one pack with a bitmap, so it starts sending at once.
  git -C "$repository" config repack.writeBitmaps true
  git -C "$repository" config pack.writeBitmapHashCache true
  git -C "$repository" config gc.auto 0
  mkdir -p "$repository/info/web"
  before=$(git -C "$repository" for-each-ref --format="%(objectname) %(refname)" | sha256sum)
  if git -C "$repository" fetch --quiet --prune origin; then
    after=$(git -C "$repository" for-each-ref --format="%(objectname) %(refname)" | sha256sum)
    if [ "$before" != "$after" ] || [ ! -f "$repository/info/web/repacked" ]; then
      git -C "$repository" repack -a -d -b -q
      touch "$repository/info/web/repacked"
    fi
    # HEAD follows the default branch of GitHub.
    head=$(git -C "$repository" ls-remote --symref origin HEAD | sed -n 's|^ref: refs/heads/\([^[:space:]]*\)[[:space:]]*HEAD$|\1|p')
    [ -n "$head" ] && git -C "$repository" symbolic-ref HEAD "refs/heads/$head"
    # cgit shows the age of the last change of a repository from this file.
    git -C "$repository" for-each-ref --sort=-committerdate --count=1 \
      --format='%(committerdate:iso8601)' refs/heads > "$repository/info/web/last-modified"
  else
    echo "git-mirror: fetching $name failed" >&2
    status=1
  fi
done
exit "$status"
