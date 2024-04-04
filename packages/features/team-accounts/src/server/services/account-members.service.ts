import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';
import { z } from 'zod';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { RemoveMemberSchema } from '../../schema/remove-member.schema';
import { TransferOwnershipConfirmationSchema } from '../../schema/transfer-ownership-confirmation.schema';
import { UpdateMemberRoleSchema } from '../../schema/update-member-role.schema';
import { AccountPerSeatBillingService } from './account-per-seat-billing.service';

export class AccountMembersService {
  private readonly namespace = 'account-members';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async removeMemberFromAccount(params: z.infer<typeof RemoveMemberSchema>) {
    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    Logger.info(ctx, `Removing member from account...`);

    const { data, error } = await this.client
      .from('accounts_memberships')
      .delete()
      .match({
        account_id: params.accountId,
        user_id: params.userId,
      });

    if (error) {
      Logger.error(
        {
          ...ctx,
          error,
        },
        `Failed to remove member from account`,
      );

      throw error;
    }

    Logger.info(
      ctx,
      `Successfully removed member from account. Verifying seat count...`,
    );

    const service = new AccountPerSeatBillingService(this.client);

    await service.decreaseSeats(params.accountId);

    return data;
  }

  async updateMemberRole(params: z.infer<typeof UpdateMemberRoleSchema>) {
    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    Logger.info(ctx, `Updating member role...`);

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
      Logger.error(
        {
          ...ctx,
          error,
        },
        `Failed to update member role`,
      );

      throw error;
    }

    Logger.info(ctx, `Successfully updated member role`);

    return data;
  }

  async transferOwnership(
    params: z.infer<typeof TransferOwnershipConfirmationSchema>,
  ) {
    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    Logger.info(ctx, `Transferring ownership of account...`);

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
