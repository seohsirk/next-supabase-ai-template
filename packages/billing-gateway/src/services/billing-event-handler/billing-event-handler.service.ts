import { SupabaseClient } from '@supabase/supabase-js';

import { BillingWebhookHandlerService } from '@kit/billing';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

export class BillingEventHandlerService {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly strategy: BillingWebhookHandlerService,
  ) {}

  async handleWebhookEvent(request: Request) {
    const event = await this.strategy.verifyWebhookSignature(request);

    if (!event) {
      throw new Error('Invalid signature');
    }

    return this.strategy.handleWebhookEvent(event, {
      onSubscriptionDeleted: async (subscriptionId: string) => {
        // Handle the subscription deleted event
        // here we delete the subscription from the database
        Logger.info(
          {
            namespace: 'billing',
            subscriptionId,
          },
          'Processing subscription deleted event',
        );

        const { error } = await this.client
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
        const ctx = {
          namespace: 'billing',
          subscriptionId: subscription.id,
          provider: subscription.billing_provider,
          accountId: subscription.account_id,
        };

        Logger.info(ctx, 'Processing subscription updated event');

        // Handle the subscription updated event
        // here we update the subscription in the database
        const { error } = await this.client
          .from('subscriptions')
          .update(subscription)
          .match({ id: subscription.id });

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
      onCheckoutSessionCompleted: async (subscription) => {
        // Handle the checkout session completed event
        // here we add the subscription to the database
        const ctx = {
          namespace: 'billing',
          subscriptionId: subscription.id,
          provider: subscription.billing_provider,
          accountId: subscription.account_id,
        };

        Logger.info(ctx, 'Processing checkout session completed event...');

        const { error } = await this.client.rpc('add_subscription', {
          subscription,
        });

        if (error) {
          Logger.error(ctx, 'Failed to add subscription');

          throw new Error('Failed to add subscription');
        }

        Logger.info(ctx, 'Successfully added subscription');
      },
    });
  }
}
