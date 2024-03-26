'use client';

import { useState } from 'react';

import { useSignInWithOtp } from '@kit/supabase/hooks/use-sign-in-with-otp';
import { useVerifyOtp } from '@kit/supabase/hooks/use-verify-otp';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { OtpInput } from '@kit/ui/otp-input';
import { Trans } from '@kit/ui/trans';

export function EmailOtpContainer({
  shouldCreateUser,
  onSignIn,
  inviteCode,
  redirectUrl,
}: React.PropsWithChildren<{
  inviteCode?: string;
  redirectUrl: string;
  shouldCreateUser: boolean;
  onSignIn?: () => void;
}>) {
  const [email, setEmail] = useState('');

  if (email) {
    return (
      <VerifyOtpForm
        redirectUrl={redirectUrl}
        inviteCode={inviteCode}
        onSuccess={onSignIn}
        email={email}
      />
    );
  }

  return (
    <EmailOtpForm onSuccess={setEmail} shouldCreateUser={shouldCreateUser} />
  );
}

function VerifyOtpForm({
  email,
  inviteCode,
  onSuccess,
  redirectUrl,
}: {
  email: string;
  redirectUrl: string;
  onSuccess?: () => void;
  inviteCode?: string;
}) {
  const verifyOtpMutation = useVerifyOtp();
  const [verifyCode, setVerifyCode] = useState('');

  return (
    <form
      className={'w-full'}
      onSubmit={async (event) => {
        event.preventDefault();

        const queryParams = inviteCode ? `?inviteCode=${inviteCode}` : '';
        const redirectTo = [redirectUrl, queryParams].join('');

        await verifyOtpMutation.mutateAsync({
          email,
          token: verifyCode,
          type: 'email',
          options: {
            redirectTo,
          },
        });

        onSuccess && onSuccess();
      }}
    >
      <div className={'flex flex-col space-y-4'}>
        <OtpInput onValid={setVerifyCode} onInvalid={() => setVerifyCode('')} />

        <Button disabled={verifyOtpMutation.isPending || !verifyCode}>
          {verifyOtpMutation.isPending ? (
            <Trans i18nKey={'account:verifyingCode'} />
          ) : (
            <Trans i18nKey={'account:submitVerificationCode'} />
          )}
        </Button>
      </div>
    </form>
  );
}

function EmailOtpForm({
  shouldCreateUser,
  onSuccess,
}: React.PropsWithChildren<{
  shouldCreateUser: boolean;
  onSuccess: (email: string) => void;
}>) {
  const signInWithOtpMutation = useSignInWithOtp();

  return (
    <form
      className={'w-full'}
      onSubmit={async (event) => {
        event.preventDefault();

        const email = event.currentTarget.email.value;

        await signInWithOtpMutation.mutateAsync({
          email,
          options: {
            shouldCreateUser,
          },
        });

        onSuccess(email);
      }}
    >
      <div className={'flex flex-col space-y-4'}>
        <Label>
          <Trans i18nKey={'auth:emailAddress'} />
          <Input name={'email'} type={'email'} placeholder={''} />
        </Label>

        <Button disabled={signInWithOtpMutation.isPending}>
          <If
            condition={signInWithOtpMutation.isPending}
            fallback={<Trans i18nKey={'auth:sendEmailCode'} />}
          >
            <Trans i18nKey={'auth:sendingEmailCode'} />
          </If>
        </Button>
      </div>
    </form>
  );
}
