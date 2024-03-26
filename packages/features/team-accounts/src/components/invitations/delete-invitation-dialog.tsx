import { useState, useTransition } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { deleteInvitationAction } from '../../actions/account-invitations-server-actions';

export const DeleteInvitationDialog: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  invitationId: number;
}> = ({ isOpen, setIsOpen, invitationId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="organization:deleteInvitationDialogTitle" />
          </DialogTitle>

          <DialogDescription>
            Remove the invitation to join this account.
          </DialogDescription>
        </DialogHeader>

        <DeleteInvitationForm
          setIsOpen={setIsOpen}
          invitationId={invitationId}
        />
      </DialogContent>
    </Dialog>
  );
};

function DeleteInvitationForm({
  invitationId,
  setIsOpen,
}: {
  invitationId: number;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();

  const onInvitationRemoved = () => {
    startTransition(async () => {
      try {
        await deleteInvitationAction({ invitationId });

        setIsOpen(false);
      } catch (e) {
        setError(true);
      }
    });
  };

  return (
    <form action={onInvitationRemoved}>
      <div className={'flex flex-col space-y-6'}>
        <p className={'text-sm'}>
          <Trans i18nKey={'common:modalConfirmationQuestion'} />
        </p>

        <If condition={error}>
          <RemoveInvitationErrorAlert />
        </If>

        <Button
          data-test={'confirm-delete-invitation'}
          variant={'destructive'}
          disabled={isSubmitting}
        >
          Delete Invitation
        </Button>
      </div>
    </form>
  );
}

function RemoveInvitationErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:deleteInvitationErrorTitle'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'teams:deleteInvitationErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
