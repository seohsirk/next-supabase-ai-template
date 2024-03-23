'use client';

import { ArrowUpRightIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';

export function BillingPortalRedirectButton({
  children,
  customerId,
  className,
}: React.PropsWithChildren<{
  customerId: string;
  className?: string;
}>) {
  return (
    <form action={createBillingPortalSessionAction}>
      <input type={'hidden'} name={'customerId'} value={customerId} />

      <Button
        data-test={'manage-billing-redirect-button'}
        variant={'outline'}
        className={className}
      >
        <span className={'flex items-center space-x-2'}>
          <span>{children}</span>

          <ArrowUpRightIcon className={'h-3'} />
        </span>
      </Button>
    </form>
  );
}
