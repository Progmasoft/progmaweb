// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect } from "react";

/**
 * Shows the elements marked `data-reveal` as they scroll into view: each
 * rises and fades in once, then stays. Without JavaScript, and for visitors
 * who ask for less motion, everything is simply there.
 */
export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    root.classList.add("pm-motion");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-shown");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      root.classList.remove("pm-motion");
    };
  }, []);
  return null;
}
