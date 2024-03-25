import { SupabaseClient } from '@supabase/supabase-js';

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
  constructor(private readonly client: SupabaseClient<Database>) {}

  async deletePersonalAccount(param: { userId: string }) {}
}
