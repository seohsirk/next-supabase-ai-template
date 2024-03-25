import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { createBillingPortalSession } from '../server-actions';

export function BillingPortalForm(props: { accountId: string }) {
  return (
    <div className={'mx-auto w-full max-w-2xl'}>
      <Card>
        <CardHeader>
          <CardTitle>Manage your Team Plan</CardTitle>

          <CardDescription>
            You can change your plan at any time.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={createBillingPortalSession}>
            <input type={'hidden'} name={'accountId'} value={props.accountId} />

            <Button>Manage your Billing Settings</Button>

            <span>
              Visit the billing portal to manage your subscription (update
              payment method, cancel subscription, etc.)
            </span>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
