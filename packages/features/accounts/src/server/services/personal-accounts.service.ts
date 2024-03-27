import { SupabaseClient } from '@supabase/supabase-js';

import { BillingGatewayService } from '@kit/billing-gateway';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

/**
 * @name PersonalAccountsService
 * @description Service for managing accounts in the application
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const accountsService = new AccountsService(client);
 */
export class PersonalAccountsService {
  private namespace = 'account';

  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * @name deletePersonalAccount
   * Delete personal account of a user.
   * This will delete the user from the authentication provider and cancel all subscriptions.
   */
  async deletePersonalAccount(
    adminClient: SupabaseClient<Database>,
    params: { userId: string },
  ) {
    Logger.info(
      { userId: params.userId, name: this.namespace },
      'User requested deletion. Processing...',
    );

    try {
      await adminClient.auth.admin.deleteUser(params.userId);
    } catch (error) {
      Logger.error(
        {
          userId: params.userId,
          error,
          name: this.namespace,
        },
        'Error deleting user',
      );

      throw new Error('Error deleting user');
    }

    try {
      await this.cancelAllUserSubscriptions(params.userId);
    } catch (error) {
      Logger.error({
        userId: params.userId,
        error,
        name: this.namespace,
      });
    }
  }

  private async cancelAllUserSubscriptions(userId: string) {
    Logger.info(
      {
        userId,
        name: this.namespace,
      },
      'Cancelling all subscriptions for user...',
    );

    const { data: subscriptions } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('account_id', userId);

    const cancellationRequests = [];

    Logger.info(
      {
        userId,
        subscriptions: subscriptions?.length ?? 0,
        name: this.namespace,
      },
      'Cancelling subscriptions...',
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
