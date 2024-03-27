import { formatDate } from 'date-fns';
import { BadgeCheck, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

import { BillingSchema, getProductPlanPairFromId } from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { Database } from '@kit/supabase/database';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@kit/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { CurrentPlanAlert } from './current-plan-alert';
import { CurrentPlanBadge } from './current-plan-badge';

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
        <CardTitle>
          <Trans i18nKey="billing:planCardTitle" />
        </CardTitle>

        <CardDescription>
          <Trans i18nKey="billing:planCardDescription" />
        </CardDescription>
      </CardHeader>

      <CardContent className={'space-y-2.5 text-sm'}>
        <div className={'flex flex-col space-y-1'}>
          <div className={'flex items-center space-x-2 text-lg font-semibold'}>
            <BadgeCheck
              className={
                's-6 fill-green-500 text-white dark:fill-white dark:text-black'
              }
            />

            <span>{product.name}</span>
            <CurrentPlanBadge status={subscription.status} />
          </div>

          <div className={'text-muted-foreground'}>
            <Trans
              i18nKey="billing:planRenewal"
              values={{
                interval: subscription.interval,
                price: formatCurrency(product.currency, plan.price),
              }}
            />
          </div>
        </div>

        <div>
          <CurrentPlanAlert status={subscription.status} />
        </div>

        <div>
          <Accordion type="single" collapsible>
            <AccordionItem value="features">
              <AccordionTrigger>
                <Trans i18nKey="billing:planDetails" />
              </AccordionTrigger>

              <AccordionContent className="space-y-2.5">
                <If condition={subscription.status === 'trialing'}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      <Trans i18nKey="billing:trialEndsOn" />
                    </span>

                    <div className={'text-muted-foreground'}>
                      <span>
                        {subscription.trial_ends_at
                          ? formatDate(subscription.trial_ends_at, 'P')
                          : ''}
                      </span>
                    </div>
                  </div>
                </If>

                <If condition={subscription.cancel_at_period_end}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Your subscription will be cancelled at the end of the
                      period
                    </span>

                    <div className={'text-muted-foreground'}>
                      <span>
                        {formatDate(subscription.period_ends_at ?? '', 'P')}
                      </span>
                    </div>
                  </div>
                </If>

                <If condition={!subscription.cancel_at_period_end}>
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium">Your next bill</span>

                    <div className={'text-muted-foreground'}>
                      Your next bill is for {product.currency} {plan.price} on{' '}
                      <span>
                        {formatDate(subscription.period_ends_at ?? '', 'P')}
                      </span>{' '}
                    </div>
                  </div>
                </If>

                <div className="flex flex-col space-y-1">
                  <span className="font-medium">Features</span>

                  <ul className={'flex flex-col space-y-0.5'}>
                    {product.features.map((item) => {
                      return (
                        <li
                          key={item}
                          className="flex items-center space-x-0.5"
                        >
                          <CheckCircle2 className="h-4 text-green-500" />

                          <span className={'text-muted-foreground'}>
                            <Trans i18nKey={item} defaults={item} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
