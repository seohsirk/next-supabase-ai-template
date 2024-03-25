import { getBillingEventHandlerService } from '@kit/billing-gateway';
import { Logger } from '@kit/shared/logger';
import { getSupabaseRouteHandlerClient } from '@kit/supabase/route-handler-client';

import billingConfig from '~/config/billing.config';

/**
 * @description Handle the webhooks from Stripe related to checkouts
 */
export async function POST(request: Request) {
  const client = getSupabaseRouteHandlerClient();

  // we can infer the provider from the billing config or the request
  // for simplicity, we'll use the billing config for now
  // TODO: use dynamic provider from request?
  const provider = billingConfig.provider;

  Logger.info(
    {
      name: 'billing',
      provider,
    },
    `Received billing webhook. Processing...`,
  );

  const service = await getBillingEventHandlerService(client, provider);

  try {
    await service.handleWebhookEvent(request);

    Logger.info(
      {
        name: 'billing',
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
