'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CheckCircle, Sparkles } from 'lucide-react';

import { BillingConfig, getBaseLineItem, getPlanIntervals } from '@kit/billing';
import { formatCurrency } from '@kit/shared/utils';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

interface Paths {
  signUp: string;
}

export function PricingTable({
  config,
  paths,
  CheckoutButtonRenderer,
}: {
  config: BillingConfig;
  paths: Paths;

  CheckoutButtonRenderer?: React.ComponentType<{
    planId: string;
    highlighted?: boolean;
  }>;
}) {
  const intervals = getPlanIntervals(config).filter(Boolean) as string[];
  const [interval, setInterval] = useState(intervals[0]!);

  return (
    <div className={'flex flex-col space-y-12'}>
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
          ' justify-center space-x-2 lg:flex-row'
        }
      >
        {config.products.map((product) => {
          const plan = product.plans.find((plan) => plan.interval === interval);

          if (!plan) {
            console.warn(`No plan found for ${product.name}`);

            return;
          }

          const basePlan = getBaseLineItem(config, plan.id);

          return (
            <PricingItem
              selectable
              key={plan.id}
              plan={{ ...plan, interval }}
              baseLineItem={basePlan}
              product={product}
              paths={paths}
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
      interval: string;
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

  return (
    <div
      data-cy={'subscription-plan'}
      className={cn(
        `
         relative flex w-full flex-col justify-between space-y-6 rounded-lg
         border p-6 lg:w-4/12 xl:max-w-xs xl:p-8 2xl:w-3/12
      `,
      )}
    >
      <div className={'flex flex-col space-y-2.5'}>
        <div className={'flex items-center space-x-2.5'}>
          <Heading level={4}>
            <b className={'font-semibold'}>{props.product.name}</b>
          </Heading>

          <If condition={props.product.badge}>
            <div
              className={cn(
                `flex space-x-1 rounded-md px-2 py-1 text-xs font-medium`,
                {
                  ['text-primary-foreground bg-primary']: highlighted,
                  ['text-muted-foreground bg-gray-50']: !highlighted,
                },
              )}
            >
              <If condition={highlighted}>
                <Sparkles className={'mr-1 h-4 w-4'} />
              </If>

              <span>{props.product.badge}</span>
            </div>
          </If>
        </div>

        <span className={'text-sm text-gray-500 dark:text-gray-400'}>
          {props.product.description}
        </span>
      </div>

      <div className={'flex items-center space-x-1'}>
        <Price>
          {formatCurrency(props.product.currency, props.baseLineItem.cost)}
        </Price>

        <If condition={props.plan.name}>
          <span className={cn(`text-muted-foreground text-base lowercase`)}>
            <span>/</span>
            <span>{props.plan.interval}</span>
          </span>
        </If>
      </div>

      <div className={'text-current'}>
        <FeaturesList features={props.product.features} />
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
  }>,
) {
  return (
    <ul className={'flex flex-col space-y-2'}>
      {props.features.map((feature) => {
        return (
          <ListItem key={feature}>
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
  // little trick to re-animate the price when switching plans
  const key = Math.random();

  return (
    <div
      key={key}
      className={`animate-in slide-in-from-left-4 fade-in items-center duration-500`}
    >
      <span
        className={
          'flex items-center text-2xl font-bold lg:text-3xl xl:text-4xl 2xl:text-5xl'
        }
      >
        {children}
      </span>
    </div>
  );
}

function ListItem({ children }: React.PropsWithChildren) {
  return (
    <li className={'flex items-center space-x-3 font-medium'}>
      <div>
        <CheckCircle className={'h-5 text-green-500'} />
      </div>

      <span className={'text-muted-foreground text-sm'}>{children}</span>
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
          ['hover:bg-gray-50 dark:hover:bg-background/80']: !selected,
          ['text-primary-800 dark:text-primary-500 font-semibold' +
          ' hover:bg-background hover:text-initial']: selected,
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
                <CheckCircle className={'h-4 text-green-500'} />
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
    <div className={'bottom-0 left-0 w-full p-0'}>
      <Link className={'w-full'} href={linkHref}>
        <Button
          className={'w-full'}
          variant={props.highlighted ? 'default' : 'outline'}
        >
          <Trans i18nKey={label} defaults={label} />
        </Button>
      </Link>
    </div>
  );
}
