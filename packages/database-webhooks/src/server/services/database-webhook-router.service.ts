import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { RecordChange, Tables } from '../record-change.type';

export class DatabaseWebhookRouterService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  handleWebhook(body: RecordChange<keyof Tables>) {
    switch (body.table) {
      case 'invitations': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleInvitations(payload);
      }

      case 'subscriptions': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleSubscriptions(payload);
      }

      case 'accounts_memberships': {
        const payload = body as RecordChange<typeof body.table>;

        return this.handleAccountsMemberships(payload);
      }

      default:
        throw new Error('No handler for this table');
    }
  }

  private async handleInvitations(body: RecordChange<'invitations'>) {
    const { AccountInvitationsWebhookService } = await import(
      '@kit/team-accounts/webhooks'
    );

    const service = new AccountInvitationsWebhookService(this.adminClient);

    return service.handleInvitationWebhook(body.record);
  }

  private async handleSubscriptions(body: RecordChange<'subscriptions'>) {
    const { BillingWebhooksService } = await import('@kit/billing-gateway');
    const service = new BillingWebhooksService();

    return service.handleSubscriptionDeletedWebhook(body.record);
  }

  private handleAccountsMemberships(
    payload: RecordChange<'accounts_memberships'>,
  ) {
    // no-op
    return Promise.resolve(undefined);
  }
}
