// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

import Link from "next/link";
import { getMessages, type Locale } from "@/lib/localization";
import { Brand } from "./Brand";
import { HeaderMenu } from "./HeaderMenu";
import { PreferenceControls } from "./PreferenceControls";

export function ViGetHeader({ locale }: { locale: Locale }) {
  const { navigation, viget } = getMessages(locale);
  return (
    <header className="site-header viget-header">
      <div className="shell header-inner">
        <div className="viget-brand-lockup">
          <Brand />
          <span>ViGet</span>
        </div>
        <HeaderMenu
          closeLabel={navigation.closeMenu}
          label={viget.navigationLabel}
          menuLabel={navigation.menu}
        >
          <Link href="https://viget.progmasoft.com/#languages-title">
            {viget.packages}
          </Link>
          <Link href="https://viget.progmasoft.com/dslplugins/tazel">
            {viget.dslPlugins}
          </Link>
          <Link href="https://account.progmasoft.com/login">{viget.login}</Link>
          <Link
            className="button button-small"
            href="https://account.progmasoft.com/register"
          >
            {viget.register}
          </Link>
          <PreferenceControls locale={locale} labels={navigation} />
        </HeaderMenu>
      </div>
    </header>
  );
}
