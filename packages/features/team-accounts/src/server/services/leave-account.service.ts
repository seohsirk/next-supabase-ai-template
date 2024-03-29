import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';
import { z } from 'zod';

import { Database } from '@kit/supabase/database';

import { LeaveTeamAccountSchema } from '../../schema/leave-team-account.schema';

export class LeaveAccountService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async leaveTeamAccount(params: z.infer<typeof LeaveTeamAccountSchema>) {
    await Promise.resolve();

    console.log(params);
    // TODO
    // implement this method
  }
}
