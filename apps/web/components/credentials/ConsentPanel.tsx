// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useState } from "react";
import {
  callOAuthApi,
  oauthScopes,
  signInPath,
  type ConsentView,
  type OAuthScope,
} from "@/lib/credentials";
import { format, getCredentialsMessages } from "@/lib/credentials-messages";
import type { Locale } from "@/lib/localization";

type ConsentState =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "failed" }
  | { kind: "ready"; consent: ConsentView };

/**
 * The consent page. `/connect/authorize` sends the account holder here with
 * the parameters of the request; the decision is posted back there as a plain
 * form, so the browser follows the redirection to the application.
 */
export function ConsentPanel({
  locale,
  parameters,
}: {
  locale: Locale;
  parameters: [string, string][];
}) {
  const { consent: text, scopes, common } = getCredentialsMessages(locale);
  const [state, setState] = useState<ConsentState>({ kind: "loading" });
  const query = new URLSearchParams(parameters).toString();

  useEffect(() => {
    const controller = new AbortController();
    void callOAuthApi<ConsentView>(`/consent?${query}`, {
      signal: controller.signal,
    }).then((result) => {
      if (result.kind === "signedOut") {
        window.location.replace(signInPath(`/connect/authorize?${query}`));
      } else if (result.kind === "ok") {
        setState({ kind: "ready", consent: result.value });
      } else {
        setState({ kind: result.kind === "refused" ? "invalid" : "failed" });
      }
    });
    return () => controller.abort();
  }, [query]);

  if (state.kind === "loading") {
    return <p className="auth-form credentials-note">{common.loading}</p>;
  }
  if (state.kind !== "ready") {
    return (
      <div className="auth-form">
        <div className="form-message form-message-error" role="alert">
          {state.kind === "invalid" ? text.invalid : common.unreachable}
        </div>
      </div>
    );
  }

  const { consent } = state;
  const granted = consent.scopes.filter((scope): scope is OAuthScope =>
    oauthScopes.includes(scope as OAuthScope),
  );
  return (
    <form className="auth-form" method="post" action="/connect/authorize">
      {parameters.map(([name, value], index) => (
        <input
          key={`${name}-${index}`}
          type="hidden"
          name={name}
          value={value}
        />
      ))}
      <div className="form-heading">
        <h2>{format(text.title, { name: consent.displayName })}</h2>
        <p>
          {consent.homepage ? (
            <a
              href={consent.homepage}
              rel="noreferrer noopener"
              target="_blank"
            >
              {consent.homepage}
            </a>
          ) : (
            <code className="credentials-code">{consent.clientId}</code>
          )}
          {consent.owner && (
            <> · {format(text.registeredBy, { owner: consent.owner })}</>
          )}
        </p>
      </div>

      <p>{format(text.wants, { name: consent.displayName })}</p>
      <ul className="consent-scopes">
        <li>{scopes.account}</li>
        {granted.map((scope) => (
          <li key={scope}>{scopes[scope]}</li>
        ))}
      </ul>

      <p className="credentials-note">
        {format(text.returnTo, { origin: consent.returnTo })}{" "}
        {format(text.signedInAs, { name: consent.accountName })}{" "}
        {text.withdrawLater}
      </p>

      <div className="credentials-actions">
        <button className="button" type="submit" name="decision" value="allow">
          {text.allow}
        </button>
        <button
          className="button button-secondary"
          type="submit"
          name="decision"
          value="deny"
        >
          {text.deny}
        </button>
      </div>
    </form>
  );
}
