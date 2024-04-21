'use client';

import { Suspense } from 'react';

import dynamic from 'next/dynamic';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { ThemeProvider } from 'next-themes';

import { CaptchaProvider } from '@kit/auth/captcha/client';
import { I18nProvider } from '@kit/i18n/provider';
import { AuthChangeListener } from '@kit/supabase/components/auth-change-listener';

import appConfig from '~/config/app.config';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { i18nResolver } from '~/lib/i18n/i18n.resolver';
import { getI18nSettings } from '~/lib/i18n/i18n.settings';

const captchaSiteKey = authConfig.captchaTokenSiteKey;
const queryClient = new QueryClient();

const CaptchaTokenSetter = dynamic(async () => {
  if (!captchaSiteKey) {
    return Promise.resolve(() => null);
  }

  const { CaptchaTokenSetter } = await import('@kit/auth/captcha/client');

  return {
    default: CaptchaTokenSetter,
  };
});

export function RootProviders({
  lang,
  theme = appConfig.theme,
  children,
}: React.PropsWithChildren<{
  lang: string;
  theme?: string;
}>) {
  const i18nSettings = getI18nSettings(lang);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        <Suspense fallback={null}>
          <I18nProvider settings={i18nSettings} resolver={i18nResolver}>
            <CaptchaProvider>
              <CaptchaTokenSetter siteKey={captchaSiteKey} />

              <AuthChangeListener appHomePath={pathsConfig.app.home}>
                <ThemeProvider
                  attribute="class"
                  enableSystem
                  disableTransitionOnChange
                  defaultTheme={theme}
                  enableColorScheme={false}
                >
                  {children}
                </ThemeProvider>
              </AuthChangeListener>
            </CaptchaProvider>
          </I18nProvider>
        </Suspense>
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}
