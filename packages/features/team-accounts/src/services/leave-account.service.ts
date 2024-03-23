import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';

import { Database } from '@kit/supabase/database';

export class LeaveAccountService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async leaveTeamAccount(params: { accountId: string; userId: string }) {
    // TODO
    // implement this method
  }
}
