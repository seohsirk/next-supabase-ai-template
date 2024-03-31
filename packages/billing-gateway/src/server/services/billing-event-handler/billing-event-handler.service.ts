import { SupabaseClient } from '@supabase/supabase-js';

import { BillingWebhookHandlerService } from '@kit/billing';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

export class BillingEventHandlerService {
  constructor(
    private readonly clientProvider: () => SupabaseClient<Database>,
    private readonly strategy: BillingWebhookHandlerService,
  ) {}

  async handleWebhookEvent(request: Request) {
    const event = await this.strategy.verifyWebhookSignature(request);

    if (!event) {
      throw new Error('Invalid signature');
    }

    return this.strategy.handleWebhookEvent(event, {
      onSubscriptionDeleted: async (subscriptionId: string) => {
        const client = this.clientProvider();

        // Handle the subscription deleted event
        // here we delete the subscription from the database
        Logger.info(
          {
            namespace: 'billing',
            subscriptionId,
          },
          'Processing subscription deleted event',
        );

        const { error } = await client
          .from('subscriptions')
          .delete()
          .match({ id: subscriptionId });

        if (error) {
          throw new Error('Failed to delete subscription');
        }

        Logger.info(
          {
            namespace: 'billing',
            subscriptionId,
          },
          'Successfully deleted subscription',
        );
      },
      onSubscriptionUpdated: async (subscription) => {
        const client = this.clientProvider();

        const ctx = {
          namespace: 'billing',
          subscriptionId: subscription.subscription_id,
          provider: subscription.billing_provider,
          accountId: subscription.account_id,
          customerId: subscription.customer_id,
        };

        Logger.info(ctx, 'Processing subscription updated event');

        // Handle the subscription updated event
        // here we update the subscription in the database
        const { error } = await client.rpc('upsert_subscription', {
          ...subscription,
          customer_id: subscription.customer_id,
          account_id: subscription.account_id,
        });

        if (error) {
          Logger.error(
            {
              error,
              ...ctx,
            },
            'Failed to update subscription',
          );

          throw new Error('Failed to update subscription');
        }

        Logger.info(ctx, 'Successfully updated subscription');
      },
      onCheckoutSessionCompleted: async (subscription, customerId) => {
        // Handle the checkout session completed event
        // here we add the subscription to the database
        const client = this.clientProvider();

        const ctx = {
          namespace: 'billing',
          subscriptionId: subscription.subscription_id,
          provider: subscription.billing_provider,
          accountId: subscription.account_id,
        };

        Logger.info(ctx, 'Processing checkout session completed event...');

        const { error } = await client.rpc('upsert_subscription', {
          ...subscription,
          customer_id: customerId,
        });

        if (error) {
          Logger.error({ ...ctx, error }, 'Failed to add subscription');

          throw new Error('Failed to add subscription');
        }

        Logger.info(ctx, 'Successfully added subscription');
      },
    });
  }
}
