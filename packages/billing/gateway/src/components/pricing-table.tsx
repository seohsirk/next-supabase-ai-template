'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ArrowRight, CheckCircle, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  BillingConfig,
  LineItemSchema,
  getPlanIntervals,
  getPrimaryLineItem,
} from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { LineItemDetails } from './line-item-details';

interface Paths {
  signUp: string;
  subscription: string;
}

export function PricingTable({
  config,
  paths,
  CheckoutButtonRenderer,
  redirectToCheckout = true,
  displayPlanDetails = true,
}: {
  config: BillingConfig;
  paths: Paths;
  displayPlanDetails?: boolean;

  redirectToCheckout?: boolean;

  CheckoutButtonRenderer?: React.ComponentType<{
    planId: string;
    highlighted?: boolean;
  }>;
}) {
  const intervals = getPlanIntervals(config).filter(Boolean) as string[];
  const [interval, setInterval] = useState(intervals[0]!);

  return (
    <div className={'flex flex-col space-y-8 xl:space-y-12'}>
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
          ' justify-center lg:flex-row lg:space-x-4'
        }
      >
        {config.products.map((product) => {
          const plan = product.plans.find((plan) => {
            if (plan.paymentType === 'recurring') {
              return plan.interval === interval;
            }

            return plan;
          });

          if (!plan) {
            return null;
          }

          const primaryLineItem = getPrimaryLineItem(config, plan.id);

          if (!primaryLineItem) {
            throw new Error(`Base line item was not found`);
          }

          return (
            <PricingItem
              selectable
              key={plan.id}
              plan={plan}
              redirectToCheckout={redirectToCheckout}
              primaryLineItem={primaryLineItem}
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

    paths: Paths;

    selectable: boolean;

    primaryLineItem: z.infer<typeof LineItemSchema>;

    redirectToCheckout?: boolean;

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

  // we want to exclude the primary plan from the list of line items
  // since we are displaying the primary line item separately as the main price
  const lineItemsToDisplay = props.plan.lineItems.filter((item) => {
    return item.id !== props.primaryLineItem.id;
  });

  return (
    <div
      data-cy={'subscription-plan'}
      className={cn(
        props.className,
        `s-full relative flex flex-1 grow flex-col items-stretch justify-between 
            self-stretch rounded-lg border p-8 lg:w-4/12 xl:max-w-[20rem]`,
        {
          ['border-primary']: highlighted,
          ['dark:shadow-primary/40 border-transparent shadow dark:shadow-sm']:
            !highlighted,
        },
      )}
    >
      <If condition={props.product.badge}>
        <div className={'absolute -top-2.5 left-0 flex w-full justify-center'}>
          <Badge variant={highlighted ? 'default' : 'outline'}>
            <span>
              <Trans
                i18nKey={props.product.badge}
                defaults={props.product.badge}
              />
            </span>
          </Badge>
        </div>
      </If>

      <div className={'flex flex-col space-y-6'}>
        <div className={'flex flex-col space-y-2.5'}>
          <div className={'flex items-center space-x-6'}>
            <b
              className={
                'text-current-foreground font-heading font-semibold uppercase'
              }
            >
              <Trans
                i18nKey={props.product.name}
                defaults={props.product.name}
              />
            </b>
          </div>

          <span className={cn(`text-muted-foreground h-6 text-sm`)}>
            <Trans
              i18nKey={props.product.description}
              defaults={props.product.description}
            />
          </span>
        </div>

        <Separator />

        <div className={'flex flex-col space-y-1'}>
          <Price>
            {formatCurrency(props.product.currency, props.primaryLineItem.cost)}
          </Price>

          <If condition={props.plan.name}>
            <span
              className={cn(
                `animate-in slide-in-from-left-4 fade-in flex items-center space-x-0.5 text-sm capitalize`,
              )}
            >
              <span className={'text-muted-foreground'}>
                <If
                  condition={props.plan.interval}
                  fallback={<Trans i18nKey={'billing:lifetime'} />}
                >
                  {(interval) => (
                    <Trans i18nKey={`billing:billingInterval.${interval}`} />
                  )}
                </If>
              </span>

              <If condition={props.primaryLineItem.type !== 'flat'}>
                <span>/</span>

                <span
                  className={cn(
                    `animate-in slide-in-from-left-4 fade-in text-sm capitalize`,
                  )}
                >
                  <If condition={props.primaryLineItem.type === 'per_seat'}>
                    <Trans i18nKey={'billing:perTeamMember'} />
                  </If>

                  <If condition={props.primaryLineItem.unit}>
                    <Trans
                      i18nKey={'billing:perUnit'}
                      values={{
                        unit: props.primaryLineItem.unit,
                      }}
                    />
                  </If>
                </span>
              </If>
            </span>
          </If>
        </div>

        <If condition={props.selectable}>
          <If
            condition={props.plan.id && props.CheckoutButton}
            fallback={
              <DefaultCheckoutButton
                paths={props.paths}
                product={props.product}
                highlighted={highlighted}
                plan={props.plan}
                redirectToCheckout={props.redirectToCheckout}
              />
            }
          >
            {(CheckoutButton) => (
              <CheckoutButton
                highlighted={highlighted}
                planId={props.plan.id}
              />
            )}
          </If>
        </If>

        <Separator />

        <div className={'flex flex-col'}>
          <FeaturesList
            highlighted={highlighted}
            features={props.product.features}
          />
        </div>

        <If condition={props.displayPlanDetails && lineItemsToDisplay.length}>
          <Separator />

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
          <ListItem key={feature}>
            <Trans i18nKey={feature} defaults={feature} />
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
          'font-heading flex items-center text-3xl font-bold lg:text-4xl'
        }
      >
        {children}
      </span>
    </div>
  );
}

function ListItem({ children }: React.PropsWithChildren) {
  return (
    <li className={'flex items-center space-x-2.5'}>
      <Circle className={'fill-primary h-2 w-2'} />

      <span
        className={cn('text-sm', {
          ['text-secondary-foreground']: true,
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

        const className = cn(
          'focus:!ring-0 !outline-none animate-in transition-all fade-in',
          {
            'rounded-r-none border-r-transparent': index === 0,
            'rounded-l-none': index === props.intervals.length - 1,
            ['hover:text-primary border']: !selected,
            ['font-semibold cursor-default hover:text-initial hover:bg-background']:
              selected,
          },
        );

        return (
          <Button
            key={plan}
            variant={'outline'}
            className={className}
            onClick={() => props.setInterval(plan)}
          >
            <span className={'flex items-center space-x-1'}>
              <If condition={selected}>
                <CheckCircle className={'animate-in fade-in zoom-in-90 h-4'} />
              </If>

              <span className={'capitalize'}>
                <Trans i18nKey={`common:billingInterval.${plan}`} />
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
      name?: string | undefined;
      href?: string;
      label?: string;
    };

    product: {
      name: string;
    };

    paths: Paths;
    redirectToCheckout?: boolean;

    highlighted?: boolean;
  }>,
) {
  const redirectToCheckoutParam = props.redirectToCheckout
    ? '?redirectToCheckout=true'
    : '';

  const { t } = useTranslation('billing');

  const planId = props.plan.id;
  const signUpPath = props.paths.signUp;
  const subscriptionPath = props.paths.subscription;

  const linkHref =
    props.plan.href ??
    `${signUpPath}?plan=${planId}&next=${subscriptionPath}?plan=${planId}${redirectToCheckoutParam}` ??
    '';

  const label = props.plan.label ?? 'common:getStartedWithPlan';

  return (
    <Link className={'w-full'} href={linkHref}>
      <Button
        size={'lg'}
        className={'ring-primary w-full ring-2'}
        variant={props.highlighted ? 'default' : 'outline'}
      >
        <span>
          <Trans
            i18nKey={label}
            defaults={label}
            values={{
              plan: t(props.product.name, {
                defaultValue: props.product.name,
              }),
            }}
          />
        </span>

        <ArrowRight className={'ml-2 h-4'} />
      </Button>
    </Link>
  );
}
