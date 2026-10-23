// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { ApplicationCredentials } from "@/lib/credentials";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import type { Locale } from "@/lib/localization";

/** The client identifier and, this once, the client secret of an application. */
export function CredentialsCard({
  locale,
  title,
  credentials,
}: {
  locale: Locale;
  title: string;
  credentials: ApplicationCredentials;
}) {
  const { details, kinds } = getCredentialsMessages(locale);
  const { application, clientSecret } = credentials;
  return (
    <div className="credentials-panel">
      <h2>{title}</h2>
      <p>
        <strong>{application.displayName}</strong>{" "}
        <span className="credentials-note">
          {kinds[application.kind].title}
        </span>
      </p>
      <div className="field-group">
        <label>{details.clientId}</label>
        <code className="credentials-code credentials-secret">
          {application.clientId}
        </code>
      </div>
      {clientSecret ? (
        <div className="field-group">
          <label>{details.clientSecret}</label>
          <code className="credentials-code credentials-secret">
            {clientSecret}
          </code>
          <div className="form-message form-message-error" role="alert">
            {details.copyNow}
          </div>
        </div>
      ) : (
        <p className="credentials-note">{details.noSecret}</p>
      )}
      <div className="credentials-actions">
        <a
          className="button"
          href={`/credentials/${encodeURIComponent(application.clientId)}`}
        >
          {application.displayName}
        </a>
      </div>
    </div>
  );
}
