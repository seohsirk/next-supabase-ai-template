import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';

import { AccountBillingService } from '@kit/billing-gateway';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

export class DeleteTeamAccountService {
  private readonly namespace = 'accounts.delete';

  /**
   * Deletes a team account. Permissions are not checked here, as they are
   * checked in the server action.
   *
   * USE WITH CAUTION. THE USER MUST HAVE THE NECESSARY PERMISSIONS.
   *
   * @param adminClient
   * @param params
   */
  async deleteTeamAccount(
    adminClient: SupabaseClient<Database>,
    params: { accountId: string },
  ) {
    Logger.info(
      {
        name: this.namespace,
        accountId: params.accountId,
      },
      `Requested team account deletion. Processing...`,
    );

    Logger.info(
      {
        name: this.namespace,
        accountId: params.accountId,
      },
      `Deleting all account subscriptions...`,
    );

    // First - we want to cancel all Stripe active subscriptions
    const billingService = new AccountBillingService(adminClient);

    await billingService.cancelAllAccountSubscriptions(params.accountId);

    // now we can use the admin client to delete the account.
    const { error } = await adminClient
      .from('accounts')
      .delete()
      .eq('id', params.accountId);

    if (error) {
      Logger.error(
        {
          name: this.namespace,
          accountId: params.accountId,
          error,
        },
        'Failed to delete team account',
      );

      throw new Error('Failed to delete team account');
    }

    Logger.info(
      {
        name: this.namespace,
        accountId: params.accountId,
      },
      'Successfully deleted team account',
    );
  }
}
