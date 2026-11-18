// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect, useSyncExternalStore, useTransition } from "react";
import { selectLocale } from "@/lib/locale.actions";
import {
  isLocale,
  localeNames,
  supportedLocales,
  type Locale,
} from "@/lib/localization";
import {
  themeCookie,
  themeCookieName,
  themeFromCookies,
  type Theme,
} from "@/lib/theme";

interface PreferenceControlsProps {
  locale: Locale;
  labels: {
    dark: string;
    language: string;
    light: string;
    theme: string;
  };
}

const themeEvent = "progmasoft-theme-change";

function readTheme(): Theme {
  return themeFromCookies(document.cookie) ?? "light";
}

/**
 * Applies a theme to the document at once, in the click that chose it.
 *
 * Transitions are switched off for the two frames of the change: otherwise
 * every button and link would animate its colours while the page around it
 * has already changed, which looks like flicker.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() =>
      root.classList.remove("theme-switching"),
    ),
  );
}

/**
 * The theme can change while the page stays open: in this tab, or on another
 * host of Progmasoft, which shares the cookie. The page reads it again when it
 * is shown or comes back into view.
 */
function subscribeTheme(onStoreChange: () => void) {
  const onVisible = () => {
    if (document.visibilityState === "visible") onStoreChange();
  };
  window.addEventListener(themeEvent, onStoreChange);
  window.addEventListener("pageshow", onStoreChange);
  window.addEventListener("focus", onStoreChange);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.removeEventListener(themeEvent, onStoreChange);
    window.removeEventListener("pageshow", onStoreChange);
    window.removeEventListener("focus", onStoreChange);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

export function PreferenceControls({
  locale,
  labels,
}: PreferenceControlsProps) {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    readTheme,
    () => "light",
  );
  const [switchingLocale, startLocaleSwitch] = useTransition();

  // Another tab, or another control on this page, changed the theme.
  useEffect(() => {
    if (document.documentElement.dataset.theme !== theme) {
      applyTheme(theme);
    }
  }, [theme]);

  function toggleTheme() {
    const selected: Theme = theme === "light" ? "dark" : "light";
    applyTheme(selected);
    document.cookie = themeCookie(
      selected,
      window.location.hostname,
      window.location.protocol === "https:",
    );
    // The choice lives in the cookie; an old per-host copy would only mislead.
    try {
      window.localStorage.removeItem(themeCookieName);
    } catch {
      // Storage may be unavailable; the cookie holds the choice.
    }
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
