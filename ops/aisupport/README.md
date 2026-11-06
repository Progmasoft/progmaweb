<!--
SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1
-->

# AI Support

aisupport.progmasoft.com runs on the second Progmasoft server (AlmaLinux 10, four cores, no GPU). Three services
answer a question:

| Service | Listens on | What it does |
| --- | --- | --- |
| `llama-chat` | 127.0.0.1:8090 | llama-server with Qwen3.5 2B (Q4_K_M), thinking off, one answer at a time |
| `llama-embed` | 127.0.0.1:8091 | llama-server with Qwen3-Embedding 0.6B (Q8_0), the vectors of passages and questions |
| `aisupport` | 127.0.0.1:5300 | `apps/aisupport`: the page, the index and `POST /api/ask` |

nginx terminates TLS on 443 and passes the page and the stream of an answer to `aisupport`. The question goes to the
embedding model, the three passages of the index closest to it go with the question to the chat model, and the answer
streams back with the passages as its sources. Neither questions nor answers are written anywhere, and no log holds a
client address.

## Files

- `setup.sh`: packages, the `llama` and `aisupport` users, llama.cpp and both models checked against their SHA-256,
  the units, the firewall, the certificate with a renewal hook that reloads nginx, and the nginx logs without client
  addresses (`nginx-no-ip.pl`, the same change as on the first server). It changes nothing that is already in place.
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

The first index embeds every passage; later ones embed only what changed. To
roll back, point `/srv/aisupport/current` at the previous release and restart `aisupport`.

## Speed

The four cores of the server (AMD EPYC at 2.0 GHz, about 10 GB/s of memory bandwidth, no GPU) run Qwen3.5 2B at about
37 prompt tokens and 9 generated tokens a second while the embedding server is idle (llama-bench, flash attention on,
2026-11-06), and Qwen3-Embedding 0.6B at about 50 prompt tokens a second. An answer reads a prompt of about 900 tokens
before its first word and is limited to 400 tokens: the first word comes after about 25 seconds, and an answer takes
25 to 60 seconds. The page says it starts in about a minute. Both servers share the four cores, so while an index is
being built answers are several times slower. The first index, about 1,500 passages, takes about two hours to embed.

## The model

Qwen3.5 2B was chosen over Qwen3.5 0.8B and Qwen2.5 1.5B on 2026-11-06, on this server, with the same documentation
excerpts and questions. llama-bench with the embedding server paused:

| Model | Prompt tokens/s | Generated tokens/s |
| --- | ---: | ---: |
| Qwen3.5 0.8B Q4_K_M | 66 | 18.2 |
| Qwen2.5 1.5B Instruct Q4_K_M | 42 | 9.6 |
| Qwen3.5 2B Q4_K_M | 37 | 9.2 |

Qwen3.5 0.8B is twice as fast but answered a Tazel question with syntax the excerpt does not have and said the
documented form was unsupported. Qwen2.5 1.5B is no faster than Qwen3.5 2B. Qwen3.5 2B, sampling at temperature 0.3
without a presence penalty, gave the documented syntax in English and Turkish and said it did not know when the
excerpts held no answer; an answer took 25 to 60 seconds.
