'use client';

import { useCallback, useTransition } from 'react';

import type { Session } from '@supabase/gotrue-js';

import useRefreshRoute from '@kit/shared/hooks/use-refresh-route';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

function ExistingUserInviteForm(
  props: React.PropsWithChildren<{
    session: Session;
    code: string;
  }>,
) {
  const signOut = useSignOut();
  const refresh = useRefreshRoute();
  const [isSubmitting, startTransition] = useTransition();

  const onSignOut = useCallback(async () => {
    await signOut.mutateAsync();
    refresh();
  }, [refresh, signOut]);

  const onInviteAccepted = useCallback(() => {
    return startTransition(async () => {
      await acceptInviteAction({
        code: props.code,
      });
    });
  }, [props.code, startTransition]);

  return (
    <>
      <div className={'flex flex-col space-y-4'}>
        <p className={'text-center text-sm'}>
          <Trans
            i18nKey={'auth:clickToAcceptAs'}
            values={{ email: props.session?.user.email }}
            components={{ b: <b /> }}
          />
        </p>

        <Button
          className={'w-full'}
          disabled={isSubmitting}
          onClick={onInviteAccepted}
          data-test={'accept-invite-submit-button'}
          type={'submit'}
        >
          <Trans i18nKey={'auth:acceptInvite'} />
        </Button>

        <div>
          <div className={'flex flex-col space-y-4'}>
            <p className={'text-center'}>
              <span
                className={
                  'text-center text-sm text-gray-700 dark:text-gray-300'
                }
              >
                <Trans i18nKey={'auth:acceptInviteWithDifferentAccount'} />
              </span>
            </p>

            <div className={'flex justify-center'}>
              <Button
                data-test={'invite-sign-out-button'}
                disabled={isSubmitting}
                variant={'ghost'}
                size={'sm'}
                onClick={onSignOut}
                type={'button'}
              >
                <Trans i18nKey={'auth:signOut'} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExistingUserInviteForm;
