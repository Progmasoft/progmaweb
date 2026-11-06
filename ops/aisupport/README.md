<!--
SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1
-->

# AI Support

aisupport.progmasoft.com runs on the second Progmasoft server (AlmaLinux 10, four cores, no GPU). Three services
answer a question:

| Service | Listens on | What it does |
| --- | --- | --- |
| `llama-chat` | 127.0.0.1:8090 | llama-server with Qwen3.5 2B (Q4_K_M), thinking off, two answers at once |
| `llama-embed` | 127.0.0.1:8091 | llama-server with Qwen3-Embedding 0.6B (Q8_0), the vectors of passages and questions |
| `aisupport` | 127.0.0.1:5300 | `apps/aisupport`: the page, the index and `POST /api/ask` |

nginx terminates TLS on 443 and passes the page and the stream of an answer to `aisupport`. The question goes to the
embedding model, the four passages of the index closest to it go with the question to the chat model, and the answer
streams back with the passages as its sources. Neither questions nor answers are written anywhere, and no log holds a
client address.

## Files

- `setup.sh`: packages, the `llama` and `aisupport` users, llama.cpp and both models checked against their SHA-256,
  the units and the firewall. It changes nothing that is already in place.
- `llama-chat.service`, `llama-embed.service`, `aisupport.service`: the units.
- `aisupport.conf`: the nginx site, in `/etc/nginx/conf.d/`. The certificate comes from Let's Encrypt through the
  webroot `/var/lib/letsencrypt`.
- `deploy.sh <commit> <archive>`: a release from the output of `dotnet publish apps/aisupport -c Release`, the
  documents of `apps/aisupport/corpus.json` from GitHub, a new index, and the switch to the release.

## Deploying

From a checkout of `main` whose workflows are green:

```bash
dotnet publish apps/aisupport/Progmaweb.AiSupport.csproj -c Release -o out/aisupport
tar --create --gzip --file aisupport.tar.gz --directory out/aisupport .
scp aisupport.tar.gz ops/aisupport/deploy.sh root@13.140.205.74:/root/aisupport-setup/
ssh root@13.140.205.74 bash /root/aisupport-setup/deploy.sh "$(git rev-parse HEAD)" /root/aisupport-setup/aisupport.tar.gz
```

The first index embeds every passage, which takes some minutes on four cores; later ones embed only what changed. To
roll back, point `/srv/aisupport/current` at the previous release and restart `aisupport`.
