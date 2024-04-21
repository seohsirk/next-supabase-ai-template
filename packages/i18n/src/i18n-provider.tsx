'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import type { InitOptions } from 'i18next';

type Resolver = (
  lang: string,
  namespace: string,
) => Promise<Record<string, string>>;

export function I18nProvider({
  settings,
  children,
  resolver,
}: React.PropsWithChildren<{
  settings: InitOptions;
  resolver: Resolver;
}>) {
  useI18nClient(settings, resolver);

  return children;
}

/**
 * @name useI18nClient
 * @description A hook that initializes the i18n client.
 * @param settings
 * @param resolver
 */
function useI18nClient(settings: InitOptions, resolver: Resolver) {
  return useSuspenseQuery({
    queryKey: ['i18n', settings.lng],
    queryFn: async () => {
      const isBrowser = typeof window !== 'undefined';

      if (isBrowser) {
        const { initializeI18nClient } = await import('./i18n.client');

        return await initializeI18nClient(settings, resolver);
      } else {
        const { initializeServerI18n } = await import('./i18n.server');

        return await initializeServerI18n(settings, resolver);
      }
    },
  });
}
