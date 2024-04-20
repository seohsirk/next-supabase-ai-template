'use client';

import type { InitOptions, i18n } from 'i18next';

let client: i18n;

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
  // If the client is not initialized or
  // the language has changed, reinitialize the client
  if (!client || client.language !== settings.lng) {
    throw withI18nClient(settings, resolver);
  }

  return children;
}

async function withI18nClient(settings: InitOptions, resolver: Resolver) {
  if (typeof window !== 'undefined') {
    const { initializeI18nClient } = await import('./i18n.client');

    client = await initializeI18nClient(settings, resolver);
  } else {
    const { initializeServerI18n } = await import('./i18n.server');

    client = await initializeServerI18n(settings, resolver);
  }
}
