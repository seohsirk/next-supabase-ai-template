import type { Stripe } from 'stripe';

export interface CreateBillingPortalSessionParams {
  customerId: string;
  returnUrl: string;
}

/**
 * @name createStripeBillingPortalSession
 * @description Create a Stripe billing portal session for a user
 */
export async function createStripeBillingPortalSession(
  stripe: Stripe,
  params: CreateBillingPortalSessionParams,
) {
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}
