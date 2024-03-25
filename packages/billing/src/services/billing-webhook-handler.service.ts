import { Database } from '@kit/supabase/database';

type SubscriptionObject = Database['public']['Tables']['subscriptions'];

type SubscriptionInsertParams = Omit<
  SubscriptionObject['Insert'],
  'billing_customer_id'
>;

type SubscriptionUpdateParams = SubscriptionObject['Update'];

/**
 * Represents an abstract class for handling billing webhook events.
 */
export abstract class BillingWebhookHandlerService {
  abstract verifyWebhookSignature(request: Request): Promise<unknown>;

  abstract handleWebhookEvent(
    event: unknown,
    params: {
      onCheckoutSessionCompleted: (
        subscription: SubscriptionInsertParams,
      ) => Promise<unknown>;

      onSubscriptionUpdated: (
        subscription: SubscriptionUpdateParams,
      ) => Promise<unknown>;

      onSubscriptionDeleted: (subscriptionId: string) => Promise<unknown>;
    },
  ): Promise<unknown>;
}
