'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { ThemeProvider } from 'next-themes';

import { CaptchaProvider, CaptchaTokenSetter } from '@kit/auth/captcha/client';
import { I18nProvider } from '@kit/i18n/provider';
import { AuthChangeListener } from '@kit/supabase/components/auth-change-listener';

import appConfig from '~/config/app.config';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { i18nResolver } from '~/lib/i18n/i18n.resolver';

const captchaSiteKey = authConfig.captchaTokenSiteKey;
const queryClient = new QueryClient();

export function RootProviders({
  lang,
  children,
}: React.PropsWithChildren<{
  lang: string;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        <CaptchaProvider>
          <CaptchaTokenSetter siteKey={captchaSiteKey} />

          <AuthChangeListener appHomePath={pathsConfig.app.home}>
            <I18nProvider lang={lang} resolver={i18nResolver}>
              <ThemeProvider
                attribute="class"
                enableSystem
                disableTransitionOnChange
                defaultTheme={appConfig.theme}
              >
                {children}
              </ThemeProvider>
            </I18nProvider>
          </AuthChangeListener>
        </CaptchaProvider>
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}
