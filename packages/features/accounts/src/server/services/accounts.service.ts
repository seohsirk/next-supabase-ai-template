import { SupabaseClient } from '@supabase/supabase-js';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

/**
 * @name AccountsService
 * @description Service for managing accounts in the application
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const accountsService = new AccountsService(client);
 *
 * accountsService.createNewOrganizationAccount({
 *  name: 'My Organization',
 *  userId: '123',
 *  });
 */
export class AccountsService {
  private readonly logger = new AccountsServiceLogger();

  constructor(private readonly client: SupabaseClient<Database>) {}

  createNewOrganizationAccount(params: { name: string; userId: string }) {
    this.logger.logCreateNewOrganizationAccount(params);

    return this.client.rpc('create_account', {
      account_name: params.name,
    });
  }
}

class AccountsServiceLogger {
  private namespace = 'accounts';

  logCreateNewOrganizationAccount(params: { name: string; userId: string }) {
    Logger.info(
      this.withNamespace(params),
      `Creating new organization account...`,
    );
  }

  private withNamespace(params: object) {
    return { ...params, name: this.namespace };
  }
}
