#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
# SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

# Prepares the second Progmasoft server (AlmaLinux 10) for AI Support, as root: the packages, two system users,
# llama.cpp and the two models, each checked against its SHA-256, the systemd units and the firewall. Run it from a
# checkout of this directory; it changes nothing that is already in place, so it can run again.
set -euo pipefail
cd "$(dirname "$0")"

LLAMA_BUILD=b11986
LLAMA_SHA256=7d73c3a96afc811a0331c8e92efb2f6363a50c0b9a15280cc2dee516b1a5281e
CHAT_URL=https://huggingface.co/unsloth/Qwen3.5-2B-GGUF/resolve/f6d5376be1edb4d416d56da11e5397a961aca8ae/Qwen3.5-2B-Q4_K_M.gguf
CHAT_SHA256=aaf42c8b7c3cab2bf3d69c355048d4a0ee9973d48f16c731c0520ee914699223
EMBED_URL=https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF/resolve/370f27d7550e0def9b39c1f16d3fbaa13aa67728/Qwen3-Embedding-0.6B-Q8_0.gguf
EMBED_SHA256=06507c7b42688469c4e7298b0a1e16deff06caf291cf0a5b278c308249c3e439

# Downloads a file unless it is there with the right digest, and refuses a file with another one.
fetch() {
    local url=$1 target=$2 digest=$3
    if [[ -f $target ]] && echo "$digest  $target" | sha256sum --check --status; then
        return
    fi
    curl --fail --location --silent --show-error --output "$target.part" "$url"
    echo "$digest  $target.part" | sha256sum --check --status || { echo "digest mismatch: $url" >&2; rm -f "$target.part"; exit 1; }
    mv "$target.part" "$target"
}

dnf -y install nginx certbot aspnetcore-runtime-10.0 libgomp

for user in llama aisupport; do
    id "$user" >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin "$user"
done

install -d -m 0755 /opt/llama /srv/models /srv/aisupport /srv/aisupport/releases
install -d -m 0750 -o aisupport -g aisupport /srv/aisupport/index
install -d -m 0750 /srv/aisupport/corpus /var/lib/letsencrypt

if [[ ! -x /opt/llama/$LLAMA_BUILD/llama-server ]]; then
    fetch "https://github.com/ggml-org/llama.cpp/releases/download/$LLAMA_BUILD/llama-$LLAMA_BUILD-bin-ubuntu-x64.tar.gz" \
        "/opt/llama/llama-$LLAMA_BUILD.tar.gz" "$LLAMA_SHA256"
    install -d -m 0755 "/opt/llama/$LLAMA_BUILD"
    tar --extract --gzip --file "/opt/llama/llama-$LLAMA_BUILD.tar.gz" --directory "/opt/llama/$LLAMA_BUILD" \
        --strip-components=1 --no-same-owner
    rm "/opt/llama/llama-$LLAMA_BUILD.tar.gz"
fi
ln -sfn "/opt/llama/$LLAMA_BUILD" /opt/llama/current.new && mv -T /opt/llama/current.new /opt/llama/current

fetch "$CHAT_URL" /srv/models/Qwen3.5-2B-Q4_K_M.gguf "$CHAT_SHA256"
fetch "$EMBED_URL" /srv/models/Qwen3-Embedding-0.6B-Q8_0.gguf "$EMBED_SHA256"
chmod 0644 /srv/models/*.gguf

restorecon -R /opt/llama /srv/models /srv/aisupport /var/lib/letsencrypt
# nginx reaches the service on 127.0.0.1:5300.
setsebool -P httpd_can_network_connect 1

install -m 0644 llama-chat.service llama-embed.service aisupport.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now llama-chat.service llama-embed.service
systemctl enable aisupport.service

firewall-cmd --permanent --add-service=http --add-service=https
firewall-cmd --reload

# No log of nginx holds a client address (https://progmasoft.com/privacy): the access log has none, and the error
# log, which names the client of a failed request, keeps only critical entries.
perl nginx-no-ip.pl
sed -i 's#^error_log /var/log/nginx/error.log notice;#error_log /var/log/nginx/error.log crit;#' /etc/nginx/nginx.conf

# The certificate: first a site that answers the challenge on port 80, then the site of aisupport.conf.
if [[ ! -e /etc/letsencrypt/live/aisupport.progmasoft.com/fullchain.pem ]]; then
    cat > /etc/nginx/conf.d/aisupport.conf <<'SITE'
server {
    listen 80;
    listen [::]:80;
    server_name aisupport.progmasoft.com;
    location ^~ /.well-known/acme-challenge/ {
        root /var/lib/letsencrypt;
        default_type text/plain;
    }
}
SITE
    restorecon /etc/nginx/conf.d/aisupport.conf
    systemctl enable --now nginx.service
    systemctl reload nginx.service
    certbot certonly --webroot -w /var/lib/letsencrypt -d aisupport.progmasoft.com \
        --non-interactive --agree-tos --email support@progmasoft.com --no-eff-email
fi
install -m 0644 aisupport.conf /etc/nginx/conf.d/aisupport.conf
install -d -m 0755 /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\n# nginx reads a renewed certificate only when it reloads.\nsystemctl reload nginx\n' \
    > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
chmod 0755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
restorecon -R /etc/nginx /etc/letsencrypt/renewal-hooks
nginx -t
systemctl enable --now nginx.service certbot-renew.timer
systemctl reload nginx.service
