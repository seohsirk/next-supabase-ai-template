import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@kit/ui/dialog';
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

import { createOrganizationAccountAction } from '../actions/create-team-account-server-actions';
import { CreateTeamSchema } from '../schema/create-team.schema';

export function CreateTeamAccountDialog(
  props: React.PropsWithChildren<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>,
) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <DialogContent>
        <DialogTitle>
          <Trans i18nKey={'organization:createOrganizationModalHeading'} />
        </DialogTitle>

        <CreateOrganizationAccountForm />
      </DialogContent>
    </Dialog>
  );
}

function CreateOrganizationAccountForm() {
  const [error, setError] = useState<boolean>();
  const [pending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof CreateTeamSchema>>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(CreateTeamSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          startTransition(async () => {
            try {
              await createOrganizationAccountAction(data);
            } catch (error) {
              setError(true);
            }
          });
        })}
      >
        <div className={'flex flex-col space-y-4'}>
          <If condition={error}>
            <CreateOrganizationErrorAlert />
          </If>

          <FormField
            name={'name'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey={'organization:organizationNameLabel'} />
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'create-organization-name-input'}
                      required
                      minLength={2}
                      maxLength={50}
                      placeholder={''}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Your organization name should be unique and descriptive.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <Button
            data-test={'confirm-create-organization-button'}
            disabled={pending}
          >
            <Trans i18nKey={'organization:createOrganizationSubmitLabel'} />
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CreateOrganizationErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'organization:createOrganizationErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'organization:createOrganizationErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
