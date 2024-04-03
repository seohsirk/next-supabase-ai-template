import { SupabaseClient } from '@supabase/supabase-js';

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

      case 'accounts_memberships': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleAccountsMembershipsWebhook(payload);
      }

      default:
        throw new Error('No handler for this table');
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

  private handleAccountsMembershipsWebhook(
    payload: RecordChange<'accounts_memberships'>,
  ) {
    console.log('Accounts Memberships Webhook', payload);
    // no-op
    return Promise.resolve(undefined);
  }
}
