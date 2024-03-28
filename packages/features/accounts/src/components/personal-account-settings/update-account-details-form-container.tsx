'use client';

import { LoadingOverlay } from '@kit/ui/loading-overlay';

import {
  usePersonalAccountData,
  useRevalidatePersonalAccountDataQuery,
} from '../../hooks/use-personal-account-data';
import { UpdateAccountDetailsForm } from './update-account-details-form';

export function UpdateAccountDetailsFormContainer() {
  const user = usePersonalAccountData();
  const revalidateUserDataQuery = useRevalidatePersonalAccountDataQuery();

  if (user.isLoading) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user.data) {
    return null;
  }

  return (
    <UpdateAccountDetailsForm
      displayName={user.data.name ?? ''}
      userId={user.data.id}
      onUpdate={revalidateUserDataQuery}
    />
  );
}
