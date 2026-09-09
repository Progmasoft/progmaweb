// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import { Brand } from "./Brand";
import { getMessages, type Locale } from "@/lib/localization";

export function ViGetFooter({ locale }: { locale: Locale }) {
  const { viget } = getMessages(locale);
  return (
    <footer className="site-footer viget-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p>{viget.footerDescription}</p>
        </div>
        <div>
          <strong>{viget.registry}</strong>
          <a href="https://viget.progmasoft.com/">{viget.packages}</a>
          <a href="https://viget.progmasoft.com/dslplugins/">
            {viget.dslPlugins}
          </a>
          <a href="https://xsharp-lang.xyz/">Visual X#</a>
        </div>
        <div>
          <strong>Progmasoft</strong>
          <a href="https://account.progmasoft.com/">{viget.account}</a>
          <a href="mailto:support@progmasoft.com">{viget.support}</a>
          <a href="https://github.com/Progmasoft/progmaweb">{viget.source}</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Progmasoft</span>
        <span>{viget.footerClosing}</span>
      </div>
    </footer>
  );
}
