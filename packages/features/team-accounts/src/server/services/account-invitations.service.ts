import { SupabaseClient } from '@supabase/supabase-js';

import { addDays, formatISO } from 'date-fns';
import 'server-only';
import { z } from 'zod';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { DeleteInvitationSchema } from '../../schema/delete-invitation.schema';
import { InviteMembersSchema } from '../../schema/invite-members.schema';
import { UpdateInvitationSchema } from '../../schema/update-invitation.schema';

export class AccountInvitationsService {
  private namespace = 'accounts.invitations';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async deleteInvitation(params: z.infer<typeof DeleteInvitationSchema>) {
    Logger.info('Removing invitation', {
      name: this.namespace,
      ...params,
    });

    const { data, error } = await this.client
      .from('invitations')
      .delete()
      .match({
        id: params.invitationId,
      });

    if (error) {
      throw error;
    }

    Logger.info('Invitation successfully removed', {
      ...params,
      name: this.namespace,
    });

    return data;
  }

  async updateInvitation(params: z.infer<typeof UpdateInvitationSchema>) {
    Logger.info('Updating invitation', {
      ...params,
      name: this.namespace,
    });

    const { data, error } = await this.client
      .from('invitations')
      .update({
        role: params.role,
      })
      .match({
        id: params.invitationId,
      });

    if (error) {
      throw error;
    }

    Logger.info('Invitation successfully updated', {
      ...params,
      name: this.namespace,
    });

    return data;
  }

  async sendInvitations({
    account,
    invitations,
  }: {
    invitations: z.infer<typeof InviteMembersSchema>['invitations'];
    account: string;
  }) {
    Logger.info(
      { account, invitations, name: this.namespace },
      'Storing invitations',
    );

    const accountResponse = await this.client
      .from('accounts')
      .select('name')
      .eq('slug', account)
      .single();

    if (!accountResponse.data) {
      throw new Error('Account not found');
    }

    const response = await this.client.rpc('add_invitations_to_account', {
      invitations,
      account_slug: account,
    });

    if (response.error) {
      throw response.error;
    }

    const responseInvitations = Array.isArray(response.data)
      ? response.data
      : [response.data];

    Logger.info(
      {
        account,
        count: responseInvitations.length,
        name: this.namespace,
      },
      'Invitations added to account',
    );
  }

  /**
   * Accepts an invitation to join a team.
   */
  async acceptInvitationToTeam(params: {
    userId: string;
    inviteToken: string;
    adminClient: SupabaseClient<Database>;
  }) {
    const { error, data } = await params.adminClient.rpc('accept_invitation', {
      token: params.inviteToken,
      user_id: params.userId,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async renewInvitation(invitationId: number) {
    Logger.info('Renewing invitation', {
      invitationId,
      name: this.namespace,
    });

    const sevenDaysFromNow = formatISO(addDays(new Date(), 7));

    const { data, error } = await this.client
      .from('invitations')
      .update({
        expires_at: sevenDaysFromNow,
      })
      .match({
        id: invitationId,
      });

    if (error) {
      throw error;
    }

    Logger.info('Invitation successfully renewed', {
      invitationId,
      name: this.namespace,
    });

    return data;
  }
}
