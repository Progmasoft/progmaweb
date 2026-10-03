// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useSyncExternalStore, useTransition } from "react";
import { selectLocale } from "@/lib/locale.actions";
import {
  isLocale,
  localeNames,
  supportedLocales,
  type Locale,
} from "@/lib/localization";

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
  const [switchingLocale, startLocaleSwitch] = useTransition();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function toggleTheme() {
    const selected: Theme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem("progmasoft_theme", selected);
    window.dispatchEvent(new Event(themeEvent));
  }

  // The server stores the preference and re-renders the current route in the
  // selected language, so the page changes in place: nothing is reloaded and
  // scroll position, theme and client state stay as they are.
  function chooseLocale(selected: string) {
    if (!isLocale(selected) || selected === locale) {
      return;
    }
    startLocaleSwitch(async () => {
      try {
        await selectLocale(selected);
      } catch {
        // The request did not reach the server. The query parameter asks the
        // proxy for the same preference with an ordinary navigation.
        const url = new URL(window.location.href);
        url.searchParams.set("lang", selected);
        window.location.assign(url);
      }
    });
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
      <select
        value={locale}
        onChange={(event) => chooseLocale(event.target.value)}
        aria-busy={switchingLocale}
        disabled={switchingLocale}
        aria-label={labels.language}
        title={labels.language}
      >
        {supportedLocales.map((supported) => (
          <option key={supported} value={supported} lang={supported}>
            {localeNames[supported]}
          </option>
        ))}
      </select>
    </div>
  );
}
