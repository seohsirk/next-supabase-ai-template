import { z } from 'zod';

import {
  CancelSubscriptionParamsSchema,
  CreateBillingCheckoutSchema,
  CreateBillingPortalSessionSchema,
  RetrieveCheckoutSessionSchema,
} from '../schema';

export abstract class BillingStrategyProviderService {
  abstract createBillingPortalSession(
    params: z.infer<typeof CreateBillingPortalSessionSchema>,
  ): Promise<{
    url: string;
  }>;

  abstract retrieveCheckoutSession(
    params: z.infer<typeof RetrieveCheckoutSessionSchema>,
  ): Promise<{
    checkoutToken: string | null;
    status: 'complete' | 'expired' | 'open';
    isSessionOpen: boolean;

    customer: {
      email: string | null;
    };
  }>;

  abstract createCheckoutSession(
    params: z.infer<typeof CreateBillingCheckoutSchema>,
  ): Promise<{
    checkoutToken: string;
  }>;

  abstract cancelSubscription(
    params: z.infer<typeof CancelSubscriptionParamsSchema>,
  ): Promise<{
    success: boolean;
  }>;
}
