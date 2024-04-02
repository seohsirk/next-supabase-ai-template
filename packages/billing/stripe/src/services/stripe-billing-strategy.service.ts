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
import { Logger } from '@kit/shared/logger';

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

    Logger.info(
      {
        name: 'billing.stripe',
        customerId: params.customerId,
        accountId: params.accountId,
      },
      'Creating checkout session...',
    );

    const { client_secret } = await createStripeCheckout(stripe, params);

    if (!client_secret) {
      Logger.error(
        {
          name: 'billing.stripe',
          customerId: params.customerId,
          accountId: params.accountId,
        },
        'Failed to create checkout session',
      );

      throw new Error('Failed to create checkout session');
    }

    Logger.info(
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

    Logger.info(
      {
        name: 'billing.stripe',
        customerId: params.customerId,
      },
      'Creating billing portal session...',
    );

    const session = await createStripeBillingPortalSession(stripe, params);

    if (!session?.url) {
      Logger.error(
        {
          name: 'billing.stripe',
          customerId: params.customerId,
        },
        'Failed to create billing portal session',
      );
    } else {
      Logger.info(
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

    Logger.info(
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

      Logger.info(
        {
          name: 'billing.stripe',
          subscriptionId: params.subscriptionId,
        },
        'Subscription cancelled successfully',
      );

      return { success: true };
    } catch (e) {
      Logger.error(
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

    Logger.info(
      {
        name: 'billing.stripe',
        sessionId: params.sessionId,
      },
      'Retrieving checkout session...',
    );

    try {
      const session = await stripe.checkout.sessions.retrieve(params.sessionId);
      const isSessionOpen = session.status === 'open';

      Logger.info(
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
      Logger.error(
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

    await stripe.subscriptionItems.createUsageRecord(params.subscriptionId, {
      quantity: params.usage.quantity,
    });

    return { success: true };
  }

  private async stripeProvider(): Promise<Stripe> {
    return createStripeClient();
  }
}
