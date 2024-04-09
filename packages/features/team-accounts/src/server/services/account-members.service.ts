import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { RemoveMemberSchema } from '../../schema/remove-member.schema';
import { TransferOwnershipConfirmationSchema } from '../../schema/transfer-ownership-confirmation.schema';
import { UpdateMemberRoleSchema } from '../../schema/update-member-role.schema';
import { AccountPerSeatBillingService } from './account-per-seat-billing.service';

export class AccountMembersService {
  private readonly namespace = 'account-members';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async removeMemberFromAccount(params: z.infer<typeof RemoveMemberSchema>) {
    const logger = await getLogger();

    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    logger.info(ctx, `Removing member from account...`);

    const { data, error } = await this.client
      .from('accounts_memberships')
      .delete()
      .match({
        account_id: params.accountId,
        user_id: params.userId,
      });

    if (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        `Failed to remove member from account`,
      );

      throw error;
    }

    logger.info(
      ctx,
      `Successfully removed member from account. Verifying seat count...`,
    );

    const service = new AccountPerSeatBillingService(this.client);

    await service.decreaseSeats(params.accountId);

    return data;
  }

  async updateMemberRole(params: z.infer<typeof UpdateMemberRoleSchema>) {
    const logger = await getLogger();

    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    logger.info(ctx, `Updating member role...`);

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
      logger.error(
        {
          ...ctx,
          error,
        },
        `Failed to update member role`,
      );

      throw error;
    }

    logger.info(ctx, `Successfully updated member role`);

    return data;
  }

  async transferOwnership(
    params: z.infer<typeof TransferOwnershipConfirmationSchema>,
  ) {
    const logger = await getLogger();

    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    logger.info(ctx, `Transferring ownership of account...`);

    const { data, error } = await this.client.rpc(
      'transfer_team_account_ownership',
      {
        target_account_id: params.accountId,
        new_owner_id: params.userId,
      },
    );

    if (error) {
      logger.error(
        { ...ctx, error },
        `Failed to transfer ownership of account`,
      );

      throw error;
    }

    logger.info(ctx, `Successfully transferred ownership of account`);

    return data;
  }
}
