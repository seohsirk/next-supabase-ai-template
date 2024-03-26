'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { transferOwnershipAction } from '../../actions/account-members-server-actions';
import { TransferOwnershipConfirmationSchema } from '../../schema/transfer-ownership-confirmation.schema';

export const TransferOwnershipDialog: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  accountId: string;
  userId: string;
  targetDisplayName: string;
}> = ({ isOpen, setIsOpen, targetDisplayName, accountId, userId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="organization:transferOwnership" />
          </DialogTitle>

          <DialogDescription>
            Transfer ownership of the organization to another member.
          </DialogDescription>
        </DialogHeader>

        <TransferOrganizationOwnershipForm
          accountId={accountId}
          userId={userId}
          targetDisplayName={targetDisplayName}
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

function TransferOrganizationOwnershipForm({
  accountId,
  userId,
  targetDisplayName,
  setIsOpen,
}: {
  userId: string;
  accountId: string;
  targetDisplayName: string;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();

  const onSubmit = () => {
    startTransition(async () => {
      try {
        await transferOwnershipAction({
          accountId,
          userId,
        });

        setIsOpen(false);
      } catch (error) {
        setError(true);
      }
    });
  };

  const form = useForm({
    resolver: zodResolver(TransferOwnershipConfirmationSchema),
    defaultValues: {
      confirmation: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-2 text-sm'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <If condition={error}>
          <TransferOwnershipErrorAlert />
        </If>

        <p>
          <Trans
            i18nKey={'teams:transferOwnershipDisclaimer'}
            values={{
              member: targetDisplayName,
            }}
            components={{ b: <b /> }}
          />
        </p>

        <p>
          <Trans i18nKey={'common:modalConfirmationQuestion'} />
        </p>

        <FormField
          name={'confirmation'}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  Please type TRANSFER to confirm the transfer of ownership.
                </FormLabel>

                <FormControl>
                  <Input type={'text'} required {...field} />
                </FormControl>

                <FormDescription>
                  Please make sure you understand the implications of this
                  action.
                </FormDescription>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <Button
          type={'submit'}
          data-test={'confirm-transfer-ownership-button'}
          variant={'destructive'}
          disabled={pending}
        >
          <If
            condition={pending}
            fallback={<Trans i18nKey={'teams:transferOwnership'} />}
          >
            <Trans i18nKey={'teams:transferringOwnership'} />
          </If>
        </Button>
      </form>
    </Form>
  );
}

function TransferOwnershipErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:transferOrganizationErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'teams:transferOrganizationErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
