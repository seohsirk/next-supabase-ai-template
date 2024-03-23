'use client';

import { useCallback } from 'react';

import type { User } from '@supabase/gotrue-js';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

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

const UpdateEmailSchema = z
  .object({
    email: z.string().email(),
    repeatEmail: z.string().email(),
  })
  .refine(
    (values) => {
      return values.email === values.repeatEmail;
    },
    {
      path: ['repeatEmail'],
      message: 'Emails do not match',
    },
  );

function createEmailResolver(currentEmail: string) {
  return zodResolver(
    UpdateEmailSchema.refine(
      (values) => {
        return values.email !== currentEmail;
      },
      {
        path: ['email'],
        message: 'New email must be different from current email',
      },
    ),
  );
}

export function UpdateEmailForm({
  user,
  callbackPath,
}: {
  user: User;
  callbackPath: string;
}) {
  const { t } = useTranslation();
  const updateUserMutation = useUpdateUser();

  const updateEmail = useCallback(
    (email: string) => {
      const redirectTo = new URL(callbackPath, window.location.host).toString();

      // then, we update the user's email address
      const promise = updateUserMutation.mutateAsync({ email, redirectTo });

      return toast.promise(promise, {
        success: t(`profile:updateEmailSuccess`),
        loading: t(`profile:updateEmailLoading`),
        error: (error: Error) => {
          return error.message ?? t(`profile:updateEmailError`);
        },
      });
    },
    [callbackPath, t, updateUserMutation],
  );

  const currentEmail = user.email;

  const form = useForm({
    resolver: createEmailResolver(currentEmail!),
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
        onSubmit={form.handleSubmit((values) => {
          return updateEmail(values.email);
        })}
      >
        <If condition={updateUserMutation.data}>
          <Alert variant={'success'}>
            <AlertTitle>
              <Trans i18nKey={'profile:updateEmailSuccess'} />
            </AlertTitle>

            <AlertDescription>
              <Trans i18nKey={'profile:updateEmailSuccessMessage'} />
            </AlertDescription>
          </Alert>
        </If>

        <div className={'flex flex-col space-y-4'}>
          <FormField
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={'profile:newEmail'} />
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
                  <Trans i18nKey={'profile:repeatEmail'} />
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
            <Button>
              <Trans i18nKey={'profile:updateEmailSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
