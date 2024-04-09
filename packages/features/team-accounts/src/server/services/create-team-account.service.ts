import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

export class CreateTeamAccountService {
  private readonly namespace = 'accounts.create-team-account';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async createNewOrganizationAccount(params: { name: string; userId: string }) {
    const logger = await getLogger();
    const ctx = { ...params, namespace: this.namespace };

    logger.info(ctx, `Creating new team account...`);

    return await this.client.rpc('create_account', {
      account_name: params.name,
    });
  }
}
