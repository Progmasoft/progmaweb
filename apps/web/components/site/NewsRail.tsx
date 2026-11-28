// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface NewsRailProps {
  /** The name of the rail for assistive technology, such as "Latest news". */
  label: string;
  /** The labels of the two buttons. */
  previous: string;
  next: string;
  children: ReactNode;
}

/**
 * A row of article cards that scrolls sideways: by swiping or with a wheel or a
 * trackpad, card by card, and with two buttons that move one card at a time
 * and turn off at either end; when every card fits, there are no buttons.
 * Without script the row still scrolls.
 */
export function NewsRail({ label, previous, next, children }: NewsRailProps) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const element = track.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    // The direction of a right-to-left page makes scrollLeft negative.
    const position = Math.abs(element.scrollLeft);
    setAtStart(position <= 2);
    setAtEnd(position >= max - 2);
  }, []);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    measure();
    element.addEventListener("scroll", measure, { passive: true });
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    return () => {
      element.removeEventListener("scroll", measure);
      resize.disconnect();
    };
  }, [measure]);

  const move = (direction: 1 | -1) => {
    const element = track.current;
    // One step is the width of a card and the gap after it.
    const width = (element?.firstElementChild as HTMLElement | null)
      ?.offsetWidth;
    if (!element || width === undefined) return;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    const rtl = getComputedStyle(element).direction === "rtl" ? -1 : 1;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element.scrollBy({
      left: direction * rtl * (width + gap),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <div className="pm-news-rail">
      <div className="pm-news-rail-head">
        <h2 className="pm-serif">{label}</h2>
        {atStart && atEnd ? null : (
          <div className="pm-news-rail-buttons">
            <button
              type="button"
              aria-label={previous}
              disabled={atStart}
              onClick={() => {
                move(-1);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={next}
              disabled={atEnd}
              onClick={() => {
                move(1);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <ul className="pm-news-rail-track" ref={track} aria-label={label}>
        {children}
      </ul>
    </div>
  );
}
