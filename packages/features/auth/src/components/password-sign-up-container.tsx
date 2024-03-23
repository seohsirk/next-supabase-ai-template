'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { CheckIcon } from 'lucide-react';

import { useSignUpWithEmailAndPassword } from '@kit/supabase/hooks/use-sign-up-with-email-password';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { AuthErrorAlert } from './auth-error-alert';
import { PasswordSignUpForm } from './password-sign-up-form';

export function EmailPasswordSignUpContainer({
  onSignUp,
  onError,
  emailRedirectTo,
}: React.PropsWithChildren<{
  onSignUp?: (userId?: string) => unknown;
  onError?: (error?: unknown) => unknown;
  emailRedirectTo: string;
}>) {
  const signUpMutation = useSignUpWithEmailAndPassword();
  const redirecting = useRef(false);
  const loading = signUpMutation.isPending || redirecting.current;
  const [showVerifyEmailAlert, setShowVerifyEmailAlert] = useState(false);

  const callOnErrorCallback = useCallback(() => {
    if (signUpMutation.error && onError) {
      onError(signUpMutation.error);
    }
  }, [signUpMutation.error, onError]);

  useEffect(() => {
    callOnErrorCallback();
  }, [callOnErrorCallback]);

  const onSignupRequested = useCallback(
    async (credentials: { email: string; password: string }) => {
      if (loading) {
        return;
      }

      try {
        const data = await signUpMutation.mutateAsync({
          ...credentials,
          emailRedirectTo,
        });

        setShowVerifyEmailAlert(true);

        if (onSignUp) {
          onSignUp(data.user?.id);
        }
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    },
    [emailRedirectTo, loading, onError, onSignUp, signUpMutation],
  );

  return (
    <>
      <If condition={showVerifyEmailAlert}>
        <Alert variant={'success'}>
          <CheckIcon className={'w-4'} />

          <AlertTitle>
            <Trans i18nKey={'auth:emailConfirmationAlertHeading'} />
          </AlertTitle>

          <AlertDescription data-test={'email-confirmation-alert'}>
            <Trans i18nKey={'auth:emailConfirmationAlertBody'} />
          </AlertDescription>
        </Alert>
      </If>

      <If condition={!showVerifyEmailAlert}>
        <AuthErrorAlert error={signUpMutation.error} />

        <PasswordSignUpForm onSubmit={onSignupRequested} loading={loading} />
      </If>
    </>
  );
}
