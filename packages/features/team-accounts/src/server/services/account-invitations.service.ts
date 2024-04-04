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
  private readonly namespace = 'invitations';

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
    accountSlug,
    invitations,
  }: {
    invitations: z.infer<typeof InviteMembersSchema>['invitations'];
    accountSlug: string;
  }) {
    Logger.info(
      {
        account: accountSlug,
        invitations,
        name: this.namespace,
      },
      'Storing invitations',
    );

    const accountResponse = await this.client
      .from('accounts')
      .select('name')
      .eq('slug', accountSlug)
      .single();

    if (!accountResponse.data) {
      Logger.error(
        {
          accountSlug,
          name: this.namespace,
        },
        'Account not found in database. Cannot send invitations.',
      );

      throw new Error('Account not found');
    }

    const response = await this.client.rpc('add_invitations_to_account', {
      invitations,
      account_slug: accountSlug,
    });

    if (response.error) {
      Logger.error(
        {
          accountSlug,
          error: response.error,
          name: this.namespace,
        },
        `Failed to add invitations to account ${accountSlug}`,
      );

      throw response.error;
    }

    const responseInvitations = Array.isArray(response.data)
      ? response.data
      : [response.data];

    Logger.info(
      {
        account: accountSlug,
        count: responseInvitations.length,
        name: this.namespace,
      },
      'Invitations added to account',
    );
  }

  /**
   * Accepts an invitation to join a team.
   */
  async acceptInvitationToTeam(
    adminClient: SupabaseClient<Database>,
    params: {
      userId: string;
      inviteToken: string;
    },
  ) {
    const { error, data } = await adminClient.rpc('accept_invitation', {
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
