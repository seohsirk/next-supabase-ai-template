import { getBillingEventHandlerService } from '@kit/billing-gateway';
import { Logger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import billingConfig from '~/config/billing.config';

/**
 * @description Handle the webhooks from Stripe related to checkouts
 */
export async function POST(request: Request) {
  const provider = billingConfig.provider;

  Logger.info(
    {
      name: 'billing.webhook',
      provider,
    },
    `Received billing webhook. Processing...`,
  );

  const supabaseClientProvider = () =>
    getSupabaseRouteHandlerClient({ admin: true });

  const service = await getBillingEventHandlerService(
    supabaseClientProvider,
    provider,
    billingConfig,
  );

  try {
    await service.handleWebhookEvent(request);

    Logger.info(
      {
        name: 'billing.webhook',
      },
      `Successfully processed billing webhook`,
    );

    return new Response('OK', { status: 200 });
  } catch (e) {
    Logger.error(
      {
        name: 'billing',
        error: e,
      },
      `Failed to process billing webhook`,
    );

    return new Response('Error', { status: 500 });
  }
}
