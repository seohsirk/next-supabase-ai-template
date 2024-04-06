'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { z } from 'zod';

import {
  BillingConfig,
  LineItemSchema,
  getBaseLineItem,
  getPlanIntervals,
} from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { LineItemDetails } from './line-item-details';

interface Paths {
  signUp: string;
}

export function PricingTable({
  config,
  paths,
  CheckoutButtonRenderer,
  displayPlanDetails = true,
}: {
  config: BillingConfig;
  paths: Paths;
  displayPlanDetails?: boolean;

  CheckoutButtonRenderer?: React.ComponentType<{
    planId: string;
    highlighted?: boolean;
  }>;
}) {
  const intervals = getPlanIntervals(config).filter(Boolean) as string[];
  const [interval, setInterval] = useState(intervals[0]!);

  return (
    <div className={'flex flex-col space-y-8'}>
      <div className={'flex justify-center'}>
        {intervals.length ? (
          <PlanIntervalSwitcher
            intervals={intervals}
            interval={interval}
            setInterval={setInterval}
          />
        ) : null}
      </div>

      <div
        className={
          'flex flex-col items-start space-y-6 lg:space-y-0' +
          ' justify-center lg:flex-row'
        }
      >
        {config.products.map((product, index) => {
          const isFirst = index === 0;
          const isLast = index === config.products.length - 1;

          const plan = product.plans.find((plan) => {
            if (plan.paymentType === 'recurring') {
              return plan.interval === interval;
            }

            return plan;
          });

          if (!plan) {
            return null;
          }

          const baseLineItem = getBaseLineItem(config, plan.id);

          if (!baseLineItem) {
            throw new Error(`Base line item was not found`);
          }

          return (
            <PricingItem
              className={cn('border-b border-r border-t', {
                ['rounded-l-lg border-l']: isFirst,
                ['rounded-r-lg']: isLast,
              })}
              selectable
              key={plan.id}
              plan={plan}
              baseLineItem={baseLineItem}
              product={product}
              paths={paths}
              displayPlanDetails={displayPlanDetails}
              CheckoutButton={CheckoutButtonRenderer}
            />
          );
        })}
      </div>
    </div>
  );
}

function PricingItem(
  props: React.PropsWithChildren<{
    className?: string;
    displayPlanDetails: boolean;

    paths: {
      signUp: string;
    };

    selectable: boolean;

    baseLineItem: {
      id: string;
      cost: number;
    };

    plan: {
      id: string;
      lineItems: z.infer<typeof LineItemSchema>[];
      interval?: string;
      name?: string;
      href?: string;
      label?: string;
    };

    CheckoutButton?: React.ComponentType<{
      planId: string;
      highlighted?: boolean;
    }>;

    product: {
      name: string;
      currency: string;
      description: string;
      badge?: string;
      highlighted?: boolean;
      features: string[];
    };
  }>,
) {
  const highlighted = props.product.highlighted ?? false;

  // we want to exclude the base plan from the list of line items
  // since we are displaying the base plan separately as the main price
  const lineItemsToDisplay = props.plan.lineItems.filter((item) => {
    return item.type !== 'base';
  });

  return (
    <div
      data-cy={'subscription-plan'}
      className={cn(
        props.className,
        `s-full flex flex-1 grow flex-col items-stretch
            justify-between space-y-8 self-stretch p-6 lg:w-4/12 xl:max-w-[22rem] xl:p-8`,
        {
          ['bg-primary text-primary-foreground border-primary']: highlighted,
        },
      )}
    >
      <div className={'flex flex-col space-y-6'}>
        <div className={'flex flex-col space-y-2'}>
          <div className={'flex items-center space-x-4'}>
            <Heading level={4}>
              <b className={'font-bold'}>{props.product.name}</b>
            </Heading>

            <If condition={props.product.badge}>
              <Badge
                variant={'default'}
                className={cn({
                  ['border-primary-foreground']: highlighted,
                })}
              >
                <If condition={highlighted}>
                  <Sparkles className={'h-3'} />
                </If>

                <span>
                  <Trans
                    i18nKey={props.product.badge}
                    defaults={props.product.badge}
                  />
                </span>
              </Badge>
            </If>
          </div>

          <span
            className={cn(`text-sm text-current`, {
              ['text-muted-foreground']: !highlighted,
            })}
          >
            <Trans
              i18nKey={props.product.description}
              defaults={props.product.description}
            />
          </span>
        </div>

        <div className={'flex flex-col space-y-1'}>
          <Price>
            {formatCurrency(props.product.currency, props.baseLineItem.cost)}
          </Price>

          <If condition={props.plan.name}>
            <span
              className={cn(
                `animate-in slide-in-from-left-4 fade-in capitalize`,
                {
                  ['text-muted-foreground']: !highlighted,
                },
              )}
            >
              <span className={'text-sm'}>
                <If
                  condition={props.plan.interval}
                  fallback={<Trans i18nKey={'billing:lifetime'} />}
                >
                  {(interval) => (
                    <Trans i18nKey={`billing:billingInterval.${interval}`} />
                  )}
                </If>
              </span>
            </span>
          </If>
        </div>

        <div className={'flex flex-col space-y-2'}>
          <h6 className={'text-sm font-semibold'}>
            <Trans i18nKey={'billing:featuresLabel'} />
          </h6>

          <FeaturesList
            highlighted={highlighted}
            features={props.product.features}
          />
        </div>

        <If condition={props.displayPlanDetails && lineItemsToDisplay.length}>
          <div className={'flex flex-col space-y-2'}>
            <h6 className={'text-sm font-semibold'}>
              <Trans i18nKey={'billing:detailsLabel'} />
            </h6>

            <LineItemDetails
              selectedInterval={props.plan.interval}
              currency={props.product.currency}
              lineItems={lineItemsToDisplay}
            />
          </div>
        </If>
      </div>

      <If condition={props.selectable}>
        <If
          condition={props.plan.id && props.CheckoutButton}
          fallback={
            <DefaultCheckoutButton
              signUpPath={props.paths.signUp}
              highlighted={highlighted}
              plan={props.plan}
            />
          }
        >
          {(CheckoutButton) => (
            <CheckoutButton highlighted={highlighted} planId={props.plan.id} />
          )}
        </If>
      </If>
    </div>
  );
}

