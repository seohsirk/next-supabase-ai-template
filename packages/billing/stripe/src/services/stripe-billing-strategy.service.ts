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
  UpdateSubscriptionParamsSchema,
} from '@kit/billing/schema';
import { getLogger } from '@kit/shared/logger';

import { createStripeBillingPortalSession } from './create-stripe-billing-portal-session';
import { createStripeCheckout } from './create-stripe-checkout';
import { createStripeClient } from './stripe-sdk';

export class StripeBillingStrategyService
  implements BillingStrategyProviderService
{
  private readonly namespace = 'billing.stripe';

  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      customerId: params.customerId,
      accountId: params.accountId,
    };

    logger.info(ctx, 'Creating checkout session...');

    const { client_secret } = await createStripeCheckout(stripe, params);

    if (!client_secret) {
      logger.error(ctx, 'Failed to create checkout session');

      throw new Error('Failed to create checkout session');
    }

    logger.info(ctx, 'Checkout session created successfully');

    return { checkoutToken: client_secret };
  }

  async createBillingPortalSession(
    params: z.infer<typeof CreateBillingPortalSessionSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      customerId: params.customerId,
    };

    logger.info(ctx, 'Creating billing portal session...');

    const session = await createStripeBillingPortalSession(stripe, params);

    if (!session?.url) {
      logger.error(ctx, 'Failed to create billing portal session');
    } else {
      logger.info(ctx, 'Billing portal session created successfully');
    }

    return session;
  }

  async cancelSubscription(
    params: z.infer<typeof CancelSubscriptionParamsSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      subscriptionId: params.subscriptionId,
    };

    logger.info(ctx, 'Cancelling subscription...');

    try {
      await stripe.subscriptions.cancel(params.subscriptionId, {
        invoice_now: params.invoiceNow ?? true,
      });

      logger.info(ctx, 'Subscription cancelled successfully');

      return { success: true };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to cancel subscription',
      );

      throw new Error('Failed to cancel subscription');
    }
  }

  async retrieveCheckoutSession(
    params: z.infer<typeof RetrieveCheckoutSessionSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      sessionId: params.sessionId,
    };

    logger.info(ctx, 'Retrieving checkout session...');

    try {
      const session = await stripe.checkout.sessions.retrieve(params.sessionId);
      const isSessionOpen = session.status === 'open';

      logger.info(ctx, 'Checkout session retrieved successfully');

      return {
        checkoutToken: session.client_secret,
        isSessionOpen,
        status: session.status ?? 'complete',
        customer: {
          email: session.customer_details?.email ?? null,
        },
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to retrieve checkout session',
      );

      throw new Error('Failed to retrieve checkout session');
    }
  }

  async reportUsage(params: z.infer<typeof ReportBillingUsageSchema>) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      subscriptionItemId: params.subscriptionItemId,
      usage: params.usage,
    };

    logger.info(ctx, 'Reporting usage...');

    try {
      await stripe.subscriptionItems.createUsageRecord(
        params.subscriptionItemId,
        {
          quantity: params.usage.quantity,
          action: params.usage.action,
        },
      );
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to report usage',
      );

      throw new Error('Failed to report usage');
    }

    return { success: true };
  }

  async updateSubscription(
    params: z.infer<typeof UpdateSubscriptionParamsSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      subscriptionId: params.subscriptionId,
      subscriptionItemId: params.subscriptionItemId,
      quantity: params.quantity,
    };

    logger.info(ctx, 'Updating subscription...');

    try {
      await stripe.subscriptions.update(params.subscriptionId, {
        items: [
          {
            id: params.subscriptionItemId,
            quantity: params.quantity,
          },
        ],
      });

      logger.info(ctx, 'Subscription updated successfully');

      return { success: true };
    } catch (error) {
      logger.error({ ...ctx, error }, 'Failed to update subscription');

      throw new Error('Failed to update subscription');
    }
  }

  async getPlanById(planId: string) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      planId,
    };

    logger.info(ctx, 'Retrieving plan by id...');

    const stripe = await this.stripeProvider();

    try {
      const plan = await stripe.plans.retrieve(planId);

      logger.info(ctx, 'Plan retrieved successfully');

      return {
        id: plan.id,
        name: plan.nickname ?? '',
        amount: plan.amount ?? 0,
        interval: plan.interval,
      };
    } catch (error) {
      logger.error({ ...ctx, error }, 'Failed to retrieve plan');

      throw new Error('Failed to retrieve plan');
    }
  }

  private async stripeProvider(): Promise<Stripe> {
    return createStripeClient();
  }
}
