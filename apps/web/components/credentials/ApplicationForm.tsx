// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { type FormEvent, useId, useState } from "react";
import {
  lines,
  oauthScopes,
  signsPeopleIn,
  type ApplicationKind,
  type ApplicationSubmission,
} from "@/lib/credentials";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import type { Locale } from "@/lib/localization";

export interface ApplicationFormValues {
  displayName: string;
  homepage: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  scopes: string[];
}

interface ApplicationFormProps {
  locale: Locale;
  kind: ApplicationKind;
  initial: ApplicationFormValues;
  submitLabel: string;
  /** Sends the submission; answers the messages of refused fields, or none. */
  onSubmit: (
    submission: ApplicationSubmission,
  ) => Promise<Record<string, string> | null>;
}

/**
 * The settings of an application of one type. A service has neither addresses
 * nor scopes; the other types list the scopes the application may request,
 * which every person still decides on the consent page.
 */
export function ApplicationForm({
  locale,
  kind,
  initial,
  submitLabel,
  onSubmit,
}: ApplicationFormProps) {
  const { form, scopes } = getCredentialsMessages(locale);
  const formId = useId();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const peopleSignIn = signsPeopleIn(kind);
    setPending(true);
    const refused = await onSubmit({
      kind,
      displayName: String(data.get("displayName") ?? ""),
      homepage: String(data.get("homepage") ?? "").trim(),
      redirectUris: peopleSignIn
        ? lines(String(data.get("redirectUris") ?? ""))
        : [],
      postLogoutRedirectUris: peopleSignIn
        ? lines(String(data.get("postLogoutRedirectUris") ?? ""))
        : [],
      scopes: peopleSignIn ? data.getAll("scope").map(String) : [],
    });
    setErrors(refused ?? {});
    setPending(false);
  }

  function fieldError(field: string) {
    return errors[field] ? (
      <p className="field-error" role="alert">
        {errors[field]}
      </p>
    ) : null;
  }

  return (
    <form className="credentials-panel" onSubmit={submit}>
      {errors.form && (
        <div className="form-message form-message-error" role="alert">
          {errors.form}
        </div>
      )}
      {fieldError("kind")}

      <div className="field-group">
        <label htmlFor={`${formId}-name`}>{form.name}</label>
        {fieldError("displayName")}
        <input
          id={`${formId}-name`}
          name="displayName"
          type="text"
          minLength={3}
          maxLength={64}
          defaultValue={initial.displayName}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor={`${formId}-homepage`}>{form.homepage}</label>
        {fieldError("homepage")}
        <input
          id={`${formId}-homepage`}
          name="homepage"
          type="url"
          placeholder="https://"
          defaultValue={initial.homepage}
        />
      </div>

      {signsPeopleIn(kind) ? (
        <>
          <div className="field-group">
            <label htmlFor={`${formId}-redirects`}>{form.redirectUris}</label>
            <small>{form.hints[kind]}</small>
            {fieldError("redirectUris")}
            <textarea
              id={`${formId}-redirects`}
              name="redirectUris"
              defaultValue={initial.redirectUris.join("\n")}
              spellCheck={false}
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor={`${formId}-logout`}>
              {form.postLogoutRedirectUris}
            </label>
            {fieldError("postLogoutRedirectUris")}
            <textarea
              id={`${formId}-logout`}
              name="postLogoutRedirectUris"
              defaultValue={initial.postLogoutRedirectUris.join("\n")}
              spellCheck={false}
            />
          </div>

          <fieldset className="scope-checks">
            <legend>{form.scopes}</legend>
            {fieldError("scopes")}
            {oauthScopes.map((scope) => (
              <label key={scope}>
                <input
                  type="checkbox"
                  name="scope"
                  value={scope}
                  defaultChecked={initial.scopes.includes(scope)}
                />
                <code className="credentials-code">{scope}</code>
                <small>{scopes[scope]}</small>
              </label>
            ))}
            <p className="credentials-note">{form.scopesNote}</p>
          </fieldset>
        </>
      ) : (
        <>
          {fieldError("redirectUris")}
          {fieldError("scopes")}
          <p className="credentials-note">{form.serviceNote}</p>
        </>
      )}

      <div className="credentials-actions">
        <button className="button" type="submit" disabled={pending}>
          {pending ? form.working : submitLabel}
        </button>
      </div>
    </form>
  );
}
