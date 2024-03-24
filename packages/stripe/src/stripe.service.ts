import 'server-only';
import type { Stripe } from 'stripe';
import { z } from 'zod';

import { BillingStrategyProviderService } from '@kit/billing';
import {
  CancelSubscriptionParamsSchema,
  CreateBillingCheckoutSchema,
  CreateBillingPortalSessionSchema,
  RetrieveCheckoutSessionSchema,
} from '@kit/billing/schema';

import { createStripeCheckout } from './create-checkout';
import { createStripeBillingPortalSession } from './create-stripe-billing-portal-session';
import { createStripeClient } from './stripe-sdk';

export class StripeBillingStrategyService
  implements BillingStrategyProviderService
{
  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    const stripe = await this.stripeProvider();

    return createStripeCheckout(stripe, params);
  }

  async createBillingPortalSession(
    params: z.infer<typeof CreateBillingPortalSessionSchema>,
  ) {
    const stripe = await this.stripeProvider();

    return createStripeBillingPortalSession(stripe, params);
  }

  async cancelSubscription(
    params: z.infer<typeof CancelSubscriptionParamsSchema>,
  ) {
    const stripe = await this.stripeProvider();

    await stripe.subscriptions.cancel(params.subscriptionId, {
      invoice_now: params.invoiceNow ?? true,
    });

    return { success: true };
  }

  async retrieveCheckoutSession(
    params: z.infer<typeof RetrieveCheckoutSessionSchema>,
  ) {
    const stripe = await this.stripeProvider();

    return await stripe.subscriptions.retrieve(params.sessionId);
  }

  private async stripeProvider(): Promise<Stripe> {
    return createStripeClient();
  }
}
