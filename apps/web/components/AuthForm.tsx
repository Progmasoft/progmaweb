"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

interface ProblemDetails {
  detail?: string;
  errors?: Record<string, string[]>;
  title?: string;
}

function firstProblemMessage(problem: ProblemDetails): string {
  if (problem.detail) {
    return problem.detail;
  }

  const firstError = problem.errors
    ? Object.values(problem.errors).flat()[0]
    : undefined;
  return firstError ?? problem.title ?? "The request could not be completed.";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const formId = useId();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

    if (
      mode === "register" &&
      password !== String(form.get("confirmPassword") ?? "")
    ) {
      setMessage("The password confirmation does not match.");
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
        setMessage(firstProblemMessage(result));
        return;
      }

      const accountName = result.accountName;
      if (!accountName) {
        setMessage("The server did not return an account name.");
        return;
      }

      router.push(`/${encodeURIComponent(accountName)}/dashboard`);
      router.refresh();
    } catch {
      setMessage(
        "The account service is temporarily unreachable. Try again shortly.",
      );
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
        <h2>{mode === "register" ? "Create your account" : "Welcome back"}</h2>
        <p>
          {mode === "register"
            ? "Use one Progmasoft identity across supported services."
            : "Sign in with the email address attached to your Progmasoft account."}
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
          <label htmlFor={`${formId}-account-name`}>Account name</label>
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
          <small>
            Use 8–128 ASCII letters or digits and begin with an uppercase
            letter.
          </small>
        </div>
      )}

      <div className="field-group">
        <label htmlFor={`${formId}-email`}>Email address</label>
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
          <label htmlFor={`${formId}-password`}>Password</label>
          {mode === "login" && <Link href="/recover">Forgot password?</Link>}
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
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {mode === "register" && (
          <small>
            Use at least 12 characters. Long passphrases are supported.
          </small>
        )}
      </div>

      {mode === "register" && (
        <div className="field-group">
          <label htmlFor={`${formId}-confirm-password`}>Confirm password</label>
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
          ? "Working…"
          : mode === "register"
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="form-switch">
        {mode === "register"
          ? "Already have an account?"
          : "New to Progmasoft?"}{" "}
        <Link href={mode === "register" ? "/login" : "/register"}>
          {mode === "register" ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
