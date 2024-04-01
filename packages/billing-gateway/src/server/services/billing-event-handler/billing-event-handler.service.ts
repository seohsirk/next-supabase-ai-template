import { SupabaseClient } from '@supabase/supabase-js';

import { BillingWebhookHandlerService } from '@kit/billing';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

export class BillingEventHandlerService {
  private readonly namespace = 'billing';

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
            namespace: this.namespace,
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
            namespace: this.namespace,
            subscriptionId,
          },
          'Successfully deleted subscription',
        );
      },
      onSubscriptionUpdated: async (subscription) => {
        const client = this.clientProvider();

        const ctx = {
          namespace: this.namespace,
          subscriptionId: subscription.target_subscription_id,
          provider: subscription.billing_provider,
          accountId: subscription.target_account_id,
          customerId: subscription.target_customer_id,
        };

        Logger.info(ctx, 'Processing subscription updated event');

        // Handle the subscription updated event
        // here we update the subscription in the database
        const { error } = await client.rpc('upsert_subscription', subscription);

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
      onCheckoutSessionCompleted: async (payload, customerId) => {
        // Handle the checkout session completed event
        // here we add the subscription to the database
        const client = this.clientProvider();

        // Check if the payload contains an order_id
        // if it does, we add an order, otherwise we add a subscription
        if ('order_id' in payload) {
          const ctx = {
            namespace: this.namespace,
            orderId: payload.order_id,
            provider: payload.billing_provider,
            accountId: payload.target_account_id,
            customerId,
          };

          Logger.info(ctx, 'Processing order completed event...');

          const { error } = await client.rpc('upsert_order', payload);

          if (error) {
            Logger.error({ ...ctx, error }, 'Failed to add order');

            throw new Error('Failed to add order');
          }

          Logger.info(ctx, 'Successfully added order');
        } else {
          const ctx = {
            namespace: this.namespace,
            subscriptionId: payload.target_subscription_id,
            provider: payload.billing_provider,
            accountId: payload.target_account_id,
            customerId,
          };

          Logger.info(ctx, 'Processing checkout session completed event...');

          const { error } = await client.rpc('upsert_subscription', payload);

          if (error) {
            Logger.error({ ...ctx, error }, 'Failed to add subscription');

            throw new Error('Failed to add subscription');
          }

          Logger.info(ctx, 'Successfully added subscription');
        }
      },
      onPaymentSucceeded: async (sessionId: string) => {
        const client = this.clientProvider();

        // Handle the payment succeeded event
        // here we update the payment status in the database
        Logger.info(
          {
            namespace: this.namespace,
            sessionId,
          },
          'Processing payment succeeded event',
        );

        const { error } = await client
          .from('orders')
          .update({ status: 'succeeded' })
          .match({ session_id: sessionId });

        if (error) {
          throw new Error('Failed to update payment status');
        }

        Logger.info(
          {
            namespace: 'billing',
            sessionId,
          },
          'Successfully updated payment status',
        );
      },
      onPaymentFailed: async (sessionId: string) => {
        const client = this.clientProvider();

        // Handle the payment failed event
        // here we update the payment status in the database
        Logger.info(
          {
            namespace: this.namespace,
            sessionId,
          },
          'Processing payment failed event',
        );

        const { error } = await client
          .from('orders')
          .update({ status: 'failed' })
          .match({ session_id: sessionId });

        if (error) {
          throw new Error('Failed to update payment status');
        }

        Logger.info(
          {
            namespace: this.namespace,
            sessionId,
          },
          'Successfully updated payment status',
        );
      },
    });
  }
}
