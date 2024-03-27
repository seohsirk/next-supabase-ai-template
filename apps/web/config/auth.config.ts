import type { Provider } from '@supabase/gotrue-js';

import { z } from 'zod';

const providers: z.ZodType<Provider> = getProviders();

const AuthConfigSchema = z.object({
  providers: z.object({
    password: z.boolean({
      description: 'Enable password authentication.',
    }),
    magicLink: z.boolean({
      description: 'Enable magic link authentication.',
    }),
    oAuth: providers.array(),
  }),
});

const authConfig = AuthConfigSchema.parse({
  // NB: Enable the providers below in the Supabase Console
  // in your production project
  providers: {
    password: true,
    magicLink: false,
    oAuth: ['google'],
  },
});

export default authConfig;

function getProviders() {
  return z.enum([
    'apple',
    'azure',
    'bitbucket',
    'discord',
    'facebook',
    'figma',
    'github',
    'gitlab',
    'google',
    'kakao',
    'keycloak',
    'linkedin',
    'linkedin_oidc',
    'notion',
    'slack',
    'spotify',
    'twitch',
    'twitter',
    'workos',
    'zoom',
    'fly',
  ]);
}
