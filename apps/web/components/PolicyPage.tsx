// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getLocale } from "@/lib/locale.server";
import { type PolicyKind, policyUrls, policyVersion } from "@/lib/policies";
import { getPolicyMessages } from "@/lib/policy-messages";

/** The title, description and canonical address of a policy page. */
export async function policyMetadata(kind: PolicyKind): Promise<Metadata> {
  const policy = getPolicyMessages(await getLocale())[kind];
  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: policyUrls[kind] },
  };
}

/** progmasoft.com/privacy and progmasoft.com/security. */
export async function PolicyPage({ kind }: { kind: PolicyKind }) {
  const locale = await getLocale();
  const messages = getPolicyMessages(locale);
  const policy = messages[kind];
  const other: PolicyKind = kind === "privacy" ? "security" : "privacy";
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
              <time dateTime={policyVersion}>{messages.versionDate}</time>
            </p>
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
              <a href={`/${other}`}>{messages[other].title}</a>
            </p>
          </article>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
