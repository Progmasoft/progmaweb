// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

// The Git endpoints of the account API, answered from fixed data, so that the
// layout tests render the pages of git.progmasoft.com without mirrors. The
// data is long where pages could overflow: names, paths, subjects and lines.

import { createServer } from "node:http";

const commit = "0123456789abcdef0123456789abcdef01234567";
const parent = "89abcdef0123456789abcdef0123456789abcdef";
const date = "2026-11-21T12:00:00+00:00";
const repository = {
  name: "example-with-a-rather-long-repository-name",
  description:
    "A repository with a long description, so that the listing and the header wrap the way a real one would.",
  homepage: "https://github.com/Progmasoft/example",
  cloneUrl:
    "https://git.progmasoft.com/example-with-a-rather-long-repository-name",
  defaultBranch: "main",
  updatedAt: date,
};
const long = "a-path-segment-that-is-long-enough-to-overflow-a-phone";
const entries = [
  { name: "src", kind: "tree", size: null },
  { name: `${long}-directory`, kind: "tree", size: null },
  { name: "README.md", kind: "blob", size: 2048 },
  { name: `${long}-file.txt`, kind: "blob", size: 123456 },
  { name: "third_party", kind: "submodule", size: null },
];
const line = `int main(void) { return printf("%s\\n", "${long}${long}") > 0 ? 0 : 1; }`;
const commits = Array.from({ length: 12 }, (_, index) => ({
  commit: index === 0 ? commit : parent,
  author: "Progmasoft",
  date,
  subject: `Change ${index}: a subject line long enough to wrap on a phone screen of 360 pixels`,
}));

const routes = new Map(
  Object.entries({
    "/": [{ name: "Examples", repositories: [repository] }],
    [`/${repository.name}`]: repository,
    [`/${repository.name}/refs`]: {
      branches: [
        { name: "main", commit, date, subject: commits[0].subject },
        { name: `feature/${long}`, commit: parent, date, subject: "Work" },
      ],
      tags: [{ name: "example-1.0.0", commit, date, subject: "Release" }],
    },
    [`/${repository.name}/log`]: {
      reference: "main",
      commit,
      path: "",
      page: 0,
      commits,
      hasMore: true,
    },
    [`/${repository.name}/commits/${commit}`]: {
      commit,
      parents: [parent],
      author: "Progmasoft",
      authorDate: date,
      committer: "Progmasoft",
      commitDate: date,
      message: `${commits[0].subject}\n\nThe body of the message, with a line that is long: ${long}${long}.`,
      diff: [
        " src/main.c | 2 +-",
        "",
        "diff --git a/src/main.c b/src/main.c",
        "--- a/src/main.c",
        "+++ b/src/main.c",
        "@@ -1 +1 @@",
        `-${line}`,
        `+${line}`,
      ].join("\n"),
      isDiffTruncated: false,
    },
  }),
);

function tree(path) {
  if (path.endsWith(".c") || path.endsWith(".txt") || path.endsWith(".md")) {
    return {
      reference: "main",
      commit,
      path,
      kind: "blob",
      entries: null,
      size: 2048,
      isBinary: false,
      text: Array.from({ length: 40 }, () => line).join("\n"),
      isTruncated: false,
    };
  }
  return {
    reference: "main",
    commit,
    path,
    kind: "tree",
    entries,
    size: null,
    isBinary: false,
    text: null,
    isTruncated: false,
  };
}

const prefix = "/api/v1/git/repositories";
const port = Number(process.env.FAKE_GIT_API_PORT ?? "3101");

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  if (url.pathname === "/health") {
    response.end("Healthy");
    return;
  }
  const path = url.pathname.startsWith(prefix)
    ? url.pathname.slice(prefix.length) || "/"
    : null;
  const body =
    path === `/${repository.name}/tree`
      ? tree(url.searchParams.get("path") ?? "")
      : path === null
        ? undefined
        : routes.get(path);
  if (body === undefined) {
    response.statusCode = 404;
    response.end();
    return;
  }
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(body));
}).listen(port, "127.0.0.1");
