import { SupabaseClient } from '@supabase/supabase-js';

import 'server-only';
import { z } from 'zod';

import { Mailer } from '@kit/mailers';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';
import { requireAuth } from '@kit/supabase/require-auth';

import { DeleteInvitationSchema } from '../../schema/delete-invitation.schema';
import { InviteMembersSchema } from '../../schema/invite-members.schema';
import { UpdateInvitationSchema } from '../../schema/update-invitation-schema';

const invitePath = process.env.INVITATION_PAGE_PATH;
const siteURL = process.env.NEXT_PUBLIC_SITE_URL;
const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? '';
const emailSender = process.env.EMAIL_SENDER;

const env = z
  .object({
    invitePath: z.string().min(1),
    siteURL: z.string().min(1),
    productName: z.string(),
    emailSender: z.string().email(),
  })
  .parse({
    invitePath,
    siteURL,
    productName,
    emailSender,
  });

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

    const mailer = new Mailer();

    const { user } = await this.getUser();

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

    const promises = [];

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

    Logger.info(
      {
        account,
        count: responseInvitations.length,
        name: this.namespace,
      },
      'Sending invitation emails...',
    );

    for (const invitation of responseInvitations) {
      const promise = async () => {
        try {
          const { renderInviteEmail } = await import('@kit/email-templates');

          const html = renderInviteEmail({
            link: this.getInvitationLink(invitation.invite_token),
            invitedUserEmail: invitation.email,
            inviter: user.email,
            productName: env.productName,
            teamName: accountResponse.data.name,
          });

          await mailer.sendEmail({
            from: env.emailSender,
            to: invitation.email,
            subject: 'You have been invited to join a team',
            html,
          });

          Logger.info('Invitation email sent', {
            email: invitation.email,
            account,
            name: this.namespace,
          });

          return {
            success: true,
          };
        } catch (error) {
          console.error(error);
          Logger.warn(
            { account, error, name: this.namespace },
            'Failed to send invitation email',
          );

          return {
            error,
            success: false,
          };
        }
      };

      promises.push(promise);
    }

    const responses = await Promise.all(promises.map((promise) => promise()));
    const success = responses.filter((response) => response.success).length;

    Logger.info(
      {
        name: this.namespace,
        account,
        success,
        failed: responses.length - success,
      },
      `Invitations processed`,
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

  private async getUser() {
    const { data, error } = await requireAuth(this.client);

    if (error ?? !data) {
      throw new Error('Authentication required');
    }

    return data;
  }

  private getInvitationLink(token: string) {
    return new URL(env.invitePath, env.siteURL).href + `?invite_token=${token}`;
  }
}
