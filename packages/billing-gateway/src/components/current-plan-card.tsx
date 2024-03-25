import { formatDate } from 'date-fns';
import { z } from 'zod';

import { BillingSchema, getProductPlanPairFromId } from '@kit/billing';
import { Database } from '@kit/supabase/database';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';

export function CurrentPlanCard({
  subscription,
  config,
}: React.PropsWithChildren<{
  subscription: Database['public']['Tables']['subscriptions']['Row'];
  config: z.infer<typeof BillingSchema>;
}>) {
  const { plan, product } = getProductPlanPairFromId(
    config,
    subscription.variant_id,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>

        <CardDescription>{product.description}</CardDescription>
      </CardHeader>

      <CardContent className={'space-y-4 text-sm'}>
        <div>
          <div className={'font-semibold'}>
            Your Current Plan: <span>{plan.name}</span>
          </div>
        </div>

        <div>
          <div className={'font-semibold'}>
            Your Subscription is currently <span>{subscription.status}</span>
          </div>
        </div>

        <If condition={subscription.cancel_at_period_end}>
          <div>
            <div className={'font-semibold'}>
              Cancellation Date:{' '}
              <span>{formatDate(subscription.period_ends_at, 'P')}</span>
            </div>
          </div>
        </If>

        <If condition={!subscription.cancel_at_period_end}>
          <div>
            <div className={'font-semibold'}>
              Next Billing Date:{' '}
              <span>{formatDate(subscription.period_ends_at, 'P')}</span>{' '}
            </div>
          </div>
        </If>
      </CardContent>
    </Card>
  );
}
