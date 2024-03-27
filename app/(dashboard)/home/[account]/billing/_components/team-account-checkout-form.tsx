'use client';

import { useState, useTransition } from 'react';

import { useParams } from 'next/navigation';

import { EmbeddedCheckout, PlanPicker } from '@kit/billing-gateway/components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import billingConfig from '~/config/billing.config';

import { createTeamAccountCheckoutSession } from '../server-actions';

export function TeamAccountCheckoutForm(params: { accountId: string }) {
  const routeParams = useParams();
  const [pending, startTransition] = useTransition();
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);

  // If the checkout token is set, render the embedded checkout component
  if (checkoutToken) {
    return (
      <EmbeddedCheckout
        checkoutToken={checkoutToken}
        provider={billingConfig.provider}
      />
    );
  }

  // Otherwise, render the plan picker component
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage your Team Plan</CardTitle>

        <CardDescription>You can change your plan at any time.</CardDescription>
      </CardHeader>

      <CardContent>
        <PlanPicker
          pending={pending}
          config={billingConfig}
          onSubmit={({ planId, productId }) => {
            startTransition(async () => {
              const slug = routeParams.account as string;

              const { checkoutToken } = await createTeamAccountCheckoutSession({
                planId,
                productId,
                slug,
                accountId: params.accountId,
              });

              setCheckoutToken(checkoutToken);
            });
          }}
        />
      </CardContent>
    </Card>
  );
}
