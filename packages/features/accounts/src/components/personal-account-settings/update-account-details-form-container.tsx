'use client';

import {
  usePersonalAccountData,
  useRevalidatePersonalAccountDataQuery,
} from '../../hooks/use-personal-account-data';
import { UpdateAccountDetailsForm } from './update-account-details-form';

export function UpdateAccountDetailsFormContainer() {
  const user = usePersonalAccountData();
  const invalidateUserDataQuery = useRevalidatePersonalAccountDataQuery();

  if (!user.data) {
    return null;
  }

  return (
    <UpdateAccountDetailsForm
      displayName={user.data.name ?? ''}
      userId={user.data.id}
      onUpdate={invalidateUserDataQuery}
    />
  );
}
