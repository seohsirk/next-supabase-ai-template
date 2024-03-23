'use client';

import { useUser } from '@kit/supabase/hooks/use-user';

import { UpdateEmailForm } from './update-email-form';

export function UpdateEmailFormContainer(props: { callbackPath: string }) {
  const { data: user } = useUser();

  if (!user) {
    return null;
  }

  return <UpdateEmailForm callbackPath={props.callbackPath} user={user} />;
}
