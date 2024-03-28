'use client';

import { useFormStatus } from 'react-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { ErrorBoundary } from '@kit/ui/error-boundary';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { deleteTeamAccountAction } from '../../server/actions/delete-team-account-server-actions';
import { leaveTeamAccountAction } from '../../server/actions/leave-team-account-server-actions';

export function TeamAccountDangerZone({
  account,
  userIsPrimaryOwner,
}: React.PropsWithChildren<{
  account: {
    name: string;
    id: string;
  };

  userIsPrimaryOwner: boolean;
}>) {
  if (userIsPrimaryOwner) {
    return <DeleteTeamContainer account={account} />;
  }

  return <LeaveTeamContainer account={account} />;
}

function DeleteTeamContainer(props: {
  account: {
    name: string;
    id: string;
  };
}) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-1'}>
        <span className={'font-medium'}>
          <Trans i18nKey={'teams:deleteTeam'} />
        </span>

        <p className={'text-sm text-gray-500'}>
          <Trans
            i18nKey={'teams:deleteTeamDescription'}
            values={{
              teamName: props.account.name,
            }}
          />
        </p>
      </div>

      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              data-test={'delete-team-button'}
              type={'button'}
              variant={'destructive'}
            >
              <Trans i18nKey={'teams:deleteTeam'} />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <Trans i18nKey={'teams:deletingTeam'} />
              </AlertDialogTitle>

              <AlertDialogDescription>
                <Trans
                  i18nKey={'teams:deletingTeamDescription'}
                  values={{
                    teamName: props.account.name,
                  }}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>

            <DeleteTeamConfirmationForm
              name={props.account.name}
              id={props.account.id}
            />
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function DeleteTeamConfirmationForm({
  name,
  id,
}: {
  name: string;
  id: string;
}) {
  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(
      z.object({
        name: z.string().refine((value) => value === name, {
          message: 'Name does not match',
          path: ['name'],
        }),
      }),
    ),
    defaultValues: {
      name: '',
    },
  });

  return (
    <ErrorBoundary fallback={<DeleteTeamErrorAlert />}>
      <Form {...form}>
        <form
          className={'flex flex-col space-y-4'}
          action={deleteTeamAccountAction}
        >
          <div className={'flex flex-col space-y-2'}>
            <div
              className={
                'border-2 border-red-500 p-4 text-sm text-red-500' +
                ' my-4 flex flex-col space-y-2'
              }
            >
              <div>
                <Trans
                  i18nKey={'teams:deleteTeamDisclaimer'}
                  values={{
                    teamName: name,
                  }}
                />
              </div>

              <div className={'text-sm'}>
                <Trans i18nKey={'common:modalConfirmationQuestion'} />
              </div>
            </div>

            <input type="hidden" value={id} name={'accountId'} />

            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey={'teams:teamNameInputLabel'} />
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'delete-team-input-field'}
                      required
                      type={'text'}
                      className={'w-full'}
                      placeholder={''}
                      pattern={name}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    <Trans i18nKey={'teams:deleteTeamInputField'} />
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
              name={'confirm'}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans i18nKey={'common:cancel'} />
            </AlertDialogCancel>

            <DeleteTeamSubmitButton />
          </AlertDialogFooter>
        </form>
      </Form>
    </ErrorBoundary>
  );
}

function DeleteTeamSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={'confirm-delete-team-button'}
      disabled={pending}
      variant={'destructive'}
    >
      <Trans i18nKey={'teams:deleteTeam'} />
    </Button>
  );
}

function LeaveTeamContainer(props: {
  account: {
    name: string;
    id: string;
  };
}) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <p className={'text-muted-foreground text-sm'}>
        <Trans
          i18nKey={'teams:leaveTeamDescription'}
          values={{
            teamName: props.account.name,
          }}
        />
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div>
            <Button
              data-test={'leave-team-button'}
              type={'button'}
              variant={'destructive'}
            >
              <Trans i18nKey={'teams:leaveTeam'} />
            </Button>
          </div>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans i18nKey={'teams:leavingTeamModalHeading'} />
            </AlertDialogTitle>

            <AlertDialogDescription>
              <Trans i18nKey={'teams:leavingTeamModalDescription'} />
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ErrorBoundary fallback={<LeaveTeamErrorAlert />}>
            <form action={leaveTeamAccountAction}>
              <input type={'hidden'} value={props.account.id} name={'id'} />
            </form>
          </ErrorBoundary>

          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans i18nKey={'common:cancel'} />
            </AlertDialogCancel>

            <LeaveTeamSubmitButton />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LeaveTeamSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={'confirm-leave-organization-button'}
      disabled={pending}
      variant={'destructive'}
    >
      <Trans i18nKey={'teams:leaveTeam'} />
    </Button>
  );
}

function LeaveTeamErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:leaveTeamErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'common:genericError'} />
      </AlertDescription>
    </Alert>
  );
}

function DeleteTeamErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:deleteTeamErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'common:genericError'} />
      </AlertDescription>
    </Alert>
  );
}
