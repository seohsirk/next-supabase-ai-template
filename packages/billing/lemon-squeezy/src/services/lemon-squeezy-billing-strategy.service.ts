import 'server-only';

import {
  cancelSubscription,
  createUsageRecord,
  getCheckout,
  getVariant,
  updateSubscriptionItem,
} from '@lemonsqueezy/lemonsqueezy.js';
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
  private readonly namespace = 'billing.lemon-squeezy';

  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      ...params,
    };

    logger.info(ctx, 'Creating checkout session...');

    const { data: response, error } = await createLemonSqueezyCheckout(params);

    if (error ?? !response?.data.id) {
      console.log(error);

      logger.error(
        {
          ...ctx,
          error: error?.message,
        },
        'Failed to create checkout session',
      );

      throw new Error('Failed to create checkout session');
    }

    logger.info(ctx, 'Checkout session created successfully');

    return {
      checkoutToken: response.data.attributes.url,
    };
  }

  async createBillingPortalSession(
    params: z.infer<typeof CreateBillingPortalSessionSchema>,
  ) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      ...params,
    };

    logger.info(ctx, 'Creating billing portal session...');

    const { data, error } =
      await createLemonSqueezyBillingPortalSession(params);

    if (error ?? !data) {
      logger.error(
        {
          ...ctx,
          error: error?.message,
        },
        'Failed to create billing portal session',
      );

      throw new Error('Failed to create billing portal session');
    }

    logger.info(ctx, 'Billing portal session created successfully');

    return { url: data };
  }

  async cancelSubscription(
    params: z.infer<typeof CancelSubscriptionParamsSchema>,
  ) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      subscriptionId: params.subscriptionId,
    };

    logger.info(ctx, 'Cancelling subscription...');

    try {
      const { error } = await cancelSubscription(params.subscriptionId);

      if (error) {
        logger.error(
          {
            ...ctx,
            error: error.message,
          },
          'Failed to cancel subscription',
        );

        throw new Error('Failed to cancel subscription');
      }

      logger.info(ctx, 'Subscription cancelled successfully');

      return { success: true };
    } catch (error) {
      logger.error(
        {
          ...ctx,
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

    const ctx = {
      name: this.namespace,
      sessionId: params.sessionId,
    };

    logger.info(ctx, 'Retrieving checkout session...');

    const { data: session, error } = await getCheckout(params.sessionId);

    if (error ?? !session?.data) {
      logger.error(
        {
          ...ctx,
          error: error?.message,
        },
        'Failed to retrieve checkout session',
      );

      throw new Error('Failed to retrieve checkout session');
    }

    logger.info(ctx, 'Checkout session retrieved successfully');

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

    const ctx = {
      name: this.namespace,
      subscriptionItemId: params.subscriptionItemId,
    };

    logger.info(ctx, 'Reporting usage...');

    const { error } = await createUsageRecord({
      quantity: params.usage.quantity,
      subscriptionItemId: params.subscriptionItemId,
      action: params.usage.action,
    });

    if (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to report usage',
      );

      throw new Error('Failed to report usage');
    }

    logger.info(ctx, 'Usage reported successfully');

    return { success: true };
  }

  async updateSubscription(
    params: z.infer<typeof UpdateSubscriptionParamsSchema>,
  ) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
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

      throw new Error('Failed to update subscription');
    }

    logger.info(ctx, 'Subscription updated successfully');

    return { success: true };
  }

  async getPlanById(planId: string) {
    const logger = await getLogger();

    const ctx = {
      name: this.namespace,
      planId,
    };

    logger.info(ctx, 'Retrieving plan by ID...');

    const { error, data } = await getVariant(planId);

    if (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to retrieve plan by ID',
      );

      throw new Error('Failed to retrieve plan by ID');
    }

    if (!data) {
      logger.error(
        {
          ...ctx,
        },
        'Plan not found',
      );

      throw new Error('Plan not found');
    }

    logger.info(ctx, 'Plan retrieved successfully');

    const attrs = data.data.attributes;

    return {
      id: data.data.id,
      name: attrs.name,
      interval: attrs.interval ?? '',
      amount: attrs.price,
    };
  }
}
