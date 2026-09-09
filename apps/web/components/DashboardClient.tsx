// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useState } from "react";
import { getMessages, type Locale } from "@/lib/localization";
import { PreferenceControls } from "./PreferenceControls";

interface AccountSummary {
  accountName: string;
  email: string;
  createdAt: string;
}

interface DashboardClientProps {
  locale: Locale;
  routeAccountName: string;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; account: AccountSummary };

export function DashboardClient({
  locale,
  routeAccountName,
}: DashboardClientProps) {
  const { dashboard, navigation } = getMessages(locale);
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
            message: dashboard.loadFailed,
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
            message: dashboard.unreachable,
          });
        }
      }
    }

    void loadAccount();
    return () => controller.abort();
  }, [dashboard.loadFailed, dashboard.unreachable, routeAccountName]);

  async function signOut() {
    await fetch("/api/v1/accounts/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.replace("/login");
  }

  if (state.kind === "loading") {
    return (
      <div className="dashboard-state dashboard-loading">
        <div className="dashboard-state-preferences">
          <PreferenceControls locale={locale} labels={navigation} />
        </div>
        <p>{dashboard.loading}</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="dashboard-state dashboard-error">
        <div className="dashboard-state-preferences">
          <PreferenceControls locale={locale} labels={navigation} />
        </div>
        <p role="alert">{state.message}</p>
      </div>
    );
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
        <nav aria-label={dashboard.navigation}>
          <a className="active" href="#overview">
            {dashboard.overview}
          </a>
          <a href="#security">{dashboard.security}</a>
          <a href="#services">{dashboard.services}</a>
        </nav>
        <div className="dashboard-sidebar-preferences">
          <PreferenceControls locale={locale} labels={navigation} />
        </div>
        <button className="text-button" type="button" onClick={signOut}>
          {dashboard.signOut}
        </button>
      </aside>
      <main className="dashboard-content">
        <header className="dashboard-heading" id="overview">
          <p className="eyebrow">{dashboard.eyebrow}</p>
          <h1>
            {dashboard.welcome}, {account.accountName}.
          </h1>
          <p>{dashboard.description}</p>
        </header>
        <div className="dashboard-grid">
          <section className="dashboard-card">
            <span className="card-kicker">{dashboard.profile}</span>
            <h2>{dashboard.identity}</h2>
            <dl className="detail-list">
              <div>
                <dt>{dashboard.accountName}</dt>
                <dd>{account.accountName}</dd>
              </div>
              <div>
                <dt>{dashboard.publisherName}</dt>
                <dd>{account.accountName}</dd>
              </div>
              <div>
                <dt>{dashboard.email}</dt>
                <dd>{account.email}</dd>
              </div>
              <div>
                <dt>{dashboard.created}</dt>
                <dd>
                  {new Date(account.createdAt).toLocaleDateString(locale)}
                </dd>
              </div>
            </dl>
          </section>
          <section className="dashboard-card" id="security">
            <span className="card-kicker">{dashboard.security}</span>
            <h2>{dashboard.passwordSessions}</h2>
            <p>{dashboard.securityDescription}</p>
            <button className="button button-secondary" type="button">
              {dashboard.changePassword}
            </button>
          </section>
          <section className="dashboard-card dashboard-card-wide" id="services">
            <span className="card-kicker">{dashboard.services}</span>
            <h2>{dashboard.products}</h2>
            <div className="service-row">
              <div>
                <strong>ViGet Package Registry</strong>
                <span>
                  {dashboard.publisherPrefix}: {account.accountName} (
                  {dashboard.sameAccount})
                </span>
              </div>
              <span className="status-badge status-planned">
                {dashboard.planned}
              </span>
            </div>
            <div className="service-row">
              <div>
                <strong>Visual X#</strong>
                <span>{dashboard.profileDescription}</span>
              </div>
              <span className="status-badge status-planned">
                {dashboard.planned}
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
