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
  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.stripe',
        customerId: params.customerId,
        accountId: params.accountId,
      },
      'Creating checkout session...',
    );

    const { client_secret } = await createStripeCheckout(stripe, params);

    if (!client_secret) {
      logger.error(
        {
          name: 'billing.stripe',
          customerId: params.customerId,
          accountId: params.accountId,
        },
        'Failed to create checkout session',
      );

      throw new Error('Failed to create checkout session');
    }

    logger.info(
      {
        name: 'billing.stripe',
        customerId: params.customerId,
        accountId: params.accountId,
      },
      'Checkout session created successfully',
    );

    return { checkoutToken: client_secret };
  }

  async createBillingPortalSession(
    params: z.infer<typeof CreateBillingPortalSessionSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.stripe',
        customerId: params.customerId,
      },
      'Creating billing portal session...',
    );

    const session = await createStripeBillingPortalSession(stripe, params);

    if (!session?.url) {
      logger.error(
        {
          name: 'billing.stripe',
          customerId: params.customerId,
        },
        'Failed to create billing portal session',
      );
    } else {
      logger.info(
        {
          name: 'billing.stripe',
          customerId: params.customerId,
        },
        'Billing portal session created successfully',
      );
    }

    return session;
  }

  async cancelSubscription(
    params: z.infer<typeof CancelSubscriptionParamsSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.stripe',
        subscriptionId: params.subscriptionId,
      },
      'Cancelling subscription...',
    );

    try {
      await stripe.subscriptions.cancel(params.subscriptionId, {
        invoice_now: params.invoiceNow ?? true,
      });

      logger.info(
        {
          name: 'billing.stripe',
          subscriptionId: params.subscriptionId,
        },
        'Subscription cancelled successfully',
      );

      return { success: true };
    } catch (e) {
      logger.error(
        {
          name: 'billing.stripe',
          subscriptionId: params.subscriptionId,
          error: e,
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

    logger.info(
      {
        name: 'billing.stripe',
        sessionId: params.sessionId,
      },
      'Retrieving checkout session...',
    );

    try {
      const session = await stripe.checkout.sessions.retrieve(params.sessionId);
      const isSessionOpen = session.status === 'open';

      logger.info(
        {
          name: 'billing.stripe',
          sessionId: params.sessionId,
        },
        'Checkout session retrieved successfully',
      );

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
          name: 'billing.stripe',
          sessionId: params.sessionId,
          error,
        },
        'Failed to retrieve checkout session',
      );

      throw new Error('Failed to retrieve checkout session');
    }
  }

  async reportUsage(params: z.infer<typeof ReportBillingUsageSchema>) {
    const stripe = await this.stripeProvider();

    await stripe.subscriptionItems.createUsageRecord(
      params.subscriptionItemId,
      {
        quantity: params.usage.quantity,
        action: params.usage.action,
      },
    );

    return { success: true };
  }

  async updateSubscription(
    params: z.infer<typeof UpdateSubscriptionParamsSchema>,
  ) {
    const stripe = await this.stripeProvider();
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.stripe',
        ...params,
      },
      'Updating subscription...',
    );

    try {
      await stripe.subscriptions.update(params.subscriptionId, {
        items: [
          {
            id: params.subscriptionItemId,
            quantity: params.quantity,
          },
        ],
      });

      logger.info(
        {
          name: 'billing.stripe',
          ...params,
        },
        'Subscription updated successfully',
      );

      return { success: true };
    } catch (e) {
      logger.error(
        {
          name: 'billing.stripe',
          ...params,
          error: e,
        },
        'Failed to update subscription',
      );

      throw new Error('Failed to update subscription');
    }
  }

  private async stripeProvider(): Promise<Stripe> {
    return createStripeClient();
  }
}
