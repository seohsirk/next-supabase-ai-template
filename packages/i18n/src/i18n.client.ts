import i18next, { type InitOptions, i18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

let clientInstance: i18n | null = null;

/**
 * Initialize the i18n instance on the client.
 * @param settings - the i18n settings
 * @param resolver - a function that resolves the i18n resources
 */
export function initializeI18nClient(
  settings: InitOptions,
  resolver: (lang: string, namespace: string) => Promise<object>,
): Promise<i18n> {
  if (clientInstance?.isInitialized) {
    return Promise.resolve(clientInstance);
  }

  return new Promise<i18n>((resolve, reject) => {
    void i18next
      .use(initReactI18next)
      .use(
        resourcesToBackend(async (language, namespace, callback) => {
          const data = await resolver(language, namespace);

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
            lookupCookie: 'lang',
          },
          interpolation: {
            escapeValue: false,
          },
        },
        (err) => {
          if (err) {
            return reject(err);
          }

          clientInstance = i18next;

          resolve(clientInstance);
        },
      );
  });
}
