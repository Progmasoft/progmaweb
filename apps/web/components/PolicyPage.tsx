// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import {
  type PolicyKind,
  type PolicyMessages,
  type PolicyText,
  type PolicyVersion,
  policyAfter,
  policyInEffect,
  policyUrls,
  policyVersionWords,
} from "@/lib/policies";
import { getPolicyMessages } from "@/lib/policy-messages";

/** The path of a policy, and of one of its versions. */
function pathOf(kind: PolicyKind, version?: PolicyVersion): string {
  return version ? `/${kind}/${version}` : `/${kind}`;
}

/** One policy and the other, with their addresses. */
function select(messages: PolicyMessages, kind: PolicyKind) {
  const privacy = { text: messages.privacy, url: policyUrls.privacy };
  const security = { text: messages.security, url: policyUrls.security };
  return kind === "privacy"
    ? { policy: privacy, other: { ...security, kind: "security" as const } }
    : { policy: security, other: { ...privacy, kind: "privacy" as const } };
}

/** The title, description and canonical address of a policy page. */
export async function policyMetadata(
  kind: PolicyKind,
  version?: PolicyVersion,
): Promise<Metadata> {
  const shown = version ?? policyInEffect(new Date());
  const { policy } = select(getPolicyMessages(await getLocale(), shown), kind);
  return {
    title: policy.text.title,
    description: policy.text.description,
    alternates: {
      canonical: version ? `${policy.url}/${version}` : policy.url,
    },
  };
}

/**
 * progmasoft.com/privacy and progmasoft.com/security show the version in
 * effect, and name the next one while it is published and not in effect yet;
 * /privacy/<version> and /security/<version> show one version.
 */
export async function PolicyPage({
  kind,
  version,
}: {
  kind: PolicyKind;
  version?: PolicyVersion;
}) {
  const locale = await getLocale();
  const inEffect = policyInEffect(new Date());
  const shown = version ?? inEffect;
  const messages = getPolicyMessages(locale, shown);
  const words = policyVersionWords[locale];
  const selected = select(messages, kind);
  const policy: PolicyText = selected.policy.text;
  const other = selected.other;
  const next = shown === inEffect ? policyAfter(inEffect) : undefined;
  const isFuture = shown > inEffect;
  const linkVersion = version && version !== inEffect ? version : undefined;
  return (
    <div className="pm-page">
      <SiteHeader locale={locale} />
      <main>
        <section className="pm-hero">
          <div className="pm-shell pm-product-hero">
            <h1>{policy.title}</h1>
            <p className="pm-lede">{policy.description}</p>
            <p className="pm-policy-version">
              {messages.versionLabel}{" "}
              <time dateTime={shown}>{messages.versionDate}</time>
            </p>
            {next ? (
              <p className="pm-policy-version">
                {words.upcoming}{" "}
                <time dateTime={next}>
                  {getPolicyMessages(locale, next).versionDate}
                </time>
                . <a href={pathOf(kind, next)}>{words.readIt}</a>
              </p>
            ) : null}
            {isFuture ? (
              <p className="pm-policy-version">
                {words.notYet}{" "}
                <time dateTime={shown}>{messages.versionDate}</time>.{" "}
                <a href={pathOf(kind)}>{words.inEffect}</a>
              </p>
            ) : null}
          </div>
        </section>
        <section className="pm-section">
          <article className="pm-shell pm-policy">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
            <p className="pm-policy-see-also">
              {messages.seeAlso}:{" "}
              <a href={pathOf(other.kind, linkVersion)}>{other.text.title}</a>
            </p>
          </article>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
