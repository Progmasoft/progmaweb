// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useState } from "react";
import {
  callOAuthApi,
  type ApplicationCredentials,
  type ApplicationView,
} from "@/lib/credentials";
import { format, getCredentialsMessages } from "@/lib/credentials-messages";
import type { Locale } from "@/lib/localization";
import { AccountSignInNotice } from "./AccountSignInNotice";
import { ApplicationForm } from "./ApplicationForm";
import { CredentialsCard } from "./CredentialsCard";

type DetailsState =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "notFound" }
  | { kind: "failed" }
  | { kind: "ready"; application: ApplicationView };

/** One application of the signed-in account: its settings, its secret and its deletion. */
export function ApplicationDetails({
  locale,
  clientId,
}: {
  locale: Locale;
  clientId: string;
}) {
  const { common, details, form, kinds } = getCredentialsMessages(locale);
  const [state, setState] = useState<DetailsState>({ kind: "loading" });
  const [saved, setSaved] = useState(false);
  const [secret, setSecret] = useState<ApplicationCredentials | null>(null);
  const path = `/applications/${encodeURIComponent(clientId)}`;

  useEffect(() => {
    const controller = new AbortController();
    void callOAuthApi<ApplicationView>(
      `/applications/${encodeURIComponent(clientId)}`,
      { signal: controller.signal },
    ).then((result) => {
      if (result.kind === "signedOut") {
        setState({ kind: "signedOut" });
      } else if (result.kind === "ok") {
        setState({ kind: "ready", application: result.value });
      } else {
        setState({ kind: result.kind === "notFound" ? "notFound" : "failed" });
      }
    });
    return () => controller.abort();
  }, [clientId]);

  if (state.kind === "loading") {
    return <p className="credentials-note">{common.loading}</p>;
  }
  if (state.kind === "signedOut") {
    return <AccountSignInNotice locale={locale} />;
  }
  if (state.kind !== "ready") {
    return (
      <div className="credentials-panel">
        <p>
          {state.kind === "notFound" ? common.notFound : common.unreachable}
        </p>
        <div className="credentials-actions">
          <a className="button button-secondary" href="/credentials">
            {common.back}
          </a>
        </div>
      </div>
    );
  }

  const { application } = state;

  async function rotate() {
    const result = await callOAuthApi<ApplicationCredentials>(
      `${path}/secret`,
      { method: "POST" },
    );
    if (result.kind === "ok") {
      setSecret(result.value);
    } else if (result.kind === "signedOut") {
      setState({ kind: "signedOut" });
    }
  }

  async function remove() {
    if (!window.confirm(details.confirmDelete)) {
      return;
    }
    const result = await callOAuthApi(path, { method: "DELETE" });
    if (result.kind === "ok" || result.kind === "notFound") {
      window.location.replace("/credentials");
    } else if (result.kind === "signedOut") {
      setState({ kind: "signedOut" });
    }
  }

  return (
    <>
      <div className="credentials-panel">
        <p className="credentials-meta">
          <span>{kinds[application.kind].title}</span>
          <code className="credentials-code">{application.clientId}</code>
          <span>
            {format(details.created, {
              date: new Date(application.createdAt).toLocaleDateString(locale),
            })}
          </span>
        </p>
        {saved && (
          <div className="form-message form-message-success" role="status">
            {form.saved}
          </div>
        )}
      </div>

      <ApplicationForm
        key={application.clientId}
        locale={locale}
        kind={application.kind}
        initial={application}
        submitLabel={form.save}
        onSubmit={async (submission) => {
          setSaved(false);
          const result = await callOAuthApi<ApplicationView>(path, {
            method: "PUT",
            body: submission,
          });
          switch (result.kind) {
            case "ok":
              setState({ kind: "ready", application: result.value });
              setSaved(true);
              return null;
            case "signedOut":
              setState({ kind: "signedOut" });
              return null;
            case "refused":
              return result.errors;
            default:
              return { form: common.unreachable };
          }
        }}
      />

      {secret ? (
        <CredentialsCard
          locale={locale}
          title={details.newSecret}
          credentials={secret}
        />
      ) : (
        <div className="credentials-panel">
          <h2>{details.secretHeading}</h2>
          {application.isPublic ? (
            <p className="credentials-note">{details.noSecret}</p>
          ) : (
            <>
              <p className="credentials-note">{details.rotateNote}</p>
              <div className="credentials-actions">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={rotate}
                >
                  {details.rotate}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="credentials-panel">
        <h2>{details.deleteHeading}</h2>
        <p className="credentials-note">{details.deleteNote}</p>
        <div className="credentials-actions">
          <button
            className="button button-danger"
            type="button"
            onClick={remove}
          >
            {details.delete}
          </button>
        </div>
      </div>
    </>
  );
}
