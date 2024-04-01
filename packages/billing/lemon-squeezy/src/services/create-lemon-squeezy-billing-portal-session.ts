import { getCustomer } from '@lemonsqueezy/lemonsqueezy.js';
import { z } from 'zod';

import { CreateBillingPortalSessionSchema } from '@kit/billing/schema';

import { initializeLemonSqueezyClient } from './lemon-squeezy-sdk';

/**
 * Creates a LemonSqueezy billing portal session for the given parameters.
 *
 * @param {object} params - The parameters required to create the billing portal session.
 * @return {Promise<string>} - A promise that resolves to the URL of the customer portal.
 * @throws {Error} - If no customer is found with the given customerId.
 */
export async function createLemonSqueezyBillingPortalSession(
  params: z.infer<typeof CreateBillingPortalSessionSchema>,
) {
  await initializeLemonSqueezyClient();

  const customer = await getCustomer(params.customerId);

  if (!customer?.data) {
    throw new Error('No customer found');
  }

  return customer.data.data.attributes.urls.customer_portal;
}
