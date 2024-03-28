'use client';

import { useFormStatus } from 'react-dom';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

export function InvitationSubmitButton(props: { accountName: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className={'w-full'} disabled={pending}>
      <Trans
        i18nKey={pending ? 'teams:joiningTeam' : 'teams:joinTeam'}
        values={{
          accountName: props.accountName,
        }}
      />
    </Button>
  );
}
