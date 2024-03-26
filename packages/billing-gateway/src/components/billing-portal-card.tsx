'use client';

import { ArrowUpRight } from 'lucide-react';

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
        <CardTitle>Manage your Billing Details</CardTitle>

        <CardDescription>
          You can change your plan or cancel your subscription at any time.
        </CardDescription>
      </CardHeader>

      <CardContent className={'space-y-2'}>
        <div>
          <Button>
            <span>Visit the billing portal</span>

            <ArrowUpRight className={'h-4'} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
