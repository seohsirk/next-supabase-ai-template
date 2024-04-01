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

import { createLemonSqueezyBillingPortalSession } from './create-lemon-squeezy-billing-portal-session';
import { createLemonSqueezyCheckout } from './create-lemon-squeezy-checkout';

export class LemonSqueezyBillingStrategyService
  implements BillingStrategyProviderService
{
  async createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ) {
    const { data: response } = await createLemonSqueezyCheckout(params);

    if (!response?.data.id) {
      throw new Error('Failed to create checkout session');
    }

    return { checkoutToken: response.data.id };
  }

  async createBillingPortalSession(
    params: z.infer<typeof CreateBillingPortalSessionSchema>,
  ) {
    const url = await createLemonSqueezyBillingPortalSession(params);

    if (!url) {
      throw new Error('Failed to create billing portal session');
    }

    return { url };
  }

  async cancelSubscription(
    params: z.infer<typeof CancelSubscriptionParamsSchema>,
  ) {
    await cancelSubscription(params.subscriptionId);

    return { success: true };
  }

  async retrieveCheckoutSession(
    params: z.infer<typeof RetrieveCheckoutSessionSchema>,
  ) {
    const session = await getCheckout(params.sessionId);

    if (!session.data) {
      throw new Error('Failed to retrieve checkout session');
    }

    const data = session.data.data;

    return {
      checkoutToken: data.id,
      isSessionOpen: false,
      status: 'complete' as const,
      customer: {
        email: data.attributes.checkout_data.email,
      },
    };
  }

  async reportUsage(params: z.infer<typeof ReportBillingUsageSchema>) {
    const { error } = await createUsageRecord({
      quantity: params.usage.quantity,
      subscriptionItemId: params.subscriptionId,
    });

    if (error) {
      throw new Error('Failed to report usage');
    }

    return { success: true };
  }
}
