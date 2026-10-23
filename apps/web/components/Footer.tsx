// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

import { Brand } from "./Brand";
import { getHomeMessages } from "@/lib/home-messages";
import { getMessages, type Locale } from "@/lib/localization";
import { getCatalogMessages } from "@/lib/products";

export function Footer({ locale }: { locale: Locale }) {
  const { footer } = getMessages(locale);
  const site = getHomeMessages(locale).navigation;
  const catalog = getCatalogMessages(locale);
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Brand />
          <p>{footer.summary}</p>
        </div>
        <div>
          <strong>{footer.products}</strong>
          <a href="https://product.progmasoft.com/">{catalog.back}</a>
          <a href="https://console.progmasoft.com/">{site.developers}</a>
          <a href="https://github.com/Progmasoft">{footer.openSource}</a>
        </div>
        <div>
          <strong>{footer.organization}</strong>
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
