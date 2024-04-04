import { SupabaseClient } from '@supabase/supabase-js';

import { BillingGatewayService } from '@kit/billing-gateway';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

export class AccountPerSeatBillingService {
  private readonly namespace = 'accounts.per-seat-billing';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async getPerSeatSubscriptionItem(accountId: string) {
    Logger.info(
      {
        name: this.namespace,
        accountId,
      },
      `Getting per-seat subscription item for account ${accountId}...`,
    );

    const { data, error } = await this.client
      .from('subscriptions')
      .select(
        `
          provider: billing_provider,
          id,
          subscription_items !inner (
            quantity,
            id: variant_id,
            type
          )
        `,
      )
      .eq('account_id', accountId)
      .eq('subscription_items.type', 'per-seat')
      .maybeSingle();

    if (error) {
      Logger.info(
        {
          name: this.namespace,
          accountId,
          error,
        },
        `Failed to get per-seat subscription item for account ${accountId}`,
      );

      throw error;
    }

    if (!data?.subscription_items) {
      Logger.info(
        { name: this.namespace, accountId },
        `No per-seat subscription item found for account ${accountId}. Exiting...`,
      );

      return;
    }

    Logger.info(
      {
        name: this.namespace,
        accountId,
      },
      `Per-seat subscription item found for account ${accountId}. Will update...`,
    );

    return data;
  }

  async increaseSeats(accountId: string) {
    const subscription = await this.getPerSeatSubscriptionItem(accountId);

    if (!subscription) {
      return;
    }

    const subscriptionItems = subscription.subscription_items.filter((item) => {
      return item.type === 'per_seat';
    });

    if (!subscriptionItems.length) {
      return;
    }

    const billingGateway = new BillingGatewayService(subscription.provider);

    Logger.info(
      {
        name: this.namespace,
        accountId,
        subscriptionItems,
      },
      `Increasing seats for account ${accountId}...`,
    );

    const promises = subscriptionItems.map(async (item) => {
      try {
        Logger.info(
          {
            name: this.namespace,
            accountId,
            subscriptionItemId: item.id,
            quantity: item.quantity + 1,
          },
          `Updating subscription item...`,
        );

        await billingGateway.updateSubscriptionItem({
          subscriptionId: subscription.id,
          subscriptionItemId: item.id,
          quantity: item.quantity + 1,
        });

        Logger.info(
          {
            name: this.namespace,
            accountId,
            subscriptionItemId: item.id,
            quantity: item.quantity + 1,
          },
          `Subscription item updated successfully`,
        );
      } catch (error) {
        Logger.error(
          {
            name: this.namespace,
            accountId,
            error,
          },
          `Failed to increase seats for account ${accountId}`,
        );
      }
    });

    await Promise.all(promises);
  }

  async decreaseSeats(accountId: string) {
    const subscription = await this.getPerSeatSubscriptionItem(accountId);

    if (!subscription) {
      return;
    }

    const subscriptionItems = subscription.subscription_items.filter((item) => {
      return item.type === 'per_seat';
    });

    if (!subscriptionItems.length) {
      return;
    }

    Logger.info(
      {
        name: this.namespace,
        accountId,
        subscriptionItems,
      },
      `Decreasing seats for account ${accountId}...`,
    );

    const billingGateway = new BillingGatewayService(subscription.provider);

    const promises = subscriptionItems.map(async (item) => {
      try {
        Logger.info(
          {
            name: this.namespace,
            accountId,
            subscriptionItemId: item.id,
            quantity: item.quantity - 1,
          },
          `Updating subscription item...`,
        );

        await billingGateway.updateSubscriptionItem({
          subscriptionId: subscription.id,
          subscriptionItemId: item.id,
          quantity: item.quantity - 1,
        });

        Logger.info(
          {
            name: this.namespace,
            accountId,
            subscriptionItemId: item.id,
            quantity: item.quantity - 1,
          },
          `Subscription item updated successfully`,
        );
      } catch (error) {
        Logger.error(
          {
            name: this.namespace,
            accountId,
            error,
          },
          `Failed to decrease seats for account ${accountId}`,
        );
      }
    });

    await Promise.all(promises);
  }
}
