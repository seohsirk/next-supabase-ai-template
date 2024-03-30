import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';

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
    params: {
      accountId: string;
      userId: string;
    },
  ) {
    Logger.info(
      {
        name: this.namespace,
        accountId: params.accountId,
        userId: params.userId,
      },
      `Requested team account deletion. Processing...`,
    );

    // we can use the admin client to delete the account.
    const { error } = await adminClient
      .from('accounts')
      .delete()
      .eq('id', params.accountId);

    if (error) {
      Logger.error(
        {
          name: this.namespace,
          accountId: params.accountId,
          userId: params.userId,
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
        userId: params.userId,
      },
      'Successfully deleted team account',
    );
  }
}
