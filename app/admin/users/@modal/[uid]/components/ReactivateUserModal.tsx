'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import type { User } from '@supabase/gotrue-js';

import useCsrfToken from '@kit/hooks/use-csrf-token';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

import { reactivateUser } from '../actions.server';

function ReactivateUserModal({
  user,
}: React.PropsWithChildren<{
  user: User;
}>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [pending, startTransition] = useTransition();
  const csrfToken = useCsrfToken();
  const displayText = user.email ?? user.phone ?? '';

  const onDismiss = () => {
    router.back();

    setIsOpen(false);
  };

  const onConfirm = () => {
    startTransition(async () => {
      await reactivateUser({
        userId: user.id,
        csrfToken,
      });

      onDismiss();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reactivate User</DialogTitle>
        </DialogHeader>

        <div className={'flex flex-col space-y-4'}>
          <div className={'flex flex-col space-y-2 text-sm'}>
            <p>
              You are about to reactivate the account belonging to{' '}
              <b>{displayText}</b>.
            </p>

            <p>Are you sure you want to do this?</p>
          </div>

          <div className={'flex justify-end space-x-2.5'}>
            <Button disabled={pending} onClick={onConfirm}>
              Yes, reactivate user
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReactivateUserModal;
