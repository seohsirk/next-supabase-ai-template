import { z } from 'zod';

const production = process.env.NODE_ENV === 'production';

enum Themes {
  Light = 'light',
  Dark = 'dark',
}

const AppConfigSchema = z.object({
  name: z
    .string({
      description: `This is the name of your SaaS. Ex. "Makerkit"`,
    })
    .min(1),
  title: z
    .string({
      description: `This is the default title tag of your SaaS.`,
    })
    .min(1),
  description: z.string({
    description: `This is the default description of your SaaS.`,
  }),
  url: z.string().url({
    message: `Please provide a valid URL. Example: 'https://example.com'`,
  }),
  locale: z
    .string({
      description: `This is the default locale of your SaaS.`,
    })
    .default('en'),
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
