// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { type FormEvent, useId, useState } from "react";
import { localReturnUrl } from "@/lib/credentials";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import { getMessages, type Locale } from "@/lib/localization";

interface SignInFormProps {
  locale: Locale;
  returnUrl: string;
}

/**
 * Signs in to Progmasoft OAuth. The cookie belongs to the OAuth host only; the
 * account holder then goes back to the authorization request that sent them.
 */
export function SignInForm({ locale, returnUrl }: SignInFormProps) {
  const { signIn, common } = getCredentialsMessages(locale);
  const { auth } = getMessages(locale);
  const formId = useId();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/oauth/signin", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    }).catch(() => null);

    if (response?.ok) {
      // A full navigation, so that /connect/authorize on the API receives the new cookie.
      window.location.assign(localReturnUrl(returnUrl));
      return;
    }

    setPending(false);
    if (response?.status === 401) {
      // One message for every refusal: it does not tell registered addresses apart.
      setMessage(signIn.failed);
    } else {
      setMessage(common.unreachable);
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={submit}
      aria-describedby={message ? `${formId}-message` : undefined}
    >
      <div className="form-heading">
        <h2>{signIn.title}</h2>
      </div>

      {message && (
        <div
          className="form-message form-message-error"
          id={`${formId}-message`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="field-group">
        <label htmlFor={`${formId}-email`}>{signIn.email}</label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          maxLength={254}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor={`${formId}-password`}>{signIn.password}</label>
        <div className="password-field">
          <input
            id={`${formId}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            maxLength={256}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? auth.hide : auth.show}
          </button>
        </div>
      </div>

      <button className="button auth-submit" type="submit" disabled={pending}>
        {pending ? signIn.working : signIn.submit}
      </button>

      <p className="form-switch">
        {signIn.noAccount}{" "}
        <a href="https://account.progmasoft.com/register">
          {signIn.createAccount}
        </a>
      </p>
    </form>
  );
}
