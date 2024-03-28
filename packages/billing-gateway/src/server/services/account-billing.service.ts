import { SupabaseClient } from '@supabase/supabase-js';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { BillingGatewayService } from './billing-gateway/billing-gateway.service';

export class AccountBillingService {
  private readonly namespace = 'accounts.billing';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async cancelAllAccountSubscriptions({
    accountId,
    userId,
  }: {
    accountId: string;
    userId: string;
  }) {
    Logger.info(
      {
        userId,
        accountId,
        name: this.namespace,
      },
      'Cancelling all subscriptions for account...',
    );

    const { data: subscriptions } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('account_id', accountId);

    const cancellationRequests = [];

    Logger.info(
      {
        userId,
        subscriptions: subscriptions?.length ?? 0,
        name: this.namespace,
      },
      'Cancelling all account subscriptions...',
    );

    for (const subscription of subscriptions ?? []) {
      const gateway = new BillingGatewayService(subscription.billing_provider);

      cancellationRequests.push(
        gateway.cancelSubscription({
          subscriptionId: subscription.id,
          invoiceNow: true,
        }),
      );
    }

    // execute all cancellation requests
    await Promise.all(cancellationRequests);

    Logger.info(
      {
        userId,
        subscriptions: subscriptions?.length ?? 0,
        name: this.namespace,
      },
      'Subscriptions cancelled successfully',
    );
  }
}
