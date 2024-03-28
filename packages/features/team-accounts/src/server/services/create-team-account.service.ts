import { SupabaseClient } from '@supabase/supabase-js';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

export class CreateTeamAccountService {
  private readonly namespace = 'accounts.create-team-account';

  constructor(private readonly client: SupabaseClient<Database>) {}

  createNewOrganizationAccount(params: { name: string; userId: string }) {
    Logger.info(
      { ...params, namespace: this.namespace },
      `Creating new team account...`,
    );

    return this.client.rpc('create_account', {
      account_name: params.name,
    });
  }
}
