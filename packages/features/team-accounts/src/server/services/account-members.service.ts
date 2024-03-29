import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';
import { z } from 'zod';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { RemoveMemberSchema } from '../../schema/remove-member.schema';
import { TransferOwnershipConfirmationSchema } from '../../schema/transfer-ownership-confirmation.schema';
import { UpdateMemberRoleSchema } from '../../schema/update-member-role.schema';

export class AccountMembersService {
  private readonly namespace = 'account-members';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async removeMemberFromAccount(params: z.infer<typeof RemoveMemberSchema>) {
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

  async updateMemberRole(params: z.infer<typeof UpdateMemberRoleSchema>) {
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

  async transferOwnership(
    params: z.infer<typeof TransferOwnershipConfirmationSchema>,
  ) {
    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    Logger.info(ctx, `Transferring ownership of account`);

    const { data, error } = await this.client.rpc(
      'transfer_team_account_ownership',
      {
        target_account_id: params.accountId,
        new_owner_id: params.userId,
      },
    );

    if (error) {
      Logger.error(
        { ...ctx, error },
        `Failed to transfer ownership of account`,
      );

      throw error;
    }

    Logger.info(ctx, `Successfully transferred ownership of account`);

    return data;
  }
}
