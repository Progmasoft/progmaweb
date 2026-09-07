// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import { Brand } from "./Brand";
import { getMessages, type Locale } from "@/lib/localization";

export function Footer({ locale }: { locale: Locale }) {
  const { footer } = getMessages(locale);
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p>{footer.summary}</p>
        </div>
        <div>
          <strong>{footer.products}</strong>
          <a href="https://xsharp-lang.xyz/">Visual X#</a>
          <a href="https://viget.progmasoft.com/">ViGet</a>
          <a href="https://github.com/Progmasoft">{footer.openSource}</a>
        </div>
        <div>
          <strong>{footer.company}</strong>
          <a href="mailto:support@progmasoft.com">{footer.support}</a>
          <a href="https://account.progmasoft.com/">
            {getMessages(locale).navigation.account}
          </a>
          <a href="https://github.com/Progmasoft/progmaweb">
            {footer.websiteSource}
          </a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Progmasoft</span>
        <span>{footer.closing}</span>
      </div>
    </footer>
  );
}
