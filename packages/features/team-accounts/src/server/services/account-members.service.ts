import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';

import { Database } from '@kit/supabase/database';

export class AccountMembersService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async removeMemberFromAccount(params: { accountId: string; userId: string }) {
    const { data, error } = await this.client
      .from('accounts_memberships')
      .delete()
      .match({
        account_id: params.accountId,
        user_id: params.userId,
      });

    if (error) {
      throw error;
    }

    return data;
  }

  async updateMemberRole(params: {
    accountId: string;
    userId: string;
    role: string;
  }) {
    const { data, error } = await this.client
      .from('accounts_memberships')
      .update({
        account_role: params.role,
      })
      .match({
        account_id: params.accountId,
        user_id: params.userId,
      });

    if (error) {
      throw error;
    }

    return data;
  }

  async transferOwnership(params: { accountId: string; userId: string }) {
    const { data, error } = await this.client
      .from('accounts')
      .update({
        primary_owner_user_id: params.userId,
      })
      .match({
        id: params.accountId,
        user_id: params.userId,
      });

    if (error) {
      throw error;
    }

    return data;
  }
}
