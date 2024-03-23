'use client';

import React from 'react';

import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import Trans from '@/components/app/Trans';

enum SubscriptionStatusQueryParams {
  Success = 'success',
  Cancel = 'cancel',
  Error = 'error',
}

function PlansStatusAlertContainer() {
  const status = useSubscriptionStatus();

  if (status === undefined) {
    return null;
  }

  return <PlansStatusAlert status={status as SubscriptionStatusQueryParams} />;
}

export default PlansStatusAlertContainer;

function PlansStatusAlert({
  status,
}: {
  status: SubscriptionStatusQueryParams;
}) {
  switch (status) {
    case SubscriptionStatusQueryParams.Cancel:
      return (
        <Alert variant={'warning'}>
          <AlertTitle>
            <Trans i18nKey={'subscription:checkOutCanceledAlertHeading'} />
          </AlertTitle>

          <AlertDescription>
            <Trans i18nKey={'subscription:checkOutCanceledAlert'} />
          </AlertDescription>
        </Alert>
      );

    case SubscriptionStatusQueryParams.Error:
      return (
        <Alert variant={'destructive'}>
          <AlertTitle>
            <Trans i18nKey={'subscription:unknownErrorAlertHeading'} />
          </AlertTitle>

          <AlertDescription>
            <Trans i18nKey={'subscription:unknownErrorAlert'} />
          </AlertDescription>
        </Alert>
      );

    case SubscriptionStatusQueryParams.Success:
      return (
        <Alert variant={'success'}>
          <AlertTitle>
            <Trans i18nKey={'subscription:checkOutCompletedAlertHeading'} />
          </AlertTitle>

          <AlertDescription>
            <Trans i18nKey={'subscription:checkOutCompletedAlert'} />
          </AlertDescription>
        </Alert>
      );
  }
}

function useSubscriptionStatus() {
  const params = useSearchParams();

  return getStatus(params);
}

function getStatus(params: ReadonlyURLSearchParams | null) {
  if (!params) {
    return;
  }

  const error = params.has(SubscriptionStatusQueryParams.Error);
  const canceled = params.has(SubscriptionStatusQueryParams.Cancel);
  const success = params.has(SubscriptionStatusQueryParams.Success);

  if (canceled) {
    return SubscriptionStatusQueryParams.Cancel;
  } else if (success) {
    return SubscriptionStatusQueryParams.Success;
  } else if (error) {
    return SubscriptionStatusQueryParams.Error;
  }
}
