import Stripe from 'stripe';

import { BillingWebhookHandlerService } from '@kit/billing';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { StripeServerEnvSchema } from '../schema/stripe-server-env.schema';
import { createStripeClient } from './stripe-sdk';

type UpsertSubscriptionParams =
  Database['public']['Functions']['upsert_subscription']['Args'];

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

    const { webhooksSecret } = StripeServerEnvSchema.parse({
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhooksSecret: process.env.STRIPE_WEBHOOK_SECRET,
    });

    const stripe = await this.loadStripe();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhooksSecret,
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
        data: UpsertSubscriptionParams,
      ) => Promise<unknown>;

      onSubscriptionUpdated: (
        data: UpsertSubscriptionParams,
      ) => Promise<unknown>;
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
      data: UpsertSubscriptionParams,
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
      amount,
      accountId,
      customerId,
    });

    return onCheckoutCompletedCallback(payload);
  }

  private async handleSubscriptionUpdatedEvent(
    event: Stripe.CustomerSubscriptionUpdatedEvent,
    onSubscriptionUpdatedCallback: (
      data: UpsertSubscriptionParams,
    ) => Promise<unknown>,
  ) {
    const subscription = event.data.object;
    const accountId = subscription.metadata.account_id as string;
    const customerId = subscription.customer as string;

    const amount = subscription.items.data.reduce((acc, item) => {
      return (acc + (item.plan.amount ?? 0)) * (item.quantity ?? 1);
    }, 0);

    const payload = this.buildSubscriptionPayload({
      subscription,
      amount,
      accountId,
      customerId,
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
    accountId: string;
    customerId: string;
  }): UpsertSubscriptionParams {
    const { subscription } = params;
    const currency = subscription.currency;

    const active =
      subscription.status === 'active' || subscription.status === 'trialing';

    const lineItems = subscription.items.data.map((item) => {
      const quantity = item.quantity ?? 1;

      return {
        id: item.id,
        subscription_id: subscription.id,
        product_id: item.price.product as string,
        variant_id: item.price.id,
        price_amount: item.price.unit_amount,
        quantity,
        interval: item.price.recurring?.interval as string,
        interval_count: item.price.recurring?.interval_count as number,
      };
    });

    // otherwise we are updating a subscription
    // and we only need to return the update payload
    return {
      line_items: lineItems,
      billing_provider: this.provider,
      subscription_id: subscription.id,
      status: subscription.status,
      total_amount: params.amount,
      active,
      currency,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      period_starts_at: getISOString(
        subscription.current_period_start,
      ) as string,
      period_ends_at: getISOString(subscription.current_period_end) as string,
      trial_starts_at: getISOString(subscription.trial_start),
      trial_ends_at: getISOString(subscription.trial_end),
      account_id: params.accountId,
      customer_id: params.customerId,
    };
  }
}

function getISOString(date: number | null) {
  return date ? new Date(date * 1000).toISOString() : undefined;
}
