'use client';

import type { i18n } from 'i18next';

let client: i18n;

type Resolver = (
  lang: string,
  namespace: string,
) => Promise<Record<string, string>>;

export function I18nProvider({
  lang,
  children,
  resolver,
}: React.PropsWithChildren<{
  lang: string;
  resolver: Resolver;
}>) {
  if (!client) {
    throw withI18nClient(lang, resolver);
  }

  return children;
}

async function withI18nClient(lang: string, resolver: Resolver) {
  if (typeof window !== 'undefined') {
    client = await loadClientI18n(lang, resolver);
  } else {
    const { initializeServerI18n } = await import('./i18n.server');

    client = await initializeServerI18n(lang, resolver);
  }
}

async function loadClientI18n(lang: string | undefined, resolver: Resolver) {
  // TODO: pull cookie client-side
  const { initializeI18nClient } = await import('./i18n.client');

  return initializeI18nClient(lang, resolver);
}
