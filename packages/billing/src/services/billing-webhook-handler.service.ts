import { Database } from '@kit/supabase/database';

type UpsertSubscriptionParams =
  Database['public']['Functions']['upsert_subscription']['Args'];

/**
 * Represents an abstract class for handling billing webhook events.
 */
export abstract class BillingWebhookHandlerService {
  abstract verifyWebhookSignature(request: Request): Promise<unknown>;

  abstract handleWebhookEvent(
    event: unknown,
    params: {
      onCheckoutSessionCompleted: (
        subscription: UpsertSubscriptionParams,
        customerId: string,
      ) => Promise<unknown>;

      onSubscriptionUpdated: (
        subscription: UpsertSubscriptionParams,
        customerId: string,
      ) => Promise<unknown>;

      onSubscriptionDeleted: (subscriptionId: string) => Promise<unknown>;
    },
  ): Promise<unknown>;
}