function FeaturesList(
  props: React.PropsWithChildren<{
    features: string[];
    highlighted?: boolean;
  }>,
) {
  return (
    <ul className={'flex flex-col space-y-2'}>
      {props.features.map((feature) => {
        return (
          <ListItem highlighted={props.highlighted} key={feature}>
            <Trans
              i18nKey={`common:plans.features.${feature}`}
              defaults={feature}
            />
          </ListItem>
        );
      })}
    </ul>
  );
}

function Price({ children }: React.PropsWithChildren) {
  return (
    <div
      className={`animate-in slide-in-from-left-4 fade-in items-center duration-500`}
    >
      <span
        className={
          'flex items-center text-2xl font-bold lg:text-3xl xl:text-4xl'
        }
      >
        {children}
      </span>
    </div>
  );
}

function ListItem({
  children,
  highlighted,
}: React.PropsWithChildren<{
  highlighted?: boolean;
}>) {
  return (
    <li className={'flex items-center space-x-1.5'}>
      <CheckCircle
        className={cn('h-4', {
          ['text-primary-foreground']: highlighted,
          ['text-green-600']: !highlighted,
        })}
      />

      <span
        className={cn('text-sm', {
          ['text-secondary-foreground']: !highlighted,
          ['text-primary-foreground']: highlighted,
        })}
      >
        {children}
      </span>
    </li>
  );
}

function PlanIntervalSwitcher(
  props: React.PropsWithChildren<{
    intervals: string[];
    interval: string;
    setInterval: (interval: string) => void;
  }>,
) {
  return (
    <div className={'flex'}>
      {props.intervals.map((plan, index) => {
        const selected = plan === props.interval;

        const className = cn('focus:!ring-0 !outline-none', {
          'rounded-r-none border-r-transparent': index === 0,
          'rounded-l-none': index === props.intervals.length - 1,
          ['hover:bg-muted']: !selected,
          ['font-semibold cursor-default bg-muted hover:bg-muted hover:text-initial']:
            selected,
        });

        return (
          <Button
            key={plan}
            variant={'outline'}
            className={className}
            onClick={() => props.setInterval(plan)}
          >
            <span className={'flex items-center space-x-1'}>
              <If condition={selected}>
                <CheckCircle className={'animate-in fade-in h-4'} />
              </If>

              <span className={'capitalize'}>
                <Trans
                  i18nKey={`common:plans.interval.${plan}`}
                  defaults={plan}
                />
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}

function DefaultCheckoutButton(
  props: React.PropsWithChildren<{
    plan: {
      id: string;
      href?: string;
      label?: string;
    };

    signUpPath: string;
    highlighted?: boolean;
  }>,
) {
  const linkHref =
    props.plan.href ?? `${props.signUpPath}?utm_source=${props.plan.id}` ?? '';

  const label = props.plan.label ?? 'common:getStarted';

  return (
    <Link className={'w-full'} href={linkHref}>
      <Button
        size={'lg'}
        className={'w-full'}
        variant={props.highlighted ? 'secondary' : 'outline'}
      >
        <span>
          <Trans i18nKey={label} defaults={label} />
        </span>

        <ArrowRight className={'ml-2 h-4'} />
      </Button>
    </Link>
  );
}
