import { Inter as SansFont } from 'next/font/google';
import { cookies } from 'next/headers';

import { Toaster } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { RootProviders } from '~/components/root-providers';
import appConfig from '~/config/app.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

import '../styles/globals.css';

const sans = SansFont({
  subsets: ['latin'],
  variable: '--font-family-sans',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800'],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const i18n = await createI18nServerInstance();
  const lang = i18n.language;

  return (
    <html lang={lang} className={getClassName()}>
      <body>
        <RootProviders lang={lang}>{children}</RootProviders>
        <Toaster richColors={false} />
      </body>
    </html>
  );
}

function getClassName() {
  const themeCookie = cookies().get('theme')?.value;
  const theme = themeCookie ?? appConfig.theme;
  const dark = theme === 'dark';

  return cn('antialiased', {
    dark,
    [sans.className]: true,
  });
}

export const metadata = {
  title: appConfig.name,
  description: appConfig.description,
  metadataBase: new URL(appConfig.url),
  openGraph: {
    url: appConfig.url,
    siteName: appConfig.name,
    description: appConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: appConfig.title,
    description: appConfig.description,
  },
  icons: {
    icon: '/assets/images/favicon/favicon.ico',
    shortcut: '/shortcut-icon.png',
    apple: '/assets/images/favicon/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
};
