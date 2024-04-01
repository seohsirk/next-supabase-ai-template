import 'server-only';

import { Logger } from '@kit/shared/logger';

import { getLemonSqueezyEnv } from '../schema/lemon-squeezy-server-env.schema';

/**
 * @description Initialize the Lemon Squeezy client
 */
export async function initializeLemonSqueezyClient() {
  const { lemonSqueezySetup } = await import('@lemonsqueezy/lemonsqueezy.js');
  const env = getLemonSqueezyEnv();

  lemonSqueezySetup({
    apiKey: env.secretKey,
    onError(error) {
      Logger.error(
        {
          name: `billing.lemon-squeezy`,
          error: error.message,
        },
        'Error in Lemon Squeezy SDK',
      );
    },
  });
}
