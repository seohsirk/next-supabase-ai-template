'use client';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { ErrorBoundary } from '@kit/ui/error-boundary';
import { Form, FormControl, FormItem, FormLabel } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { deletePersonalAccountAction } from '../../server/personal-accounts-server-actions';

export function AccountDangerZone() {
  return <DeleteAccountContainer />;
}

function DeleteAccountContainer() {
  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm font-medium'}>
          <Trans i18nKey={'account:deleteAccount'} />
        </span>

        <p className={'text-muted-foreground text-sm'}>
          <Trans i18nKey={'account:deleteAccountDescription'} />
        </p>
      </div>

      <div>
        <DeleteAccountModal />
      </div>
    </div>
  );
}

function DeleteAccountModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-test={'delete-account-button'} variant={'destructive'}>
          <Trans i18nKey={'account:deleteAccount'} />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'account:deleteAccount'} />
          </DialogTitle>
        </DialogHeader>

        <ErrorBoundary fallback={<DeleteAccountErrorAlert />}>
          <DeleteAccountForm />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountForm() {
  const form = useForm();

  return (
    <Form {...form}>
      <form
        action={deletePersonalAccountAction}
        className={'flex flex-col space-y-4'}
      >
        <div className={'flex flex-col space-y-6'}>
          <div
            className={'border-destructive text-destructive border p-4 text-sm'}
          >
            <div className={'flex flex-col space-y-2'}>
              <div>
                <Trans i18nKey={'account:deleteAccountDescription'} />
              </div>

              <div>
                <Trans i18nKey={'common:modalConfirmationQuestion'} />
              </div>
            </div>
          </div>

          <FormItem>
            <FormLabel>
              <Trans i18nKey={'account:deleteProfileConfirmationInputLabel'} />
            </FormLabel>

            <FormControl>
              <Input
                data-test={'delete-account-input-field'}
                required
                name={'confirmation'}
                type={'text'}
                className={'w-full'}
                placeholder={''}
                pattern={`DELETE`}
              />
            </FormControl>
          </FormItem>
        </div>

        <div className={'flex justify-end space-x-2.5'}>
          <DeleteAccountSubmitButton />
        </div>
      </form>
    </Form>
  );
}

function DeleteAccountSubmitButton() {
  return (
    <Button
      data-test={'confirm-delete-account-button'}
      name={'action'}
      value={'delete'}
      variant={'destructive'}
    >
      <Trans i18nKey={'account:deleteAccount'} />
    </Button>
  );
}

function DeleteAccountErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <ExclamationTriangleIcon className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account:deleteAccountErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'common:genericError'} />
      </AlertDescription>
    </Alert>
  );
}
