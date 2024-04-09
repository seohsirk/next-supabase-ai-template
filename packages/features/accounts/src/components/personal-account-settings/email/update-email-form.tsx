'use client';

import type { User } from '@supabase/supabase-js';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useUpdateUser } from '@kit/supabase/hooks/use-update-user-mutation';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { UpdateEmailSchema } from '../../../schema/update-email.schema';

function createEmailResolver(currentEmail: string, errorMessage: string) {
  return zodResolver(
    UpdateEmailSchema.withTranslation(errorMessage).refine((schema) => {
      return schema.email !== currentEmail;
    }),
  );
}

export function UpdateEmailForm({
  user,
  callbackPath,
}: {
  user: User;
  callbackPath: string;
}) {
  const { t } = useTranslation('account');
  const updateUserMutation = useUpdateUser();

  const updateEmail = ({ email }: { email: string }) => {
    // then, we update the user's email address
    const promise = async () => {
      const redirectTo = new URL(
        callbackPath,
        window.location.origin,
      ).toString();

      await updateUserMutation.mutateAsync({ email, redirectTo });
    };

    toast.promise(promise, {
      success: t(`updateEmailSuccess`),
      loading: t(`updateEmailLoading`),
      error: t(`updateEmailError`),
    });
  };

  const currentEmail = user.email;

  const form = useForm({
    resolver: createEmailResolver(currentEmail!, t('emailNotMatching')),
    defaultValues: {
      email: '',
      repeatEmail: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-4'}
        data-test={'update-email-form'}
        onSubmit={form.handleSubmit(updateEmail)}
      >
        <If condition={updateUserMutation.data}>
          <Alert variant={'success'}>
            <AlertTitle>
              <Trans i18nKey={'account:updateEmailSuccess'} />
            </AlertTitle>

            <AlertDescription>
              <Trans i18nKey={'account:updateEmailSuccessMessage'} />
            </AlertDescription>
          </Alert>
        </If>

        <div className={'flex flex-col space-y-4'}>
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'account:newEmail'} />
                </FormLabel>

                <FormControl>
                  <Input
                    data-test={'profile-new-email-input'}
                    required
                    type={'email'}
                    placeholder={''}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
            name={'email'}
          />

          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'account:repeatEmail'} />
                </FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    data-test={'profile-repeat-email-input'}
                    required
                    type={'email'}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
            name={'repeatEmail'}
          />

          <div>
            <Button disabled={updateUserMutation.isPending}>
              <Trans i18nKey={'account:updateEmailSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
