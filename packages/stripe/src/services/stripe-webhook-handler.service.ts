import Stripe from 'stripe';

import { BillingWebhookHandlerService } from '@kit/billing';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { StripeServerEnvSchema } from '../schema/stripe-server-env.schema';
import { createStripeClient } from './stripe-sdk';

type Subscription = Database['public']['Tables']['subscriptions'];

type InsertSubscriptionParams = Omit<
  Subscription['Insert'],
  'billing_customer_id'
>;

export class StripeWebhookHandlerService
  implements BillingWebhookHandlerService
{
  private stripe: Stripe | undefined;

  private readonly provider: Database['public']['Enums']['billing_provider'] =
    'stripe';

  private readonly namespace = 'billing.stripe';

  /**
   * @description Verifies the webhook signature - should throw an error if the signature is invalid
   */
  async verifyWebhookSignature(request: Request) {
    const body = await request.clone().text();
    const signatureKey = `stripe-signature`;
    const signature = request.headers.get(signatureKey)!;

    const { STRIPE_WEBHOOK_SECRET } = StripeServerEnvSchema.parse({
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    });

    const stripe = await this.loadStripe();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );

    if (!event) {
      throw new Error('Invalid signature');
    }

    return event;
  }

  private async loadStripe() {
    if (!this.stripe) {
      this.stripe = await createStripeClient();
    }

    return this.stripe;
  }

  async handleWebhookEvent(
    event: Stripe.Event,
    params: {
      onCheckoutSessionCompleted: (
        data: InsertSubscriptionParams,
        customerId: string,
      ) => Promise<unknown>;

      onSubscriptionUpdated: (data: Subscription['Update']) => Promise<unknown>;
      onSubscriptionDeleted: (subscriptionId: string) => Promise<unknown>;
    },
  ) {
    switch (event.type) {
      case 'checkout.session.completed': {
        return this.handleCheckoutSessionCompleted(
          event,
          params.onCheckoutSessionCompleted,
        );
      }

      case 'customer.subscription.updated': {
        return this.handleSubscriptionUpdatedEvent(
          event,
          params.onSubscriptionUpdated,
        );
      }

      case 'customer.subscription.deleted': {
        return this.handleSubscriptionDeletedEvent(
          event,
          params.onSubscriptionDeleted,
        );
      }

      default: {
        Logger.info(
          {
            eventType: event.type,
            name: this.namespace,
          },
          `Unhandled Stripe event type: ${event.type}`,
        );

        return;
      }
    }
  }

  private async handleCheckoutSessionCompleted(
    event: Stripe.CheckoutSessionCompletedEvent,
    onCheckoutCompletedCallback: (
      data: Omit<Subscription['Insert'], 'billing_customer_id'>,
      customerId: string,
    ) => Promise<unknown>,
  ) {
    const stripe = await this.loadStripe();

    const session = event.data.object;

    // TODO: handle one-off payments
    // is subscription there?
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const accountId = session.client_reference_id!;
    const customerId = session.customer as string;

    // TODO: support tiered pricing calculations
    // the amount total is amount in cents (e.g. 1000 = $10.00)
    // TODO: convert or store the amount in cents?
    const amount = session.amount_total ?? 0;

    const payload = this.buildSubscriptionPayload({
      subscription,
      accountId,
      amount,
    }) as InsertSubscriptionParams;

    return onCheckoutCompletedCallback(payload, customerId);
  }

  private async handleSubscriptionUpdatedEvent(
    event: Stripe.CustomerSubscriptionUpdatedEvent,
    onSubscriptionUpdatedCallback: (
      data: Subscription['Update'],
    ) => Promise<unknown>,
  ) {
    const subscription = event.data.object;

    const amount = subscription.items.data.reduce((acc, item) => {
      return (acc + (item.plan.amount ?? 0)) * (item.quantity ?? 1);
    }, 0);

    const payload = this.buildSubscriptionPayload({
      subscription,
      amount,
    });

    return onSubscriptionUpdatedCallback(payload);
  }

  private handleSubscriptionDeletedEvent(
    subscription: Stripe.CustomerSubscriptionDeletedEvent,
    onSubscriptionDeletedCallback: (subscriptionId: string) => Promise<unknown>,
  ) {
    // Here we don't need to do anything, so we just return the callback

    return onSubscriptionDeletedCallback(subscription.id);
  }

  private buildSubscriptionPayload(params: {
    subscription: Stripe.Subscription;
    amount: number;
    // we only need the account id if we
    // are creating a subscription for an account
    accountId?: string;
  }) {
    const { subscription } = params;
    const lineItem = subscription.items.data[0];
    const price = lineItem?.price;
    const priceId = price?.id as string;
    const interval = price?.recurring?.interval ?? null;

    const active =
      subscription.status === 'active' || subscription.status === 'trialing';

    const data = {
      billing_provider: this.provider,
      id: subscription.id,
      status: subscription.status,
      active,
      price_amount: params.amount,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      interval: interval as string,
      currency: (price as Stripe.Price).currency,
      product_id: (price as Stripe.Price).product as string,
      variant_id: priceId,
      interval_count: price?.recurring?.interval_count ?? 1,
      period_starts_at: getISOString(subscription.current_period_start),
      period_ends_at: getISOString(subscription.current_period_end),
      trial_starts_at: getISOString(subscription.trial_start),
      trial_ends_at: getISOString(subscription.trial_end),
    } satisfies Omit<InsertSubscriptionParams, 'account_id'>;

    // when we are creating a subscription for an account
    // we need to include the account id
    if (params.accountId !== undefined) {
      return {
        ...data,
        account_id: params.accountId,
      };
    }

    // otherwise we are updating a subscription
    // and we only need to return the update payload
    return data;
  }
}

function getISOString(date: number | null) {
  return date ? new Date(date * 1000).toISOString() : null;
}
