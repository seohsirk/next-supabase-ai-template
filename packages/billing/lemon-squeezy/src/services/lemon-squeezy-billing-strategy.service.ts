import {
  cancelSubscription,
  createUsageRecord,
  getCheckout,
  updateSubscriptionItem,
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
  UpdateSubscriptionParamsSchema,
} from '@kit/billing/schema';
import { getLogger } from '@kit/shared/logger';

import { createLemonSqueezyBillingPortalSession } from './create-lemon-squeezy-billing-portal-session';
import { createLemonSqueezyCheckout } from './create-lemon-squeezy-checkout';

export class LemonSqueezyBillingStrategyService
  implements BillingStrategyProviderService
{
  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.lemon-squeezy',
        ...params,
      },
      'Creating checkout session...',
    );

    const { data: response, error } = await createLemonSqueezyCheckout(params);

    if (error ?? !response?.data.id) {
      console.log(error);

      logger.error(
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

    logger.info(
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
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.lemon-squeezy',
        customerId: params.customerId,
      },
      'Creating billing portal session...',
    );

    const { data, error } =
      await createLemonSqueezyBillingPortalSession(params);

    if (error ?? !data) {
      logger.error(
        {
          name: 'billing.lemon-squeezy',
          customerId: params.customerId,
          error: error?.message,
        },
        'Failed to create billing portal session',
      );

      throw new Error('Failed to create billing portal session');
    }

    logger.info(
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
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.lemon-squeezy',
        subscriptionId: params.subscriptionId,
      },
      'Cancelling subscription...',
    );

    try {
      const { error } = await cancelSubscription(params.subscriptionId);

      if (error) {
        logger.error(
          {
            name: 'billing.lemon-squeezy',
            subscriptionId: params.subscriptionId,
            error: error.message,
          },
          'Failed to cancel subscription',
        );

        throw error;
      }

      logger.info(
        {
          name: 'billing.lemon-squeezy',
          subscriptionId: params.subscriptionId,
        },
        'Subscription cancelled successfully',
      );

      return { success: true };
    } catch (error) {
      logger.error(
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
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.lemon-squeezy',
        sessionId: params.sessionId,
      },
      'Retrieving checkout session...',
    );

    const { data: session, error } = await getCheckout(params.sessionId);

    if (error ?? !session?.data) {
      logger.error(
        {
          name: 'billing.lemon-squeezy',
          sessionId: params.sessionId,
          error: error?.message,
        },
        'Failed to retrieve checkout session',
      );

      throw new Error('Failed to retrieve checkout session');
    }

    logger.info(
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
    const logger = await getLogger();

    logger.info(
      {
        name: 'billing.lemon-squeezy',
        subscriptionItemId: params.subscriptionItemId,
      },
      'Reporting usage...',
    );

    const { error } = await createUsageRecord({
      quantity: params.usage.quantity,
      subscriptionItemId: params.subscriptionItemId,
      action: params.usage.action,
    });

    if (error) {
      logger.error(
        {
          name: 'billing.lemon-squeezy',
          subscriptionItemId: params.subscriptionItemId,
          error,
        },
        'Failed to report usage',
      );

      throw new Error('Failed to report usage');
    }

    logger.info(
      {
        name: 'billing.lemon-squeezy',
        subscriptionItemId: params.subscriptionItemId,
      },
      'Usage reported successfully',
    );

    return { success: true };
  }

  async updateSubscription(
    params: z.infer<typeof UpdateSubscriptionParamsSchema>,
  ) {
    const logger = await getLogger();

    const ctx = {
      name: 'billing.lemon-squeezy',
      ...params,
    };

    logger.info(ctx, 'Updating subscription...');

    const { error } = await updateSubscriptionItem(params.subscriptionItemId, {
      quantity: params.quantity,
    });

    if (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to update subscription',
      );

      throw error;
    }

    logger.info(ctx, 'Subscription updated successfully');

    return { success: true };
  }
}
