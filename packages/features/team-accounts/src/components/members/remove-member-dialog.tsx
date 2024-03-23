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

import { removeMemberFromAccountAction } from '../../actions/account-members-server-actions';

export const RemoveMemberDialog: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  accountId: string;
  userId: string;
}> = ({ isOpen, setIsOpen, accountId, userId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="organization:removeMemberModalHeading" />
          </DialogTitle>

          <DialogDescription>
            Remove this member from the organization.
          </DialogDescription>
        </DialogHeader>

        <RemoveMemberForm
          setIsOpen={setIsOpen}
          accountId={accountId}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
};

function RemoveMemberForm({
  accountId,
  userId,
  setIsOpen,
}: {
  accountId: string;
  userId: string;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();

  const onMemberRemoved = () => {
    startTransition(async () => {
      try {
        await removeMemberFromAccountAction({ accountId, userId });

        setIsOpen(false);
      } catch (e) {
        setError(true);
      }
    });
  };

  return (
    <form action={onMemberRemoved}>
      <div className={'flex flex-col space-y-6'}>
        <p className={'text-sm'}>
          <Trans i18nKey={'common:modalConfirmationQuestion'} />
        </p>

        <If condition={error}>
          <RemoveMemberErrorAlert />
        </If>

        <Button
          data-test={'confirm-remove-member'}
          variant={'destructive'}
          disabled={isSubmitting}
          onClick={onMemberRemoved}
        >
          <Trans i18nKey={'organization:removeMemberSubmitLabel'} />
        </Button>
      </div>
    </form>
  );
}

function RemoveMemberErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'organization:removeMemberErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'organization:removeMemberErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
