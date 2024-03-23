import getLanguageCookie from '@kit/i18n/cookie';
import { initializeServerI18n } from '@kit/i18n/server';

import { i18nResolver } from './i18n.resolver';

export function createI18nServerInstance() {
  const cookie = getLanguageCookie();

  return initializeServerI18n(cookie, i18nResolver);
}
