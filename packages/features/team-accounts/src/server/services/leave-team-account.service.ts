import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';
import { z } from 'zod';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

const Schema = z.object({
  accountId: z.string(),
  userId: z.string(),
});

export class LeaveTeamAccountService {
  private readonly namespace = 'leave-team-account';

  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  async leaveTeamAccount(params: z.infer<typeof Schema>) {
    const ctx = {
      ...params,
      name: this.namespace,
    };

    Logger.info(ctx, 'Leaving team account');

    const { accountId, userId } = Schema.parse(params);

    const { error } = await this.adminClient
      .from('accounts_memberships')
      .delete()
      .match({
        account_id: accountId,
        user_id: userId,
      });

    if (error) {
      Logger.error({ ...ctx, error }, 'Failed to leave team account');

      throw new Error('Failed to leave team account');
    }

    Logger.info(ctx, 'Successfully left team account');
  }
}
