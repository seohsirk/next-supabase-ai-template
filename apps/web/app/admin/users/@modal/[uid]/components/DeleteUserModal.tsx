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
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import { deleteUserAction } from '../actions.server';

function DeleteUserModal({
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
      await deleteUserAction({
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
          <DialogTitle>Deleting User</DialogTitle>
        </DialogHeader>

        <form action={onConfirm}>
          <div className={'flex flex-col space-y-4'}>
            <div className={'flex flex-col space-y-2 text-sm'}>
              <p>
                You are about to delete the user <b>{displayText}</b>.
              </p>

              <p>
                Delete this user will also delete the organizations they are a
                Owner of, and potentially the data associated with those
                organizations.
              </p>

              <p>
                <b>This action is not reversible</b>.
              </p>

              <p>Are you sure you want to do this?</p>
            </div>

            <div>
              <Label>
                Confirm by typing <b>DELETE</b>
                <Input required type={'text'} pattern={'DELETE'} />
              </Label>
            </div>

            <div className={'flex justify-end space-x-2.5'}>
              <Button disabled={pending} variant={'destructive'}>
                Yes, delete user
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteUserModal;
