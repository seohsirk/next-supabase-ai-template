'use client';

import { useCallback, useState } from 'react';

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
import { Label } from '@kit/ui/label';
import { Trans } from '@kit/ui/trans';

const PasswordUpdateSchema = z
  .object({
    currentPassword: z.string().min(8).max(99),
    newPassword: z.string().min(8).max(99),
    repeatPassword: z.string().min(8).max(99),
  })
  .refine(
    (values) => {
      return values.newPassword === values.repeatPassword;
    },
    {
      path: ['repeatPassword'],
      message: 'Passwords do not match',
    },
  );

export const UpdatePasswordForm = ({
  user,
  callbackPath,
}: {
  user: User;
  callbackPath: string;
}) => {
  const { t } = useTranslation();
  const updateUserMutation = useUpdateUser();
  const [needsReauthentication, setNeedsReauthentication] = useState(false);

  const form = useForm({
    resolver: zodResolver(PasswordUpdateSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      repeatPassword: '',
    },
  });

  const updatePasswordFromCredential = useCallback(
    (password: string) => {
      const redirectTo = [window.location.origin, callbackPath].join('');

      const promise = updateUserMutation
        .mutateAsync({ password, redirectTo })
        .then(() => {
          form.reset();
        })
        .catch((error) => {
          if (error?.includes('Password update requires reauthentication')) {
            setNeedsReauthentication(true);
          }
        });

      toast.promise(promise, {
        success: t(`profile:updatePasswordSuccess`),
        error: t(`profile:updatePasswordError`),
        loading: t(`profile:updatePasswordLoading`),
      });
    },
    [callbackPath, updateUserMutation, t, form],
  );

  const updatePasswordCallback = useCallback(
    async ({ newPassword }: { newPassword: string }) => {
      const email = user.email;

      // if the user does not have an email assigned, it's possible they
      // don't have an email/password factor linked, and the UI is out of sync
      if (!email) {
        return Promise.reject(t(`profile:cannotUpdatePassword`));
      }

      updatePasswordFromCredential(newPassword);
    },
    [user.email, updatePasswordFromCredential, t],
  );

  return (
    <Form {...form}>
      <form
        data-test={'update-password-form'}
        onSubmit={form.handleSubmit(updatePasswordCallback)}
      >
        <div className={'flex flex-col space-y-4'}>
          <If condition={updateUserMutation.data}>
            <Alert variant={'success'}>
              <AlertTitle>
                <Trans i18nKey={'profile:updatePasswordSuccess'} />
              </AlertTitle>

              <AlertDescription>
                <Trans i18nKey={'profile:updatePasswordSuccessMessage'} />
              </AlertDescription>
            </Alert>
          </If>

          <If condition={needsReauthentication}>
            <Alert variant={'warning'}>
              <AlertTitle>
                <Trans i18nKey={'profile:needsReauthentication'} />
              </AlertTitle>

              <AlertDescription>
                <Trans i18nKey={'profile:needsReauthenticationDescription'} />
              </AlertDescription>
            </Alert>
          </If>

          <FormField
            name={'newPassword'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Label>
                      <Trans i18nKey={'profile:newPassword'} />
                    </Label>
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'new-password'}
                      required
                      type={'password'}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name={'repeatPassword'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Label>
                      <Trans i18nKey={'profile:repeatPassword'} />
                    </Label>
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'repeat-password'}
                      required
                      type={'password'}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div>
            <Button>
              <Trans i18nKey={'profile:updatePasswordSubmitLabel'} />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
