'use client';

import { useState } from 'react';

import { useFormStatus } from 'react-dom';

import { useRouter } from 'next/navigation';

import type { User } from '@supabase/gotrue-js';

import ErrorBoundary from '@/components/app/ErrorBoundary';

import useCsrfToken from '@kit/hooks/use-csrf-token';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import { banUser } from '../actions.server';

function BanUserModal({
  user,
}: React.PropsWithChildren<{
  user: User;
}>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const csrfToken = useCsrfToken();
  const displayText = user.email ?? user.phone ?? '';

  const onDismiss = () => {
    router.back();

    setIsOpen(false);
  };

  const onConfirm = async () => {
    await banUser({
      userId: user.id,
      csrfToken,
    });

    onDismiss();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>

          <ErrorBoundary fallback={<BanErrorAlert />}>
            <form action={onConfirm}>
              <div className={'flex flex-col space-y-4'}>
                <div className={'flex flex-col space-y-2 text-sm'}>
                  <p>
                    You are about to ban <b>{displayText}</b>.
                  </p>

                  <p>
                    You can unban them later, but they will not be able to log
                    in or use their account until you do.
                  </p>

                  <Label>
                    Type <b>BAN</b> to confirm
                    <Input type="text" required pattern={'BAN'} />
                  </Label>

                  <p>Are you sure you want to do this?</p>
                </div>

                <div className={'flex justify-end space-x-2.5'}>
                  <SubmitButton />
                </div>
              </div>
            </form>
          </ErrorBoundary>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} variant={'destructive'}>
      Yes, ban user
    </Button>
  );
}

export default BanUserModal;

function BanErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>There was an error banning this user.</AlertTitle>

      <AlertDescription>Check the logs for more information.</AlertDescription>
    </Alert>
  );
}
