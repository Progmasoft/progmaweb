// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

interface HeaderMenuProps {
  children: ReactNode;
  closeLabel: string;
  label: string;
  menuLabel: string;
}

/**
 * The navigation of a site header.
 *
 * A wide screen shows the links in the header line and never shows the menu
 * button. A phone shows the brand and the menu button; the button opens the
 * links and the preferences as a panel under the header. A link chosen in the
 * panel, the Escape key and a second press of the button close it.
 */
export function HeaderMenu({
  children,
  closeLabel,
  label,
  menuLabel,
}: HeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="header-menu" data-open={open ? "true" : "false"}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={open ? closeLabel : menuLabel}
        className="menu-toggle"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span aria-hidden="true" className="menu-toggle-bars" />
        <span className="menu-toggle-text">{menuLabel}</span>
      </button>
      <nav
        aria-label={label}
        className="primary-nav"
        id={panelId}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {children}
      </nav>
    </div>
  );
}
