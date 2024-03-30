import { SupabaseClient } from '@supabase/supabase-js';

import { Mailer } from '@kit/mailers';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

/**
 * @name DeletePersonalAccountService
 * @description Service for managing accounts in the application
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const accountsService = new DeletePersonalAccountService();
 */
export class DeletePersonalAccountService {
  private namespace = 'accounts.delete';

  /**
   * @name deletePersonalAccount
   * Delete personal account of a user.
   * This will delete the user from the authentication provider and cancel all subscriptions.
   *
   * Permissions are not checked here, as they are checked in the server action.
   * USE WITH CAUTION. THE USER MUST HAVE THE NECESSARY PERMISSIONS.
   */
  async deletePersonalAccount(params: {
    adminClient: SupabaseClient<Database>;

    userId: string;
    userEmail: string | null;

    emailSettings: {
      fromEmail: string;
      productName: string;
    };
  }) {
    const userId = params.userId;

    Logger.info(
      { name: this.namespace, userId },
      'User requested deletion. Processing...',
    );

    // execute the deletion of the user
    try {
      await params.adminClient.auth.admin.deleteUser(userId);
    } catch (error) {
      Logger.error(
        {
          name: this.namespace,
          userId,
          error,
        },
        'Error deleting user',
      );

      throw new Error('Error deleting user');
    }

    // Send account deletion email
    if (params.userEmail) {
      try {
        Logger.info(
          {
            name: this.namespace,
            userId,
          },
          `Sending account deletion email...`,
        );

        await this.sendAccountDeletionEmail({
          fromEmail: params.emailSettings.fromEmail,
          productName: params.emailSettings.productName,
          userDisplayName: params.userEmail,
          userEmail: params.userEmail,
        });
      } catch (error) {
        Logger.error(
          {
            name: this.namespace,
            userId,
            error,
          },
          `Error sending account deletion email`,
        );
      }
    }
  }

  private async sendAccountDeletionEmail(params: {
    fromEmail: string;
    userEmail: string;
    userDisplayName: string;
    productName: string;
  }) {
    const { renderAccountDeleteEmail } = await import('@kit/email-templates');
    const mailer = new Mailer();

    const html = renderAccountDeleteEmail({
      userDisplayName: params.userDisplayName,
      productName: params.productName,
    });

    await mailer.sendEmail({
      to: params.userEmail,
      from: params.fromEmail,
      subject: 'Account Deletion Request',
      html,
    });
  }
}
