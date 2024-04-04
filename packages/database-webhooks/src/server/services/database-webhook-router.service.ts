import { SupabaseClient } from '@supabase/supabase-js';

import { Logger } from '@kit/shared/logger';
import { Database } from '@kit/supabase/database';

import { RecordChange, Tables } from '../record-change.type';

export class DatabaseWebhookRouterService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  handleWebhook(body: RecordChange<keyof Tables>) {
    switch (body.table) {
      case 'invitations': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleInvitationsWebhook(payload);
      }

      case 'subscriptions': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleSubscriptionsWebhook(payload);
      }

      default: {
        Logger.warn(
          {
            table: body.table,
          },
          'No handler found for table',
        );
      }
    }
  }

  private async handleInvitationsWebhook(body: RecordChange<'invitations'>) {
    const { AccountInvitationsWebhookService } = await import(
      '@kit/team-accounts/webhooks'
    );

    const service = new AccountInvitationsWebhookService(this.adminClient);

    return service.handleInvitationWebhook(body.record);
  }

  private async handleSubscriptionsWebhook(
    body: RecordChange<'subscriptions'>,
  ) {
    const { BillingWebhooksService } = await import('@kit/billing-gateway');
    const service = new BillingWebhooksService();

    if (body.type === 'DELETE' && body.old_record) {
      return service.handleSubscriptionDeletedWebhook(body.old_record);
    }
  }
}
