import { z } from 'zod';

const production = process.env.NODE_ENV === 'production';

enum Themes {
  Light = 'light',
  Dark = 'dark',
}

const AppConfigSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  locale: z.string().default('en'),
  theme: z.nativeEnum(Themes),
  production: z.boolean(),
  themeColor: z.string(),
  themeColorDark: z.string(),
});

const appConfig = AppConfigSchema.parse({
  name: 'Awesomely',
  title: 'Awesomely - Your SaaS Title',
  description: 'Your SaaS Description',
  url: process.env.NEXT_PUBLIC_SITE_URL,
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  theme: Themes.Light,
  production,
  themeColor: '#ffffff',
  themeColorDark: '#0a0a0a',
});

export default appConfig;
