// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

// Light is the default of every Progmasoft site; dark is a choice the visitor keeps.
try {
  if (localStorage.getItem("progmasoft_theme") === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
} catch {
  // Storage can be blocked; the page stays light.
}
