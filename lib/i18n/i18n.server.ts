import { cookies, headers } from 'next/headers';

import {
  getLanguageCookie,
  initializeServerI18n,
  parseAcceptLanguageHeader,
} from '@kit/i18n/server';

import { i18nResolver } from './i18n.resolver';

/**
 * @name createI18nServerInstance
 * @description Creates an instance of the i18n server.
 * It uses the language from the cookie if it exists, otherwise it uses the language from the accept-language header.
 * If neither is available, it will default to the provided environment variable.
 *
 * Initialize the i18n instance for every RSC server request (eg. each page/layout)
 */
export function createI18nServerInstance() {
  const acceptLanguage = headers().get('accept-language');
  const cookie = getLanguageCookie(cookies());

  const language =
    cookie ?? parseAcceptLanguageHeader(acceptLanguage)[0] ?? undefined;

  return initializeServerI18n(language, i18nResolver);
}
