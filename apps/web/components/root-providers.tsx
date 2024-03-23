'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import pathsConfig from '~/config/paths.config';
import { i18nResolver } from '~/lib/i18n/i18n.resolver';

import { I18nProvider } from '@kit/i18n/provider';
import { AuthChangeListener } from '@kit/supabase/components/auth-change-listener';

export function RootProviders({
  lang,
  children,
}: React.PropsWithChildren<{
  lang: string;
}>) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthChangeListener appHomePath={pathsConfig.app.home}>
        <I18nProvider lang={lang} resolver={i18nResolver}>
          {children}
        </I18nProvider>
      </AuthChangeListener>
    </QueryClientProvider>
  );
}
