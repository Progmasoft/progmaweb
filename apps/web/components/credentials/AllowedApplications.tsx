// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useState } from "react";
import {
  callOAuthApi,
  signInPath,
  type AllowedApplication,
} from "@/lib/credentials";
import { format, getCredentialsMessages } from "@/lib/credentials-messages";
import type { Locale } from "@/lib/localization";

type AllowedState =
  | { kind: "loading" }
  | { kind: "failed" }
  | { kind: "ready"; allowed: AllowedApplication[] };

/** The applications the signed-in account has allowed, each with a Withdraw button. */
export function AllowedApplications({ locale }: { locale: Locale }) {
  const { allowed: text, common } = getCredentialsMessages(locale);
  const [state, setState] = useState<AllowedState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void callOAuthApi<AllowedApplication[]>("/allowed", {
      signal: controller.signal,
    }).then((result) => {
      if (result.kind === "signedOut") {
        window.location.replace(signInPath("/account/applications"));
      } else if (result.kind === "ok") {
        setState({ kind: "ready", allowed: result.value });
      } else {
        setState({ kind: "failed" });
      }
    });
    return () => controller.abort();
  }, []);

  async function withdraw(authorizationId: string) {
    const result = await callOAuthApi(
      `/allowed/${encodeURIComponent(authorizationId)}`,
      { method: "DELETE" },
    );
    if (result.kind === "ok" || result.kind === "notFound") {
      setState((current) =>
        current.kind === "ready"
          ? {
              kind: "ready",
              allowed: current.allowed.filter(
                (entry) => entry.authorizationId !== authorizationId,
              ),
            }
          : current,
      );
    } else if (result.kind === "signedOut") {
      window.location.assign(signInPath("/account/applications"));
    }
  }

  if (state.kind === "loading") {
    return <p className="credentials-note">{common.loading}</p>;
  }
  if (state.kind === "failed") {
    return (
      <div className="form-message form-message-error" role="alert">
        {common.unreachable}
      </div>
    );
  }

  return (
    <div className="credentials-panel">
      {state.allowed.length === 0 ? (
        <p>{text.empty}</p>
      ) : (
        <ul className="credentials-list">
          {state.allowed.map((entry) => (
            <li key={entry.authorizationId}>
              <div>
                <strong>{entry.displayName ?? text.deleted}</strong>
                <span className="credentials-meta">
                  {entry.createdAt && (
                    <span>
                      {format(text.since, {
                        date: new Date(entry.createdAt).toLocaleDateString(
                          locale,
                        ),
                      })}
                    </span>
                  )}
                  {entry.scopes.map((scope) => (
                    <code className="credentials-code" key={scope}>
                      {scope}
                    </code>
                  ))}
                </span>
              </div>
              <button
                className="button button-secondary button-small"
                type="button"
                onClick={() => withdraw(entry.authorizationId)}
              >
                {text.withdraw}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
