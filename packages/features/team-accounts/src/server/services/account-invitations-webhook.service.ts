import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { Mailer } from '@kit/mailers';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

type Invitation = Database['public']['Tables']['invitations']['Row'];

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

export class AccountInvitationsWebhookService {
  private namespace = 'accounts.invitations.webhook';

  constructor(private readonly client: SupabaseClient<Database>) {}

  async handleInvitationWebhook(invitation: Invitation) {
    return this.dispatchInvitationEmail(invitation);
  }

  private async dispatchInvitationEmail(invitation: Invitation) {
    const mailer = new Mailer();

    const inviter = await this.client
      .from('accounts')
      .select('email, name')
      .eq('id', invitation.invited_by)
      .single();

    if (inviter.error) {
      throw inviter.error;
    }

    const team = await this.client
      .from('accounts')
      .select('name')
      .eq('id', invitation.account_id)
      .single();

    if (team.error) {
      throw team.error;
    }

    try {
      const { renderInviteEmail } = await import('@kit/email-templates');

      const html = renderInviteEmail({
        link: this.getInvitationLink(invitation.invite_token),
        invitedUserEmail: invitation.email,
        inviter: inviter.data.name ?? inviter.data.email ?? '',
        productName: env.productName,
        teamName: team.data.name,
      });

      await mailer.sendEmail({
        from: env.emailSender,
        to: invitation.email,
        subject: 'You have been invited to join a team',
        html,
      });

      Logger.info('Invitation email sent', {
        email: invitation.email,
        account: invitation.account_id,
        name: this.namespace,
      });

      return {
        success: true,
      };
    } catch (error) {
      Logger.warn(
        { error, name: this.namespace },
        'Failed to send invitation email',
      );

      return {
        error,
        success: false,
      };
    }
  }

  private getInvitationLink(token: string) {
    return new URL(env.invitePath, env.siteURL).href + `?invite_token=${token}`;
  }
}
