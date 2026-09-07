// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/localization";

interface PreferenceControlsProps {
  locale: Locale;
  labels: {
    dark: string;
    language: string;
    light: string;
    theme: string;
  };
}

type Theme = "light" | "dark";

const themeEvent = "progmasoft-theme-change";

function readTheme(): Theme {
  return window.localStorage.getItem("progmasoft_theme") === "dark"
    ? "dark"
    : "light";
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(themeEvent, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(themeEvent, onStoreChange);
  };
}

export function PreferenceControls({
  locale,
  labels,
}: PreferenceControlsProps) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function toggleTheme() {
    const selected: Theme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem("progmasoft_theme", selected);
    window.dispatchEvent(new Event(themeEvent));
  }

  function toggleLocale() {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale === "en-US" ? "de-DE" : "en-US");
    window.location.assign(url);
  }

  return (
    <div className="preference-controls">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={labels.theme}
        title={labels.theme}
      >
        <span aria-hidden="true">{theme === "light" ? "◐" : "◑"}</span>
        <span>{theme === "light" ? labels.dark : labels.light}</span>
      </button>
      <button
        type="button"
        onClick={toggleLocale}
        aria-label={labels.language}
        title={labels.language}
      >
        {locale === "en-US" ? "DE" : "EN"}
      </button>
    </div>
  );
}
