// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type MouseEvent, useId, useState } from "react";
import { getMessages, type Locale } from "@/lib/localization";

type AuthMode = "login" | "register";

interface AuthFormProps {
  initialMessage?: string;
  locale: Locale;
  mode: AuthMode;
}

interface ProblemDetails {
  detail?: string;
  errors?: Record<string, string[]>;
  title?: string;
}

function firstProblemMessage(
  problem: ProblemDetails,
  fallback: string,
): string {
  if (problem.detail) {
    return problem.detail;
  }

  const firstError = problem.errors
    ? Object.values(problem.errors).flat()[0]
    : undefined;
  return firstError ?? problem.title ?? fallback;
}

export function AuthForm({ initialMessage, locale, mode }: AuthFormProps) {
  const { auth } = getMessages(locale);
  const router = useRouter();
  const formId = useId();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(initialMessage ?? null);
  const [showPassword, setShowPassword] = useState(false);

  function continueWithGoogle(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    const parameters = new URLSearchParams();

    if (mode === "register") {
      const accountName = form?.elements.namedItem("accountName");
      if (!(accountName instanceof HTMLInputElement)) {
        setMessage(auth.unreadableName);
        return;
      }
      if (!accountName.checkValidity()) {
        accountName.reportValidity();
        return;
      }
      parameters.set("accountName", accountName.value);
    }

    const query = parameters.size === 0 ? "" : `?${parameters.toString()}`;
    window.open(`/api/v1/accounts/oauth/google/start${query}`, "_self");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

    if (
      mode === "register" &&
      password !== String(form.get("confirmPassword") ?? "")
    ) {
      setMessage(auth.mismatch);
      return;
    }

    const body =
      mode === "register"
        ? {
            accountName: String(form.get("accountName") ?? ""),
            email: String(form.get("email") ?? ""),
            password,
          }
        : {
            email: String(form.get("email") ?? ""),
            password,
          };

    setPending(true);

    try {
      const response = await fetch(`/api/v1/accounts/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = (await response
        .json()
        .catch(() => ({}))) as ProblemDetails & { accountName?: string };

      if (!response.ok) {
        setMessage(firstProblemMessage(result, auth.requestFailed));
        return;
      }

      const accountName = result.accountName;
      if (!accountName) {
        setMessage(auth.missingName);
        return;
      }

      router.push(`/${encodeURIComponent(accountName)}/dashboard`);
      router.refresh();
    } catch {
      setMessage(auth.unreachable);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={submit}
      aria-describedby={message ? `${formId}-message` : undefined}
    >
      <div className="form-heading">
        <h2>{mode === "register" ? auth.createHeading : auth.loginHeading}</h2>
        <p>
          {mode === "register" ? auth.createDescription : auth.loginDescription}
        </p>
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

      {mode === "register" && (
        <div className="field-group">
          <label htmlFor={`${formId}-account-name`}>{auth.accountName}</label>
          <input
            id={`${formId}-account-name`}
            name="accountName"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            minLength={8}
            maxLength={128}
            pattern="[A-Z][A-Za-z0-9]{7,127}"
            placeholder="MyAccount"
            required
          />
          <small>{auth.accountHint}</small>
        </div>
      )}

      <div className="field-group">
        <label htmlFor={`${formId}-email`}>{auth.email}</label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="name@example.com"
          maxLength={254}
          required
        />
      </div>

      <div className="field-group">
        <div className="field-label-row">
          <label htmlFor={`${formId}-password`}>{auth.password}</label>
          {mode === "login" && (
            <Link href="/recover">{auth.forgotPassword}</Link>
          )}
        </div>
        <div className="password-field">
          <input
            id={`${formId}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            minLength={12}
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
        {mode === "register" && <small>{auth.passwordHint}</small>}
      </div>

      {mode === "register" && (
        <div className="field-group">
          <label htmlFor={`${formId}-confirm-password`}>
            {auth.confirmPassword}
          </label>
          <input
            id={`${formId}-confirm-password`}
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={12}
            maxLength={256}
            required
          />
        </div>
      )}

      <button className="button auth-submit" type="submit" disabled={pending}>
        {pending
          ? auth.working
          : mode === "register"
            ? auth.create
            : auth.signIn}
      </button>

      <div className="auth-divider" aria-hidden="true">
        <span>{auth.or}</span>
      </div>
      <button
        className="button google-auth-button"
        type="button"
        disabled={pending}
        onClick={continueWithGoogle}
      >
        {auth.google}
      </button>

      <p className="form-switch">
        {mode === "register" ? auth.already : auth.newUser}{" "}
        <Link href={mode === "register" ? "/login" : "/register"}>
          {mode === "register" ? auth.signIn : auth.createLink}
        </Link>
      </p>
    </form>
  );
}
