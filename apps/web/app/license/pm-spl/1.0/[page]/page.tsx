// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/locale.server";
import {
  getLicenseMessages,
  type LicensePage,
  licensePages,
  pmSplIdentifiers,
} from "@/lib/license-messages";
import { LicenseFrame, LicenseTexts } from "../../../LicenseFrame";

function isLicensePage(value: string): value is LicensePage {
  return (licensePages as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ page: string }> }>): Promise<Metadata> {
  const { page } = await params;
  if (!isLicensePage(page)) return {};
  const text = getLicenseMessages(await getLocale());
  return {
    title: `${text.pages[page]} · ${text.short}`,
    description: text[page].description,
    alternates: {
      canonical: `https://license.progmasoft.com/pm-spl/1.0/${page}/`,
    },
  };
}

/** license.progmasoft.com/pm-spl/1.0/{information,faq,categories}/. */
export default async function PmSplPage({
  params,
}: Readonly<{ params: Promise<{ page: string }> }>) {
  const { page } = await params;
  if (!isLicensePage(page)) notFound();
  const locale = await getLocale();
  const text = getLicenseMessages(locale);
  return (
    <LicenseFrame
      locale={locale}
      title={text.pages[page]}
      description={text[page].description}
      current={page}
    >
      {page === "information" ? (
        <>
          {text.information.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <section>
            <h2>{text.texts}</h2>
            <LicenseTexts locale={locale} />
            <p className="pm-license-ids">
              {text.identifiers}{" "}
              {pmSplIdentifiers.map((id, index) => (
                <span key={id}>
                  {index > 0 ? ", " : null}
                  <code>{id}</code>
                </span>
              ))}
            </p>
          </section>
        </>
      ) : null}
      {page === "faq" ? (
        <dl className="pm-license-faq">
          {text.faq.questions.map(([question, answer]) => (
            <div key={question}>
              <dt>{question}</dt>
              <dd>{answer}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {page === "categories" ? (
        <>
          <p>{text.categories.intro}</p>
          {text.categories.items.map((category) => (
            <section key={category.letter}>
              <h2>
                {text.categories.category} {category.letter} — {category.name}
              </h2>
              <p>{category.rule}</p>
              <table className="pm-license-table">
                <thead>
                  <tr>
                    <th scope="col">{text.categories.license}</th>
                    <th scope="col">{text.categories.identifier}</th>
                  </tr>
                </thead>
                <tbody>
                  {category.examples.map(([name, spdx]) => (
                    <tr key={spdx}>
                      <td>{name}</td>
                      <td>
                        <code>{spdx}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </>
      ) : null}
    </LicenseFrame>
  );
}

export function generateStaticParams() {
  return licensePages.map((page) => ({ page }));
}
