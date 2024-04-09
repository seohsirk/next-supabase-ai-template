import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

export class AdminAccountsService {
  constructor(private adminClient: SupabaseClient<Database>) {}

  async deleteAccount(accountId: string) {
    const { error } = await this.adminClient
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      throw error;
    }
  }
}
