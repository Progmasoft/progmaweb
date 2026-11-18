// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { expireShadowingCookies } from "../lib/shared-cookies.ts";
import { themeBootstrap, themeCookie, themeFromCookies } from "../lib/theme.ts";

test("the theme comes from its cookie and nothing else", () => {
  assert.equal(themeFromCookies("progmasoft_theme=dark"), "dark");
  assert.equal(themeFromCookies("a=1; progmasoft_theme=light; b=2"), "light");
  assert.equal(themeFromCookies("progmasoft_theme=blue"), undefined);
  assert.equal(themeFromCookies("my_progmasoft_theme=dark"), undefined);
  assert.equal(themeFromCookies(""), undefined);
});

test("the theme cookie is shared by the Progmasoft hosts and secure over HTTPS", () => {
  assert.equal(
    themeCookie("dark", "product.progmasoft.com", true),
    "progmasoft_theme=dark; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.progmasoft.com; Secure",
  );
  assert.equal(
    themeCookie("light", "progmasoft.com", false),
    "progmasoft_theme=light; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.progmasoft.com",
  );
  assert.equal(
    themeCookie("light", "localhost", false),
    "progmasoft_theme=light; Path=/; Max-Age=31536000; SameSite=Lax",
  );
  assert.equal(
    themeCookie("dark", "notprogmasoft.com", true),
    "progmasoft_theme=dark; Path=/; Max-Age=31536000; SameSite=Lax; Secure",
  );
});

/** Runs the bootstrap in a page with the given cookie, localStorage and address. */
function boot({
  cookie = "",
  stored = null,
  host = "account.progmasoft.com",
  protocol = "https:",
}) {
  const written = [];
  const root = { dataset: {}, style: {} };
  const document = {
    documentElement: root,
    get cookie() {
      return cookie;
    },
    set cookie(value) {
      written.push(value);
    },
  };
  const localStorage = {
    getItem: (name) => (name === "progmasoft_theme" ? stored : null),
  };
  vm.runInNewContext(themeBootstrap, {
    document,
    localStorage,
    location: { hostname: host, protocol },
  });
  return { theme: root.dataset.theme, scheme: root.style.colorScheme, written };
}

test("the page starts in the theme of the cookie", () => {
  assert.deepEqual(boot({ cookie: "x=1; progmasoft_theme=dark" }), {
    theme: "dark",
    scheme: "dark",
    written: [],
  });
});

test("a choice of an earlier version moves from localStorage into the shared cookie", () => {
  const result = boot({ stored: "dark" });
  assert.equal(result.theme, "dark");
  assert.deepEqual(result.written, [
    themeCookie("dark", "account.progmasoft.com", true),
  ]);
  assert.deepEqual(
    boot({ stored: "light", host: "localhost", protocol: "http:" }).written,
    [themeCookie("light", "localhost", false)],
  );
});

test("the cookie wins over localStorage, and light is the default", () => {
  assert.equal(
    boot({ cookie: "progmasoft_theme=light", stored: "dark" }).theme,
    "light",
  );
  assert.equal(boot({}).theme, "light");
  assert.equal(boot({ stored: "blue" }).theme, "light");
});

test("a host cookie that shadows a shared one is expired", () => {
  assert.deepEqual(
    expireShadowingCookies(
      "progmasoft_locale=en-US; progmasoft_locale=de-DE",
      true,
    ),
    ["progmasoft_locale=; Path=/; Max-Age=0; SameSite=Lax; Secure"],
  );
  assert.deepEqual(
    expireShadowingCookies(
      "progmasoft_theme=light; a=1; progmasoft_theme=dark",
      false,
    ),
    ["progmasoft_theme=; Path=/; Max-Age=0; SameSite=Lax"],
  );
  assert.deepEqual(
    expireShadowingCookies(
      "progmasoft_locale=de-DE; progmasoft_theme=dark",
      true,
    ),
    [],
  );
  assert.deepEqual(expireShadowingCookies("", true), []);
});
