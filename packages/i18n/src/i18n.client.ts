import i18next, { i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

import { I18N_COOKIE_NAME, getI18nSettings } from './i18n.settings';

export function initializeI18nClient(
  lng: string | undefined,
  i18nResolver: (lang: string, namespace: string) => Promise<object>,
): Promise<i18n> {
  const settings = getI18nSettings(lng);

  if (i18next.isInitialized) {
    return Promise.resolve(i18next);
  }

  return new Promise<i18n>((resolve, reject) => {
    void i18next
      .use(initReactI18next)
      .use(
        resourcesToBackend(async (language, namespace, callback) => {
          const data = await i18nResolver(language, namespace);

          return callback(null, data);
        }),
      )
      .use(LanguageDetector)
      .init(
        {
          ...settings,
          detection: {
            order: ['htmlTag', 'cookie', 'navigator'],
            caches: ['cookie'],
            lookupCookie: I18N_COOKIE_NAME,
          },
          interpolation: {
            escapeValue: false,
          },
        },
        (err) => {
          if (err) {
            return reject(err);
          }

          resolve(i18next);
        },
      );
  });
}
