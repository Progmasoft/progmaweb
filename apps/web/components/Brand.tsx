// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Route } from "next";
import Link from "next/link";

interface BrandProps {
  account?: boolean;
  accountLabel?: string;
  /** Where the mark leads; by default the account site or the organization site. */
  home?: Route;
}

export function Brand({
  account = false,
  accountLabel = "Account",
  home,
}: BrandProps) {
  return (
    <Link
      className="brand"
      href={
        home ??
        (account
          ? "https://account.progmasoft.com/"
          : "https://progmasoft.com/")
      }
    >
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-tile brand-tile-slate" />
        <span className="brand-tile brand-tile-teal" />
        <span className="brand-tile brand-tile-violet" />
        <span className="brand-tile brand-tile-orange" />
      </span>
      <strong className="brand-name">Progmasoft</strong>
      {account && <span className="brand-product">{accountLabel}</span>}
    </Link>
  );
}
