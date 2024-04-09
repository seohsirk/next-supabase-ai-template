import 'server-only';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { BillingGatewayService } from './billing-gateway.service';

/**
 * @description This function retrieves the billing provider from the database and returns a
 * new instance of the `BillingGatewayService` class. This class is used to interact with the server actions
 * defined in the host application.
 */
export async function getBillingGatewayProvider(
  client: ReturnType<typeof getSupabaseServerActionClient>,
) {
  const provider = await getBillingProvider(client);

  return new BillingGatewayService(provider);
}

async function getBillingProvider(
  client: ReturnType<typeof getSupabaseServerActionClient>,
) {
  const { data, error } = await client
    .from('config')
    .select('billing_provider')
    .single();

  if (error ?? !data.billing_provider) {
    throw error;
  }

  return data.billing_provider;
}
