// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useState } from "react";
import { callOAuthApi, type ApplicationList } from "@/lib/credentials";
import { format, getCredentialsMessages } from "@/lib/credentials-messages";
import { AccountSignInNotice } from "./AccountSignInNotice";
import type { Locale } from "@/lib/localization";

type ListState =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "failed" }
  | { kind: "ready"; list: ApplicationList };

/** The OAuth 2.1 tokens of the signed-in account, with the New token button. */
export function TokenList({ locale }: { locale: Locale }) {
  const messages = getCredentialsMessages(locale);
  const { portal, common, kinds, details } = messages;
  const [state, setState] = useState<ListState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    void callOAuthApi<ApplicationList>("/applications", {
      signal: controller.signal,
    }).then((result) => {
      if (result.kind === "signedOut") {
        setState({ kind: "signedOut" });
      } else if (result.kind === "ok") {
        setState({ kind: "ready", list: result.value });
      } else {
        setState({ kind: "failed" });
      }
    });
    return () => controller.abort();
  }, []);

  if (state.kind === "loading") {
    return <p className="credentials-note">{common.loading}</p>;
  }
  if (state.kind === "signedOut") {
    return <AccountSignInNotice locale={locale} />;
  }
  if (state.kind === "failed") {
    return (
      <div className="form-message form-message-error" role="alert">
        {common.unreachable}
      </div>
    );
  }

  const { applications, maximum } = state.list;
  return (
    <>
      <div className="credentials-panel">
        <div className="credentials-actions">
          {applications.length < maximum ? (
            <a className="button" href="/credentials/new">
              {portal.newToken}
            </a>
          ) : (
            <p className="credentials-note">
              {format(portal.limit, { count: maximum })}
            </p>
          )}
        </div>
        {applications.length === 0 ? (
          <p>{portal.empty}</p>
        ) : (
          <ul className="credentials-list">
            {applications.map((application) => (
              <li key={application.clientId}>
                <a
                  href={`/credentials/${encodeURIComponent(application.clientId)}`}
                >
                  {application.displayName}
                </a>
                <span className="credentials-meta">
                  <span>{kinds[application.kind].title}</span>
                  <code className="credentials-code">
                    {application.clientId}
                  </code>
                  <span>
                    {format(details.created, {
                      date: new Date(application.createdAt).toLocaleDateString(
                        locale,
                      ),
                    })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="credentials-note credentials-footnote">
        {portal.endpoints}{" "}
        <a href="/.well-known/openid-configuration">
          /.well-known/openid-configuration
        </a>
      </p>
    </>
  );
}
