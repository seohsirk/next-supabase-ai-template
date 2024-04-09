import 'server-only';

import { Database } from '@kit/supabase/database';

import { BillingGatewayService } from '../billing-gateway/billing-gateway.service';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export class BillingWebhooksService {
  async handleSubscriptionDeletedWebhook(subscription: Subscription) {
    const gateway = new BillingGatewayService(subscription.billing_provider);

    await gateway.cancelSubscription({
      subscriptionId: subscription.id,
    });
  }
}
