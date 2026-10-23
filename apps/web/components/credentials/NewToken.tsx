// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use client";

import { useEffect, useState } from "react";
import {
  callOAuthApi,
  signsPeopleIn,
  type ApplicationCredentials,
  type ApplicationKind,
  type SessionView,
} from "@/lib/credentials";
import { getCredentialsMessages } from "@/lib/credentials-messages";
import type { Locale } from "@/lib/localization";
import { AccountSignInNotice } from "./AccountSignInNotice";
import { ApplicationForm } from "./ApplicationForm";
import { CredentialsCard } from "./CredentialsCard";

/**
 * The second step of a new token: the form of the chosen type, and then the
 * client identifier and the secret, shown once.
 */
export function NewToken({
  locale,
  kind,
}: {
  locale: Locale;
  kind: ApplicationKind;
}) {
  const { form, common, details } = getCredentialsMessages(locale);
  const [created, setCreated] = useState<ApplicationCredentials | null>(null);
  const [signedOut, setSignedOut] = useState(false);

  // Nobody signed in to the Progmasoft account: show where to sign in.
  useEffect(() => {
    void callOAuthApi<SessionView>("/session").then((result) => {
      setSignedOut(result.kind === "signedOut");
    });
  }, []);

  if (signedOut) {
    return <AccountSignInNotice locale={locale} />;
  }
  if (created) {
    return (
      <CredentialsCard
        locale={locale}
        title={details.tokenCreated}
        credentials={created}
      />
    );
  }

  return (
    <ApplicationForm
      locale={locale}
      kind={kind}
      initial={{
        displayName: "",
        homepage: "",
        redirectUris: [],
        postLogoutRedirectUris: [],
        scopes: signsPeopleIn(kind) ? ["profile"] : [],
      }}
      submitLabel={form.create}
      onSubmit={async (submission) => {
        const result = await callOAuthApi<ApplicationCredentials>(
          "/applications",
          { method: "POST", body: submission },
        );
        switch (result.kind) {
          case "ok":
            setCreated(result.value);
            return null;
          case "signedOut":
            setSignedOut(true);
            return null;
          case "refused":
            return result.errors;
          default:
            return { form: common.unreachable };
        }
      }}
    />
  );
}
