import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';
import { z } from 'zod';

import { Database } from '@kit/supabase/database';

const Schema = z.object({
  accountId: z.string(),
  userId: z.string(),
});

export class LeaveTeamAccountService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  async leaveTeamAccount(params: z.infer<typeof Schema>) {
    const { accountId, userId } = Schema.parse(params);

    const { error } = await this.adminClient
      .from('accounts_memberships')
      .delete()
      .match({
        account_id: accountId,
        user_id: userId,
      });

    if (error) {
      throw error;
    }
  }
}
