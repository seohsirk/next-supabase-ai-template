'use client';

import { useState } from 'react';

import Link from 'next/link';

import { CheckCircleIcon, SparklesIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';
import Heading from '@kit/ui/heading';
// TODO: pass in from app
import pathsConfig from '@kit/web/config/paths.config';
import pricingConfig from '@kit/web/config/pricing.config';

import { cn } from '../utils/cn';
import { If } from './if';
import { Trans } from './trans';

interface CheckoutButtonProps {
  readonly stripePriceId?: string;
  readonly recommended?: boolean;
}

interface PricingItemProps {
  selectable: boolean;
  product: {
    name: string;
    features: string[];
    description: string;
    recommended?: boolean;
    badge?: string;
  };
  plan: {
    name: string;
    stripePriceId?: string;
    price: string;
    label?: string;
    href?: string;
  };
}

const STRIPE_PRODUCTS = pricingConfig.products;

const STRIPE_PLANS = STRIPE_PRODUCTS.reduce<string[]>((acc, product) => {
  product.plans.forEach((plan) => {
    if (plan.name && !acc.includes(plan.name)) {
      acc.push(plan.name);
    }
  });

  return acc;
}, []);

function PricingTable(
  props: React.PropsWithChildren<{
    CheckoutButton?: React.ComponentType<CheckoutButtonProps>;
  }>,
) {
  const [planVariant, setPlanVariant] = useState<string>(STRIPE_PLANS[0]);

  return (
    <div className={'flex flex-col space-y-12'}>
      <div className={'flex justify-center'}>
        <PlansSwitcher
          plans={STRIPE_PLANS}
          plan={planVariant}
          setPlan={setPlanVariant}
        />
      </div>

      <div
        className={
          'flex flex-col items-start space-y-6 lg:space-y-0' +
          ' justify-center lg:flex-row lg:space-x-4'
        }
      >
        {STRIPE_PRODUCTS.map((product) => {
          const plan =
            product.plans.find((item) => item.name === planVariant) ??
            product.plans[0];

          return (
            <PricingItem
              selectable
              key={plan.stripePriceId ?? plan.name}
              plan={plan}
              product={product}
              CheckoutButton={props.CheckoutButton}
            />
          );
        })}
      </div>
    </div>
  );
}

export default PricingTable;

PricingTable.Item = PricingItem;
PricingTable.Price = Price;
PricingTable.FeaturesList = FeaturesList;

function PricingItem(
  props: React.PropsWithChildren<
    PricingItemProps & {
      CheckoutButton?: React.ComponentType<CheckoutButtonProps>;
    }
  >,
) {
  const recommended = props.product.recommended ?? false;

  return (
    <div
      data-test={'subscription-plan'}
      className={cn(
        `
         relative flex w-full flex-col justify-between space-y-6 rounded-lg
         p-6 lg:w-4/12 xl:max-w-xs xl:p-8 2xl:w-3/12
      `,
        {
          ['border']: !recommended,
          ['border-2 border-primary']: recommended,
        },
      )}
    >
      <div className={'flex flex-col space-y-1'}>
        <div className={'flex items-center space-x-4'}>
          <Heading level={4}>{props.product.name}</Heading>

          <If condition={props.product.badge}>
            <div
              className={cn(
                `flex space-x-1 rounded-md px-2 py-1 text-xs font-medium`,
                {
                  ['bg-primary text-primary-foreground']: recommended,
                  ['bg-muted text-muted-foreground']: !recommended,
                },
              )}
            >
              <If condition={recommended}>
                <SparklesIcon className={'mr-1 h-4 w-4'} />
              </If>

              <span>{props.product.badge}</span>
            </div>
          </If>
        </div>

        <span className={'text-muted-foreground'}>
          {props.product.description}
        </span>
      </div>

      <div className={'flex items-end space-x-1'}>
        <Price>{props.plan.price}</Price>

        <If condition={props.plan.name}>
          <span className={cn(`text-lg lowercase text-muted-foreground`)}>
            <span>/</span>
            <span>{props.plan.name}</span>
          </span>
        </If>
      </div>

      <div className={'text-current'}>
        <FeaturesList features={props.product.features} />
      </div>

      <If condition={props.selectable}>
        <If
          condition={props.plan.stripePriceId && props.CheckoutButton}
          fallback={
            <DefaultCheckoutButton
              recommended={recommended}
              plan={props.plan}
            />
          }
        >
          {(CheckoutButton) => (
            <CheckoutButton
              recommended={recommended}
              stripePriceId={props.plan.stripePriceId}
            />
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
      className={`duration-500 animate-in fade-in slide-in-from-left-4`}
    >
      <span className={'text-2xl font-bold lg:text-3xl xl:text-4xl'}>
        {children}
      </span>
    </div>
  );
}

function ListItem({ children }: React.PropsWithChildren) {
  return (
    <li className={'flex items-center space-x-3 font-medium'}>
      <div>
        <CheckCircleIcon className={'h-5 text-green-500'} />
      </div>

      <span className={'text-sm'}>{children}</span>
    </li>
  );
}

function PlansSwitcher(
  props: React.PropsWithChildren<{
    plans: string[];
    plan: string;
    setPlan: (plan: string) => void;
  }>,
) {
  return (
    <div className={'flex'}>
      {props.plans.map((plan, index) => {
        const selected = plan === props.plan;

        const className = cn('focus:!ring-0 !outline-none', {
          'rounded-r-none border-r-transparent': index === 0,
          'rounded-l-none': index === props.plans.length - 1,
          ['hover:bg-muted']: !selected,
          ['font-bold hover:bg-background hover:text-initial']: selected,
        });

        return (
          <Button
            key={plan}
            variant={'outline'}
            className={className}
            onClick={() => props.setPlan(plan)}
          >
            <span className={'flex items-center space-x-1'}>
              <If condition={selected}>
                <CheckCircleIcon className={'h-4 text-green-500'} />
              </If>

              <span>
                <Trans i18nKey={`common:plans.${plan}`} defaults={plan} />
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
    plan: PricingItemProps['plan'];
    recommended?: boolean;
  }>,
) {
  const signUpPath = pathsConfig.auth.signUp;

  const linkHref =
    props.plan.href ?? `${signUpPath}?utm_source=${props.plan.stripePriceId}`;

  const label = props.plan.label ?? 'common:getStarted';

  return (
    <div className={'bottom-0 left-0 w-full p-0'}>
      <Button
        className={'w-full'}
        variant={props.recommended ? 'default' : 'outline'}
      >
        <Link href={linkHref}>
          <Trans i18nKey={label} defaults={label} />
        </Link>
      </Button>
    </div>
  );
}
