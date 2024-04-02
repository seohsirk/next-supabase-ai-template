'use client';

import { useRouter } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export default function BillingErrorPage() {
  const router = useRouter();

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<Trans i18nKey={'common:billingTabDescription'} />}
      />

      <PageBody>
        <div className={'flex flex-col space-y-4'}>
          <Alert variant={'destructive'}>
            <AlertTitle>
              <Trans i18nKey={'billing:planPickerAlertErrorTitle'} />
            </AlertTitle>

            <AlertDescription>
              <Trans i18nKey={'billing:planPickerAlertErrorDescription'} />
            </AlertDescription>
          </Alert>

          <div>
            <Button variant={'outline'} onClick={() => router.refresh()}>
              <Trans i18nKey={'common:retry'} />
            </Button>
          </div>
        </div>
      </PageBody>
    </>
  );
}
