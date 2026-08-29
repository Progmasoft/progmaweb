// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/AccountShell";

export const metadata: Metadata = {
  title: "Recover your account",
  description: "Get help regaining access to a Progmasoft account.",
};

export default function RecoverPage() {
  return (
    <AccountShell
      eyebrow="Account support"
      title="Recover your account."
      description="Use the verified support channel when you can no longer sign in."
    >
      <section
        className="auth-form recovery-panel"
        aria-labelledby="recovery-heading"
      >
        <div className="form-heading">
          <p className="eyebrow">Account recovery</p>
          <h2 id="recovery-heading">Regain access safely</h2>
          <p>
            Automated password recovery is not available during the initial
            account-system rollout. Contact Progmasoft support from the email
            address registered to your account so ownership can be verified.
          </p>
        </div>
        <a
          className="button auth-submit"
          href="mailto:support@progmasoft.com?subject=Progmasoft%20account%20recovery"
        >
          Contact support
        </a>
        <p className="form-switch">
          Remembered your password? <Link href="/login">Return to sign in</Link>
        </p>
      </section>
    </AccountShell>
  );
}
