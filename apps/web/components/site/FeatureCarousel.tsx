// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Flow, type FlowColours } from "./Flow";

/** One product of the feature, its words already chosen for the language. */
export interface FeatureItem {
  slug: string;
  name: string;
  line: string;
  colours: FlowColours;
  more: { label: string; href: string };
  action: { label: string; href: string };
}

interface FeatureCarouselProps {
  items: FeatureItem[];
  label: string;
  pause: string;
  play: string;
}

const interval = 7000;
const stillQuery = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(stillQuery);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function prefersStill() {
  return window.matchMedia(stillQuery).matches;
}

/**
 * The large card under the opening: every product in turn over a moving
 * field in its own colours. It moves on every few seconds; the names at the
 * bottom choose one, and the button stops both the turning and the field.
 */
export function FeatureCarousel({
  items,
  label,
  pause,
  play,
}: FeatureCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const still = useSyncExternalStore(
    subscribeMotion,
    prefersStill,
    () => false,
  );
  const turning = !paused && !still;

  useEffect(() => {
    if (!turning) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrent((index) => (index + 1) % items.length);
    }, interval);
    return () => {
      window.clearTimeout(timer);
    };
  }, [current, turning, items.length]);

  const item = items.at(current);
  if (!item) {
    return null;
  }

  return (
    <div
      className="pm-feature"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <Flow
        colours={item.colours}
        seed={2.4}
        speed={1.6}
        paused={paused}
        className="pm-feature-field"
      />
      <div
        className="pm-feature-copy"
        key={item.slug}
        aria-live={turning ? "off" : "polite"}
      >
        <h2 className="pm-serif">{item.name}</h2>
        <p className="pm-feature-line">{item.line}</p>
        <p className="pm-pills">
          <a className="pm-pill pm-pill-light" href={item.more.href}>
            {item.more.label}
          </a>
          <a className="pm-pill pm-pill-dark" href={item.action.href}>
            {item.action.label}
          </a>
        </p>
      </div>
      <div className="pm-feature-bar">
        <ul className="pm-feature-names">
          {items.map((entry, index) => (
            <li key={entry.slug}>
              <button
                type="button"
                aria-current={index === current ? "true" : undefined}
                onClick={() => {
                  setCurrent(index);
                  setPaused(true);
                }}
              >
                {entry.name}
                {index === current && turning ? (
                  <span className="pm-feature-timer" aria-hidden="true" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="pm-flow-toggle"
          aria-label={paused ? play : pause}
          onClick={() => {
            setPaused(!paused);
          }}
        >
          {paused ? "▶" : "❚❚"}
        </button>
      </div>
    </div>
  );
}
