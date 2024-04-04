import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';

import { I18N_COOKIE_NAME, getI18nSettings, languages } from './i18n.settings';

export function getLanguageCookie<
  Cookies extends {
    get: (name: string) => { value: string } | undefined;
  },
>(cookies: Cookies) {
  return cookies.get(I18N_COOKIE_NAME)?.value;
}

export async function initializeServerI18n(
  lang: string | undefined,
  i18nResolver: (language: string, namespace: string) => Promise<object>,
) {
  const i18nInstance = createInstance();
  const settings = getI18nSettings(lang);

  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(async (language, namespace, callback) => {
        try {
          const data = await i18nResolver(language, namespace);

          return callback(null, data);
        } catch (error) {
          console.log(
            `Error loading i18n file: locales/${language}/${namespace}.json`,
            error,
          );

          return {};
        }
      }),
    )
    .init(settings);

  return i18nInstance;
}

export function parseAcceptLanguageHeader(
  languageHeaderValue: string | null | undefined,
  acceptedLanguages = languages,
): string[] {
  // Return an empty array if the header value is not provided
  if (!languageHeaderValue) return [];

  const ignoreWildcard = true;

  // Split the header value by comma and map each language to its quality value
  return languageHeaderValue
    .split(',')
    .map((lang): [number, string] => {
      const [locale, q = 'q=1'] = lang.split(';');

      if (!locale) return [0, ''];

      const trimmedLocale = locale.trim();
      const numQ = Number(q.replace(/q ?=/, ''));

      return [isNaN(numQ) ? 0 : numQ, trimmedLocale];
    })
    .sort(([q1], [q2]) => q2 - q1) // Sort by quality value in descending order
    .flatMap(([_, locale]) => {
      // Ignore wildcard '*' if 'ignoreWildcard' is true
      if (locale === '*' && ignoreWildcard) return [];

      // Return the locale if it's included in the accepted languages
      try {
        return acceptedLanguages.includes(locale) ? [locale] : [];
      } catch {
        return [];
      }
    });
}
