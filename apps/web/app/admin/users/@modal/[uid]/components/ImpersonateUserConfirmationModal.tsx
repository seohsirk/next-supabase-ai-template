'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import type { User } from '@supabase/gotrue-js';

import If from '@/components/app/If';
import LoadingOverlay from '@/components/app/LoadingOverlay';

import useCsrfToken from '@kit/hooks/use-csrf-token';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

import { impersonateUser } from '../actions.server';
import ImpersonateUserAuthSetter from '../components/ImpersonateUserAuthSetter';

function ImpersonateUserConfirmationModal({
  user,
}: React.PropsWithChildren<{
  user: User;
}>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const csrfToken = useCsrfToken();
  const [error, setError] = useState<boolean>();

  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  }>();

  const displayText = user.email ?? user.phone ?? '';

  const onDismiss = () => {
    router.back();

    setIsOpen(false);
  };

  const onConfirm = () => {
    startTransition(async () => {
      try {
        const response = await impersonateUser({
          userId: user.id,
          csrfToken,
        });

        setTokens(response);
      } catch (e) {
        setError(true);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impersonate User</DialogTitle>
        </DialogHeader>

        <If condition={tokens}>
          {(tokens) => {
            return (
              <>
                <ImpersonateUserAuthSetter tokens={tokens} />

                <LoadingOverlay>Setting up your session...</LoadingOverlay>
              </>
            );
          }}
        </If>

        <If condition={error}>
          <Alert variant={'destructive'}>
            <AlertTitle>Impersonation Error</AlertTitle>
            <AlertDescription>
              Sorry, something went wrong. Please check the logs.
            </AlertDescription>
          </Alert>
        </If>

        <If condition={!error && !tokens}>
          <div className={'flex flex-col space-y-4'}>
            <div className={'flex flex-col space-y-2 text-sm'}>
              <p>
                You are about to impersonate the account belonging to{' '}
                <b>{displayText}</b> with ID <b>{user.id}</b>.
              </p>

              <p>
                You will be able to log in as them, see and do everything they
                can. To return to your own account, simply log out.
              </p>

              <p>
                Like Uncle Ben said, with great power comes great
                responsibility. Use this power wisely.
              </p>
            </div>

            <div className={'flex justify-end space-x-2.5'}>
              <Button
                type={'button'}
                disabled={pending}
                variant={'destructive'}
                onClick={onConfirm}
              >
                Yes, let&apos;s do it
              </Button>
            </div>
          </div>
        </If>
      </DialogContent>
    </Dialog>
  );
}

export default ImpersonateUserConfirmationModal;
