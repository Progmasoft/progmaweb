// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { getCredentialsMessages } from "@/lib/credentials-messages";
import type { Locale } from "@/lib/localization";

/**
 * The sign-in page of the Progmasoft account site. The console has no sign-in
 * of its own and never redirects: it shows this link instead. On a development
 * host (console.localhost:3010) the account site is account.localhost.
 */
function accountSignInUrl(): string {
  const { protocol, hostname, port } = window.location;
  return hostname.endsWith(".localhost")
    ? `${protocol}//account.localhost${port ? `:${port}` : ""}/login`
    : "https://account.progmasoft.com/login";
}

/** Shown by a console page whose visitor has no Progmasoft account session. */
export function AccountSignInNotice({ locale }: { locale: Locale }) {
  const { common } = getCredentialsMessages(locale);
  return (
    <div className="credentials-panel">
      <p>{common.signInRequired}</p>
      <div className="credentials-actions">
        <a className="button" href={accountSignInUrl()}>
          {common.signInAccount}
        </a>
      </div>
    </div>
  );
}
