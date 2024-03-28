import { SupabaseClient } from '@supabase/supabase-js';

import { BillingGatewayService } from '@kit/billing-gateway';
import { Mailer } from '@kit/mailers';
import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

/**
 * @name PersonalAccountsService
 * @description Service for managing accounts in the application
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const accountsService = new AccountsService(client);
 */
export class PersonalAccountsService {
  private namespace = 'account';

  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * @name deletePersonalAccount
   * Delete personal account of a user.
   * This will delete the user from the authentication provider and cancel all subscriptions.
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
    Logger.info(
      { userId: params.userId, name: this.namespace },
      'User requested deletion. Processing...',
    );

    // execute the deletion of the user
    try {
      await params.adminClient.auth.admin.deleteUser(params.userId);
    } catch (error) {
      Logger.error(
        {
          userId: params.userId,
          error,
          name: this.namespace,
        },
        'Error deleting user',
      );

      throw new Error('Error deleting user');
    }

    // Cancel all user subscriptions
    try {
      await this.cancelAllUserSubscriptions(params.userId);
    } catch (error) {
      Logger.error({
        userId: params.userId,
        error,
        name: this.namespace,
      });
    }

    // Send account deletion email
    if (params.userEmail) {
      try {
        Logger.info(
          {
            userId: params.userId,
            name: this.namespace,
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
            userId: params.userId,
            name: this.namespace,
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

    const html = await renderAccountDeleteEmail({
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

  private async cancelAllUserSubscriptions(userId: string) {
    Logger.info(
      {
        userId,
        name: this.namespace,
      },
      'Cancelling all subscriptions for user...',
    );

    const { data: subscriptions } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('account_id', userId);

    const cancellationRequests = [];

    Logger.info(
      {
        userId,
        subscriptions: subscriptions?.length ?? 0,
        name: this.namespace,
      },
      'Cancelling subscriptions...',
    );

    for (const subscription of subscriptions ?? []) {
      const gateway = new BillingGatewayService(subscription.billing_provider);

      cancellationRequests.push(
        gateway.cancelSubscription({
          subscriptionId: subscription.id,
          invoiceNow: true,
        }),
      );
    }

    // execute all cancellation requests
    await Promise.all(cancellationRequests);

    Logger.info(
      {
        userId,
        subscriptions: subscriptions?.length ?? 0,
        name: this.namespace,
      },
      'Subscriptions cancelled successfully',
    );
  }
}
