import 'server-only';
import type { Stripe } from 'stripe';

import createStripeCheckout, {
  CreateStripeCheckoutParams,
} from './create-checkout';
import {
  CreateBillingPortalSessionParams,
  createStripeBillingPortalSession,
} from './create-stripe-billing-portal-session';
import { createStripeClient } from './stripe-sdk';

class StripeService {
  constructor(private readonly stripeProvider: () => Promise<Stripe>) {}

  async createCheckout(params: CreateStripeCheckoutParams) {
    const stripe = await this.stripeProvider();

    return createStripeCheckout(stripe, params);
  }

  async createBillingPortalSession(params: CreateBillingPortalSessionParams) {
    const stripe = await this.stripeProvider();

    return createStripeBillingPortalSession(stripe, params);
  }

  async cancelSubscription(subscriptionId: string) {
    const stripe = await this.stripeProvider();

    return stripe.subscriptions.cancel(subscriptionId, {
      invoice_now: true,
    });
  }
}

export const stripe = new StripeService(createStripeClient);
