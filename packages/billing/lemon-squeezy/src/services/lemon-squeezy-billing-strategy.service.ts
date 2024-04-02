import {
  cancelSubscription,
  createUsageRecord,
  getCheckout,
} from '@lemonsqueezy/lemonsqueezy.js';
import 'server-only';
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

import { createLemonSqueezyBillingPortalSession } from './create-lemon-squeezy-billing-portal-session';
import { createLemonSqueezyCheckout } from './create-lemon-squeezy-checkout';

export class LemonSqueezyBillingStrategyService
  implements BillingStrategyProviderService
{
  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        customerId: params.customerId,
        accountId: params.accountId,
        returnUrl: params.returnUrl,
        trialDays: params.trialDays,
      },
      'Creating checkout session...',
    );

    const { data: response, error } = await createLemonSqueezyCheckout(params);

    if (error ?? !response?.data.id) {
      console.log(error);

      Logger.error(
        {
          name: 'billing.lemon-squeezy',
          customerId: params.customerId,
          accountId: params.accountId,
          error: error?.message,
        },
        'Failed to create checkout session',
      );

      throw new Error('Failed to create checkout session');
    }

    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        customerId: params.customerId,
        accountId: params.accountId,
      },
      'Checkout session created successfully',
    );

    return {
      checkoutToken: response.data.attributes.url,
    };
  }

  async createBillingPortalSession(
    params: z.infer<typeof CreateBillingPortalSessionSchema>,
  ) {
    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        customerId: params.customerId,
      },
      'Creating billing portal session...',
    );

    const { data, error } =
      await createLemonSqueezyBillingPortalSession(params);

    if (error ?? !data) {
      Logger.error(
        {
          name: 'billing.lemon-squeezy',
          customerId: params.customerId,
          error: error?.message,
        },
        'Failed to create billing portal session',
      );

      throw new Error('Failed to create billing portal session');
    }

    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        customerId: params.customerId,
      },
      'Billing portal session created successfully',
    );

    return { url: data };
  }

  async cancelSubscription(
    params: z.infer<typeof CancelSubscriptionParamsSchema>,
  ) {
    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        subscriptionId: params.subscriptionId,
      },
      'Cancelling subscription...',
    );

    try {
      const { error } = await cancelSubscription(params.subscriptionId);

      if (error) {
        throw error;
      }

      Logger.info(
        {
          name: 'billing.lemon-squeezy',
          subscriptionId: params.subscriptionId,
        },
        'Subscription cancelled successfully',
      );

      return { success: true };
    } catch (error) {
      Logger.error(
        {
          name: 'billing.lemon-squeezy',
          subscriptionId: params.subscriptionId,
          error: (error as Error)?.message,
        },
        'Failed to cancel subscription',
      );

      throw new Error('Failed to cancel subscription');
    }
  }

  async retrieveCheckoutSession(
    params: z.infer<typeof RetrieveCheckoutSessionSchema>,
  ) {
    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        sessionId: params.sessionId,
      },
      'Retrieving checkout session...',
    );

    const { data: session, error } = await getCheckout(params.sessionId);

    if (error ?? !session?.data) {
      Logger.error(
        {
          name: 'billing.lemon-squeezy',
          sessionId: params.sessionId,
          error: error?.message,
        },
        'Failed to retrieve checkout session',
      );

      throw new Error('Failed to retrieve checkout session');
    }

    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        sessionId: params.sessionId,
      },
      'Checkout session retrieved successfully',
    );

    const { id, attributes } = session.data;

    return {
      checkoutToken: id,
      isSessionOpen: false,
      status: 'complete' as const,
      customer: {
        email: attributes.checkout_data.email,
      },
    };
  }

  async reportUsage(params: z.infer<typeof ReportBillingUsageSchema>) {
    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        subscriptionItemId: params.subscriptionId,
      },
      'Reporting usage...',
    );

    const { error } = await createUsageRecord({
      quantity: params.usage.quantity,
      subscriptionItemId: params.subscriptionId,
    });

    if (error) {
      Logger.error(
        {
          name: 'billing.lemon-squeezy',
          subscriptionItemId: params.subscriptionId,
          error: error.message,
        },
        'Failed to report usage',
      );

      throw new Error('Failed to report usage');
    }

    Logger.info(
      {
        name: 'billing.lemon-squeezy',
        subscriptionItemId: params.subscriptionId,
      },
      'Usage reported successfully',
    );

    return { success: true };
  }
}
