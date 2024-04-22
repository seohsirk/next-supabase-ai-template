import { cache } from 'react';

import { cookies, headers } from 'next/headers';

import {
  initializeServerI18n,
  parseAcceptLanguageHeader,
} from '@kit/i18n/server';

import {
  I18N_COOKIE_NAME,
  getI18nSettings,
  languages,
} from '~/lib/i18n/i18n.settings';

import { i18nResolver } from './i18n.resolver';

/**
 * @name createI18nServerInstance
 * @description Creates an instance of the i18n server.
 * It uses the language from the cookie if it exists, otherwise it uses the language from the accept-language header.
 * If neither is available, it will default to the provided environment variable.
 *
 * Initialize the i18n instance for every RSC server request (eg. each page/layout)
 */
function createInstance() {
  const acceptLanguage = headers().get('accept-language');
  const cookie = cookies().get(I18N_COOKIE_NAME)?.value;

  let language =
    cookie ??
    parseAcceptLanguageHeader(acceptLanguage, languages)[0] ??
    languages[0];

  if (!languages.includes(language ?? '')) {
    console.warn(
      `Language "${language}" is not supported. Falling back to "${languages[0]}"`,
    );

    language = languages[0];
  }

  const settings = getI18nSettings(language);

  return initializeServerI18n(settings, i18nResolver);
}

export const createI18nServerInstance = cache(createInstance);
