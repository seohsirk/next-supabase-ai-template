import 'server-only';
import type { Stripe } from 'stripe';
import { z } from 'zod';

import { BillingStrategyProviderService } from '@kit/billing';
import {
  CancelSubscriptionParamsSchema,
  CreateBillingCheckoutSchema,
  CreateBillingPortalSessionSchema,
  ReportBillingUsageSchema,
  RetrieveCheckoutSessionSchema,
} from '@kit/billing/schema';

import { createStripeBillingPortalSession } from './create-stripe-billing-portal-session';
import { createStripeCheckout } from './create-stripe-checkout';
import { createStripeClient } from './stripe-sdk';

export class StripeBillingStrategyService
  implements BillingStrategyProviderService
{
  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    const stripe = await this.stripeProvider();

    const { client_secret } = await createStripeCheckout(stripe, params);

    if (!client_secret) {
      throw new Error('Failed to create checkout session');
    }

    return { checkoutToken: client_secret };
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

    const session = await stripe.checkout.sessions.retrieve(params.sessionId);
    const isSessionOpen = session.status === 'open';

    return {
      checkoutToken: session.client_secret,
      isSessionOpen,
      status: session.status ?? 'complete',
      customer: {
        email: session.customer_details?.email ?? null,
      },
    };
  }

  async reportUsage(params: z.infer<typeof ReportBillingUsageSchema>) {
    const stripe = await this.stripeProvider();

    await stripe.subscriptionItems.createUsageRecord(params.subscriptionId, {
      quantity: params.usage.quantity,
    });

    return { success: true };
  }

  private async stripeProvider(): Promise<Stripe> {
    return createStripeClient();
  }
}
