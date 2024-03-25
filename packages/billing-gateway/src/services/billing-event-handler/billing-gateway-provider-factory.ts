import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { BillingEventHandlerService } from './billing-event-handler.service';
import { BillingEventHandlerFactoryService } from './billing-gateway-factory.service';

/**
 * @description This function retrieves the billing provider from the database and returns a
 * new instance of the `BillingGatewayService` class. This class is used to interact with the server actions
 * defined in the host application.
 */
export async function getBillingEventHandlerService(
  client: ReturnType<typeof getSupabaseServerActionClient>,
  provider: Database['public']['Enums']['billing_provider'],
) {
  const strategy =
    await BillingEventHandlerFactoryService.GetProviderStrategy(provider);

  return new BillingEventHandlerService(client, strategy);
}
