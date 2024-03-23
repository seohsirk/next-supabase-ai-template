import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';

import { Database } from '@kit/supabase/database';

export class DeleteAccountService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async deleteTeamAccount(params: { accountId: string }) {
    // TODO
    // implement this method
  }
}
