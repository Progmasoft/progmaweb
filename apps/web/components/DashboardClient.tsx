// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.0

"use client";

import { useEffect, useState } from "react";

interface AccountSummary {
  accountName: string;
  email: string;
  createdAt: string;
}

interface DashboardClientProps {
  routeAccountName: string;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; account: AccountSummary };

export function DashboardClient({ routeAccountName }: DashboardClientProps) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccount() {
      try {
        const response = await fetch("/api/v1/accounts/me", {
          credentials: "include",
          signal: controller.signal,
        });

        if (response.status === 401) {
          window.location.replace(
            `/login?returnTo=/${encodeURIComponent(routeAccountName)}/dashboard`,
          );
          return;
        }

        if (!response.ok) {
          setState({
            kind: "error",
            message: "The dashboard could not be loaded.",
          });
          return;
        }

        const account = (await response.json()) as AccountSummary;
        if (account.accountName !== routeAccountName) {
          window.location.replace(
            `/${encodeURIComponent(account.accountName)}/dashboard`,
          );
          return;
        }

        setState({ kind: "ready", account });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setState({
            kind: "error",
            message: "The account service is temporarily unreachable.",
          });
        }
      }
    }

    void loadAccount();
    return () => controller.abort();
  }, [routeAccountName]);

  async function signOut() {
    await fetch("/api/v1/accounts/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.replace("/login");
  }

  if (state.kind === "loading") {
    return <div className="dashboard-loading">Loading account…</div>;
  }

  if (state.kind === "error") {
    return <div className="dashboard-error">{state.message}</div>;
  }

  const { account } = state;
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="account-avatar" aria-hidden="true">
          {account.accountName.slice(0, 2).toUpperCase()}
        </div>
        <strong>{account.accountName}</strong>
        <span>{account.email}</span>
        <nav aria-label="Dashboard navigation">
          <a className="active" href="#overview">
            Overview
          </a>
          <a href="#security">Security</a>
          <a href="#services">Services</a>
        </nav>
        <button className="text-button" type="button" onClick={signOut}>
          Sign out
        </button>
      </aside>
      <main className="dashboard-content">
        <header className="dashboard-heading" id="overview">
          <p className="eyebrow">Account overview</p>
          <h1>Welcome, {account.accountName}.</h1>
          <p>Manage the identity used by Progmasoft services.</p>
        </header>
        <div className="dashboard-grid">
          <section className="dashboard-card">
            <span className="card-kicker">Profile</span>
            <h2>Account identity</h2>
            <dl className="detail-list">
              <div>
                <dt>Account name</dt>
                <dd>{account.accountName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{account.email}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(account.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </section>
          <section className="dashboard-card" id="security">
            <span className="card-kicker">Security</span>
            <h2>Password and sessions</h2>
            <p>
              Your browser uses an HttpOnly secure session cookie. Session
              secrets are never stored as plaintext.
            </p>
            <button className="button button-secondary" type="button">
              Change password
            </button>
          </section>
          <section className="dashboard-card dashboard-card-wide" id="services">
            <span className="card-kicker">Services</span>
            <h2>Connected Progmasoft products</h2>
            <div className="service-row">
              <div>
                <strong>ViGet Package Registry</strong>
                <span>Package and DSL-plugin identity</span>
              </div>
              <span className="status-badge status-planned">Planned</span>
            </div>
            <div className="service-row">
              <div>
                <strong>Visual X#</strong>
                <span>Developer ecosystem profile</span>
              </div>
              <span className="status-badge status-planned">Planned</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
