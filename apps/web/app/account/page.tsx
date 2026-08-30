// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Account",
  description: "Access and manage your Progmasoft account.",
};

export default function AccountHomepage() {
  return (
    <>
      <SiteHeader account />
      <main className="account-landing">
        <section className="account-landing-hero">
          <div className="shell account-landing-grid">
            <div>
              <p className="eyebrow">Progmasoft account</p>
              <h1>One clear identity for every supported service.</h1>
              <p>
                Your account keeps profile, authentication, and service access
                under a dedicated security boundary.
              </p>
              <div className="hero-actions">
                <Link className="button" href="/login">
                  Sign in
                </Link>
                <Link className="button button-secondary" href="/register">
                  Create account
                </Link>
              </div>
            </div>
            <div className="identity-card">
              <div className="identity-icon" aria-hidden="true">
                P
              </div>
              <div>
                <span>Account name</span>
                <strong>Your durable public identity and ViGet publisher name</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>Recovery and security notices</strong>
              </div>
              <div>
                <span>Session</span>
                <strong>Secure, revocable browser access</strong>
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="shell feature-grid">
            <article>
              <span>01</span>
              <h2>Deliberate security</h2>
              <p>
                Passwords are hashed server-side and session tokens are stored
                only as digests.
              </p>
            </article>
            <article>
              <span>02</span>
              <h2>Predictable names</h2>
              <p>
                Canonical account names prevent ambiguous URLs and case-only
                impersonation. ViGet uses this exact name as the package
                publisher; it does not create a second identity.
              </p>
            </article>
            <article>
              <span>03</span>
              <h2>Service boundaries</h2>
              <p>
                Products request explicit account access instead of sharing
                hidden application state.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
