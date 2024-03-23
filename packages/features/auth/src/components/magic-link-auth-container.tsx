'use client';

import type { FormEventHandler } from 'react';
import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSignInWithOtp } from '@kit/supabase/hooks/use-sign-in-with-otp';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Trans } from '@kit/ui/trans';

export function MagicLinkAuthContainer({
  inviteCode,
  redirectUrl,
}: {
  inviteCode?: string;
  redirectUrl: string;
}) {
  const { t } = useTranslation();
  const signInWithOtpMutation = useSignInWithOtp();

  const onSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();

      const target = event.currentTarget;
      const data = new FormData(target);
      const email = data.get('email') as string;
      const queryParams = inviteCode ? `?inviteCode=${inviteCode}` : '';

      const emailRedirectTo = [redirectUrl, queryParams].join('');

      const promise = signInWithOtpMutation.mutateAsync({
        email,
        options: {
          emailRedirectTo,
        },
      });

      toast.promise(promise, {
        loading: t('auth:sendingEmailLink'),
        success: t(`auth:sendLinkSuccessToast`),
        error: t(`auth:errors.link`),
      });
    },
    [inviteCode, redirectUrl, signInWithOtpMutation, t],
  );

  if (signInWithOtpMutation.data) {
    return (
      <Alert variant={'success'}>
        <AlertDescription>
          <Trans i18nKey={'auth:sendLinkSuccess'} />
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form className={'w-full'} onSubmit={onSubmit}>
      <If condition={signInWithOtpMutation.error}>
        <Alert variant={'destructive'}>
          <AlertDescription>
            <Trans i18nKey={'auth:errors.link'} />
          </AlertDescription>
        </Alert>
      </If>

      <div className={'flex flex-col space-y-4'}>
        <Label>
          <Trans i18nKey={'common:emailAddress'} />

          <Input
            data-test={'email-input'}
            required
            type="email"
            placeholder={t('auth:emailPlaceholder')}
            name={'email'}
          />
        </Label>

        <Button disabled={signInWithOtpMutation.isPending}>
          <If
            condition={signInWithOtpMutation.isPending}
            fallback={<Trans i18nKey={'auth:sendEmailLink'} />}
          >
            <Trans i18nKey={'auth:sendingEmailLink'} />
          </If>
        </Button>
      </div>
    </form>
  );
}
