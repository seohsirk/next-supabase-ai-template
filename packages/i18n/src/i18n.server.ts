import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';

import { getI18nSettings } from './i18n.settings';

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
