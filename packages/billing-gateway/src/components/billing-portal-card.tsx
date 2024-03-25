'use client';

import { ArrowRightIcon } from '@radix-ui/react-icons';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

export function BillingPortalCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage your Subscription</CardTitle>

        <CardDescription>
          You can change your plan or cancel your subscription at any time.
        </CardDescription>
      </CardHeader>

      <CardContent className={'space-y-2'}>
        <Button className={'w-full'}>
          <span>Manage your Billing Settings</span>
          <ArrowRightIcon className={'ml-2 h-4'} />
        </Button>

        <p className={'text-sm'}>
          Visit the billing portal to manage your subscription (update payment
          method, cancel subscription, etc.)
        </p>
      </CardContent>
    </Card>
  );
}
