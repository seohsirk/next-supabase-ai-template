import type { Provider } from '@supabase/gotrue-js';

import { z } from 'zod';

const providers: z.ZodType<Provider> = getProviders();

const AuthConfigSchema = z.object({
  providers: z.object({
    password: z.boolean(),
    magicLink: z.boolean(),
    oAuth: providers.array(),
  }),
});

const authConfig = AuthConfigSchema.parse({
  // NB: Enable the providers below in the Supabase Console
  // in your production project
  providers: {
    password: false,
    magicLink: true,
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
