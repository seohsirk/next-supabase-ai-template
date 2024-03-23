'use client';

import React, { useState } from 'react';

import dynamic from 'next/dynamic';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import type Organization from '@/lib/organizations/types/organization';

import ErrorBoundary from '@/components/app/ErrorBoundary';
import If from '@/components/app/If';
import PricingTable from '@/components/app/PricingTable';
import Trans from '@/components/app/Trans';

import BillingPortalRedirectButton from './billing-redirect-button';
import CheckoutRedirectButton from './checkout-redirect-button';

const EmbeddedStripeCheckout = dynamic(
  () => import('./embedded-stripe-checkout'),
  {
    ssr: false,
  },
);

const PlanSelectionForm: React.FC<{
  organization: WithId<Organization>;
  customerId: Maybe<string>;
}> = ({ organization, customerId }) => {
  const [clientSecret, setClientSecret] = useState<string>();
  const [retry, setRetry] = useState(0);

  return (
    <div className={'flex flex-col space-y-6'}>
      <If condition={clientSecret}>
        <EmbeddedStripeCheckout clientSecret={clientSecret!} />
      </If>

      <div className={'flex w-full flex-col justify-center space-y-8'}>
        <PricingTable
          CheckoutButton={(props) => {
            return (
              <ErrorBoundary
                key={retry}
                fallback={
                  <CheckoutErrorMessage
                    onRetry={() => setRetry((retry) => retry + 1)}
                  />
                }
              >
                <CheckoutRedirectButton
                  organizationUid={organization.uuid}
                  stripePriceId={props.stripePriceId}
                  recommended={props.recommended}
                  onCheckoutCreated={setClientSecret}
                >
                  <Trans
                    i18nKey={'subscription:checkout'}
                    defaults={'Checkout'}
                  />
                </CheckoutRedirectButton>
              </ErrorBoundary>
            );
          }}
        />

        <If condition={customerId}>
          <div className={'flex flex-col space-y-2'}>
            <BillingPortalRedirectButton customerId={customerId as string}>
              <Trans i18nKey={'subscription:manageBilling'} />
            </BillingPortalRedirectButton>

            <span className={'text-xs text-gray-500 dark:text-gray-400'}>
              <Trans i18nKey={'subscription:manageBillingDescription'} />
            </span>
          </div>
        </If>
      </div>
    </div>
  );
};

export default PlanSelectionForm;

function NoPermissionsAlert() {
  return (
    <Alert variant={'warning'}>
      <AlertTitle>
        <Trans i18nKey={'subscription:noPermissionsAlertHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'subscription:noPermissionsAlertBody'} />
      </AlertDescription>
    </Alert>
  );
}

function CheckoutErrorMessage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={'flex flex-col space-y-2'}>
      <span className={'text-sm font-medium text-red-500'}>
        <Trans i18nKey={'subscription:unknownErrorAlertHeading'} />
      </span>

      <Button onClick={onRetry} variant={'ghost'}>
        <Trans i18nKey={'common:retry'} />
      </Button>
    </div>
  );
}
