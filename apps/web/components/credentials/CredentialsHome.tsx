// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useState } from "react";
import { callOAuthApi, type SessionView } from "@/lib/credentials";
import { format, getCredentialsMessages } from "@/lib/credentials-messages";
import type { Locale } from "@/lib/localization";

type HomeState =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "signedIn"; accountName: string };

/** The home page of credentials.progmasoft.com: where to go, signed in or not. */
export function CredentialsHome({
  locale,
  consoleOrigin,
}: {
  locale: Locale;
  consoleOrigin: string;
}) {
  const { home, common } = getCredentialsMessages(locale);
  const [state, setState] = useState<HomeState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void callOAuthApi<SessionView>("/session", {
      signal: controller.signal,
    }).then((result) => {
      setState(
        result.kind === "ok"
          ? { kind: "signedIn", accountName: result.value.accountName }
          : { kind: "signedOut" },
      );
    });
    return () => controller.abort();
  }, []);

  async function signOut() {
    await callOAuthApi("/signout", { method: "POST" });
    setState({ kind: "signedOut" });
  }

  return (
    <>
      <div className="credentials-panel">
        {state.kind === "loading" && (
          <p className="credentials-note">{common.loading}</p>
        )}
        {state.kind === "signedOut" && (
          <>
            <p>{home.signedOut}</p>
            <div className="credentials-actions">
              <a className="button" href="/signin">
                {common.signIn}
              </a>
            </div>
          </>
        )}
        {state.kind === "signedIn" && (
          <>
            <p>{format(common.signedInAs, { name: state.accountName })}</p>
            <ul className="credentials-list">
              <li>
                <a href={`${consoleOrigin}/credentials`}>{common.developers}</a>
                <span className="credentials-meta">{home.developersText}</span>
              </li>
              <li>
                <a href="/account/applications">{common.allowedApplications}</a>
                <span className="credentials-meta">{home.allowedText}</span>
              </li>
            </ul>
            <div className="credentials-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={signOut}
              >
                {common.signOut}
              </button>
            </div>
          </>
        )}
      </div>
      <p className="credentials-note credentials-footnote">
        {home.discovery}:{" "}
        <a href="/.well-known/openid-configuration">
          /.well-known/openid-configuration
        </a>
      </p>
    </>
  );
}
