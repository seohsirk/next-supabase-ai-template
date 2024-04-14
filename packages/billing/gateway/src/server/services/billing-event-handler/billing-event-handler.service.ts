import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { BillingWebhookHandlerService } from '@kit/billing';
import { getLogger } from '@kit/shared/logger';
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
        const logger = await getLogger();

        const ctx = {
          namespace: this.namespace,
          subscriptionId,
        };

        // Handle the subscription deleted event
        // here we delete the subscription from the database
        logger.info(ctx, 'Processing subscription deleted event');

        const { error } = await client
          .from('subscriptions')
          .delete()
          .match({ id: subscriptionId });

        if (error) {
          logger.error(
            {
              error,
              ...ctx,
            },
            `Failed to delete subscription`,
          );

          throw new Error('Failed to delete subscription');
        }

        logger.info(ctx, 'Successfully deleted subscription');
      },
      onSubscriptionUpdated: async (subscription) => {
        const client = this.clientProvider();
        const logger = await getLogger();

        const ctx = {
          namespace: this.namespace,
          subscriptionId: subscription.target_subscription_id,
          provider: subscription.billing_provider,
          accountId: subscription.target_account_id,
          customerId: subscription.target_customer_id,
        };

        logger.info(ctx, 'Processing subscription updated event ...');

        // Handle the subscription updated event
        // here we update the subscription in the database
        const { error } = await client.rpc('upsert_subscription', subscription);

        if (error) {
          logger.error(
            {
              error,
              ...ctx,
            },
            'Failed to update subscription',
          );

          throw new Error('Failed to update subscription');
        }

        logger.info(ctx, 'Successfully updated subscription');
      },
      onCheckoutSessionCompleted: async (payload) => {
        // Handle the checkout session completed event
        // here we add the subscription to the database
        const client = this.clientProvider();
        const logger = await getLogger();

        // Check if the payload contains an order_id
        // if it does, we add an order, otherwise we add a subscription
        if ('target_order_id' in payload) {
          const ctx = {
            namespace: this.namespace,
            orderId: payload.target_order_id,
            provider: payload.billing_provider,
            accountId: payload.target_account_id,
            customerId: payload.target_customer_id,
          };

          logger.info(ctx, 'Processing order completed event...');

          const { error } = await client.rpc('upsert_order', payload);

          if (error) {
            logger.error({ ...ctx, error }, 'Failed to add order');

            throw new Error('Failed to add order');
          }

          logger.info(ctx, 'Successfully added order');
        } else {
          const ctx = {
            namespace: this.namespace,
            subscriptionId: payload.target_subscription_id,
            provider: payload.billing_provider,
            accountId: payload.target_account_id,
            customerId: payload.target_customer_id,
          };

          logger.info(ctx, 'Processing checkout session completed event...');

          const { error } = await client.rpc('upsert_subscription', payload);

          if (error) {
            logger.error({ ...ctx, error }, 'Failed to add subscription');

            throw new Error('Failed to add subscription');
          }

          logger.info(ctx, 'Successfully added subscription');
        }
      },
      onPaymentSucceeded: async (sessionId: string) => {
        const client = this.clientProvider();
        const logger = await getLogger();

        const ctx = {
          namespace: this.namespace,
          sessionId,
        };

        // Handle the payment succeeded event
        // here we update the payment status in the database
        logger.info(ctx, 'Processing payment succeeded event...');

        const { error } = await client
          .from('orders')
          .update({ status: 'succeeded' })
          .match({ session_id: sessionId });

        if (error) {
          logger.error(
            {
              error,
              ...ctx,
            },
            'Failed to update payment status',
          );

          throw new Error('Failed to update payment status');
        }

        logger.info(ctx, 'Successfully updated payment status');
      },
      onPaymentFailed: async (sessionId: string) => {
        const client = this.clientProvider();
        const logger = await getLogger();

        const ctx = {
          namespace: this.namespace,
          sessionId,
        };

        // Handle the payment failed event
        // here we update the payment status in the database
        logger.info(ctx, 'Processing payment failed event');

        const { error } = await client
          .from('orders')
          .update({ status: 'failed' })
          .match({ session_id: sessionId });

        if (error) {
          logger.error(
            {
              error,
              ...ctx,
            },
            'Failed to update payment status',
          );

          throw new Error('Failed to update payment status');
        }

        logger.info(ctx, 'Successfully updated payment status');
      },
    });
  }
}
