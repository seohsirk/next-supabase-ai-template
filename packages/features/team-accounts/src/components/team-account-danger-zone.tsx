'use client';

import { useFormStatus } from 'react-dom';

import { Database } from '@kit/supabase/database';
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
import { Heading } from '@kit/ui/heading';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Trans } from '@kit/ui/trans';

import { deleteTeamAccountAction } from '../actions/delete-team-account-server-actions';
import { leaveTeamAccountAction } from '../actions/leave-team-account-server-actions';

type AccountData =
  Database['public']['Functions']['organization_account_workspace']['Returns'][0];

export function TeamAccountDangerZone({
  account,
  userId,
}: React.PropsWithChildren<{
  account: AccountData;
  userId: string;
}>) {
  const isPrimaryOwner = userId === account.primary_owner_user_id;

  if (isPrimaryOwner) {
    return <DeleteOrganizationContainer account={account} />;
  }

  return <LeaveOrganizationContainer account={account} />;
}

function DeleteOrganizationContainer(props: { account: AccountData }) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-1'}>
        <Heading level={6}>
          <Trans i18nKey={'teams:deleteOrganization'} />
        </Heading>

        <p className={'text-sm text-gray-500'}>
          <Trans
            i18nKey={'teams:deleteOrganizationDescription'}
            values={{
              organizationName: props.account.name,
            }}
          />
        </p>
      </div>

      <div>
        <Dialog>
          <DialogTrigger>
            <Button
              data-test={'delete-organization-button'}
              type={'button'}
              variant={'destructive'}
            >
              <Trans i18nKey={'teams:deleteOrganization'} />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Trans i18nKey={'teams:deletingOrganization'} />
              </DialogTitle>
            </DialogHeader>

            <DeleteOrganizationForm
              name={props.account.name}
              id={props.account.id}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function DeleteOrganizationForm({ name, id }: { name: string; id: string }) {
  return (
    <ErrorBoundary fallback={<DeleteOrganizationErrorAlert />}>
      <form
        className={'flex flex-col space-y-4'}
        action={deleteTeamAccountAction}
      >
        <div className={'flex flex-col space-y-2'}>
          <div
            className={
              'border-2 border-red-500 p-4 text-sm text-red-500' +
              ' flex flex-col space-y-2'
            }
          >
            <div>
              <Trans
                i18nKey={'teams:deleteOrganizationDisclaimer'}
                values={{
                  organizationName: name,
                }}
              />
            </div>

            <div className={'text-sm'}>
              <Trans i18nKey={'common:modalConfirmationQuestion'} />
            </div>
          </div>

          <input type="hidden" value={id} name={'id'} />

          <Label>
            <Trans i18nKey={'teams:organizationNameInputLabel'} />

            <Input
              name={'name'}
              data-test={'delete-organization-input-field'}
              required
              type={'text'}
              className={'w-full'}
              placeholder={''}
              pattern={name}
            />

            <span className={'text-xs'}>
              <Trans i18nKey={'teams:deleteOrganizationInputField'} />
            </span>
          </Label>
        </div>

        <div className={'flex justify-end space-x-2.5'}>
          <DeleteOrganizationSubmitButton />
        </div>
      </form>
    </ErrorBoundary>
  );
}

function DeleteOrganizationSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={'confirm-delete-organization-button'}
      disabled={pending}
      variant={'destructive'}
    >
      <Trans i18nKey={'teams:deleteOrganization'} />
    </Button>
  );
}

function LeaveOrganizationContainer(props: { account: AccountData }) {
  return (
    <div className={'flex flex-col space-y-4'}>
      <p>
        <Trans
          i18nKey={'teams:leaveOrganizationDescription'}
          values={{
            organizationName: props.account.name,
          }}
        />
      </p>

      <div>
        <Dialog>
          <DialogTrigger>
            <Button
              data-test={'leave-organization-button'}
              type={'button'}
              variant={'destructive'}
            >
              <Trans i18nKey={'teams:leaveOrganization'} />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Trans i18nKey={'teams:leavingOrganizationModalHeading'} />
              </DialogTitle>
            </DialogHeader>

            <ErrorBoundary fallback={<LeaveOrganizationErrorAlert />}>
              <form action={leaveTeamAccountAction}>
                <input type={'hidden'} value={props.account.id} name={'id'} />

                <div className={'flex flex-col space-y-4'}>
                  <div>
                    <div>
                      <Trans
                        i18nKey={'teams:leaveOrganizationDisclaimer'}
                        values={{
                          organizationName: props.account?.name,
                        }}
                      />
                    </div>
                  </div>

                  <div className={'flex justify-end space-x-2.5'}>
                    <LeaveOrganizationSubmitButton />
                  </div>
                </div>
              </form>
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function LeaveOrganizationSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      data-test={'confirm-leave-organization-button'}
      disabled={pending}
      variant={'destructive'}
    >
      <Trans i18nKey={'teams:leaveOrganization'} />
    </Button>
  );
}

function LeaveOrganizationErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:leaveOrganizationErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'common:genericError'} />
      </AlertDescription>
    </Alert>
  );
}

function DeleteOrganizationErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:deleteOrganizationErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'common:genericError'} />
      </AlertDescription>
    </Alert>
  );
}
