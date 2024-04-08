import { SupabaseClient } from '@supabase/supabase-js';

import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

export class CreateTeamAccountService {
  private readonly namespace = 'accounts.create-team-account';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async createNewOrganizationAccount(params: { name: string; userId: string }) {
    const logger = await getLogger();

    logger.info(
      { ...params, namespace: this.namespace },
      `Creating new team account...`,
    );

    return await this.client.rpc('create_account', {
      account_name: params.name,
    });
  }
}
