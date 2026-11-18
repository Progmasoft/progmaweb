#!/usr/bin/env python3
# SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
# SPDX-License-Identifier: AGPL-3.0-or-later

"""Publishes a crate to Progmasoft's Cargo registry, rustreg.progmasoft.com.

The registry has no publish API: its index and crates are files that nginx
serves. This script takes a .crate made by `cargo package`, reads the
manifest Cargo normalized into it, writes the line of the sparse index for
that version, and puts both on the server over SSH. A version that is in the
index already is refused: a published crate never changes.

    python3 publish-crate.py [--dry-run] [--host root@91.151.88.130] <file.crate>
"""

import argparse
import hashlib
import json
import shlex
import subprocess
import sys
import tarfile

import tomllib

REGISTRY_INDEX = "sparse+https://rustreg.progmasoft.com/index/"
CRATES_IO = "https://github.com/rust-lang/crates.io-index"
ROOT = "/srv/rustreg"


def index_path(name):
    """The path of a crate's file in the index, as Cargo looks for it."""
    name = name.lower()
    if len(name) == 1:
        return f"1/{name}"
    if len(name) == 2:
        return f"2/{name}"
    if len(name) == 3:
        return f"3/{name[0]}/{name}"
    return f"{name[0:2]}/{name[2:4]}/{name}"


def read_manifest(crate_path):
    """The normalized Cargo.toml inside a .crate."""
    with tarfile.open(crate_path, "r:gz") as archive:
        for member in archive.getmembers():
            parts = member.name.split("/")
            if len(parts) == 2 and parts[1] == "Cargo.toml" and member.isfile():
                return tomllib.load(archive.extractfile(member))
    sys.exit(f"{crate_path}: no Cargo.toml")


def dependency(name, spec, kind, target):
    """One dependency of the index line."""
    if isinstance(spec, str):
        spec = {"version": spec}
    if "path" in spec and "version" not in spec:
        sys.exit(f"dependency {name} has a path but no version")
    registry = spec.get("registry-index")
    if registry is None:
        registry = CRATES_IO
    elif registry.rstrip("/") == REGISTRY_INDEX.rstrip("/"):
        # A dependency of this registry names no registry.
        registry = None
    entry = {
        "name": name,
        "req": spec.get("version", "*"),
        "features": spec.get("features", []),
        "optional": spec.get("optional", False),
        "default_features": spec.get("default-features", True),
        "target": target,
        "kind": kind,
        "registry": registry,
    }
    if "package" in spec:
        # A renamed dependency: `name` is the name the crate uses it by and
        # `package` the crate it is.
        entry["package"] = spec["package"]
    return entry


def dependencies(manifest):
    """Every dependency, with its kind and its target."""
    tables = [(manifest, None)]
    for target, table in manifest.get("target", {}).items():
        tables.append((table, target))
    result = []
    for table, target in tables:
        for key, kind in (
            ("dependencies", "normal"),
            ("build-dependencies", "build"),
            ("dev-dependencies", "dev"),
        ):
            for name, spec in table.get(key, {}).items():
                result.append(dependency(name, spec, kind, target))
    return sorted(result, key=lambda entry: (entry["name"], entry["kind"]))


def index_line(manifest, checksum):
    """The line of the sparse index for this version."""
    package = manifest["package"]
    features = manifest.get("features", {})
    plain = {
        key: value
        for key, value in features.items()
        if not any("dep:" in item or "?/" in item for item in value)
    }
    extended = {key: value for key, value in features.items() if key not in plain}
    line = {
        "name": package["name"],
        "vers": package["version"],
        "deps": dependencies(manifest),
        "cksum": checksum,
        "features": plain,
        "yanked": False,
        "links": package.get("links"),
        "rust_version": package.get("rust-version"),
        "v": 2 if extended else 1,
    }
    if extended:
        line["features2"] = extended
    return json.dumps(line, separators=(",", ":"), sort_keys=True)


def run(host, script, data=None):
    """Runs a shell script on the server, as one argument of ssh."""
    return subprocess.run(
        ["ssh", host, script], input=data, check=True, capture_output=True
    )


def main():
    parser = argparse.ArgumentParser(
        description="Publish a .crate to rustreg.progmasoft.com."
    )
    parser.add_argument("crate", help="the file cargo package wrote")
    parser.add_argument("--host", default="root@91.151.88.130")
    parser.add_argument(
        "--dry-run", action="store_true", help="print the index line and change nothing"
    )
    arguments = parser.parse_args()

    with open(arguments.crate, "rb") as file:
        data = file.read()
    checksum = hashlib.sha256(data).hexdigest()
    manifest = read_manifest(arguments.crate)
    name, version = manifest["package"]["name"], manifest["package"]["version"]
    publish = manifest["package"].get("publish")
    if (
        publish is not None
        and publish is not True
        and "progmasoft" not in (publish or [])
    ):
        sys.exit(f"{name} is not published to the progmasoft registry")
    line = index_line(manifest, checksum)
    print(line)
    if arguments.dry_run:
        return

    entry = f"{ROOT}/index/{index_path(name)}"
    crate = f"{ROOT}/crates/{name}/{name}-{version}.crate"
    # The server checks that the version is new, writes the crate, then the
    # index line, each through a temporary file and a rename.
    script = f"""set -eu
entry={shlex.quote(entry)}
crate={shlex.quote(crate)}
line={shlex.quote(line)}
if [ -e "$crate" ] || {{ [ -e "$entry" ] && grep -q '"vers":{json.dumps(version)},' "$entry"; }}; then
    echo "{name} {version} is published already" >&2
    exit 3
fi
install -d -m 0755 "$(dirname "$entry")" "$(dirname "$crate")"
cat > "$crate.tmp"
echo {shlex.quote(checksum)} " $crate.tmp" | sha256sum -c --quiet -
mv "$crate.tmp" "$crate"
{{ [ -e "$entry" ] && cat "$entry"; printf '%s\\n' "$line"; }} > "$entry.tmp"
mv "$entry.tmp" "$entry"
chmod 0644 "$crate" "$entry"
restorecon -R {ROOT}/index {ROOT}/crates
"""
    try:
        run(arguments.host, script, data)
    except subprocess.CalledProcessError as error:
        sys.exit(error.stderr.decode() or f"publishing failed with {error.returncode}")
    print(f"published {name} {version}")


if __name__ == "__main__":
    main()
