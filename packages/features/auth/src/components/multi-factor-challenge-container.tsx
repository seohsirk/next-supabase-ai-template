import type { FormEventHandler } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import useFetchAuthFactors from '@kit/supabase/hooks/use-fetch-mfa-factors';
import useSignOut from '@kit/supabase/hooks/use-sign-out';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { OtpInput } from '@kit/ui/otp-input';
import Spinner from '@kit/ui/spinner';
import { Trans } from '@kit/ui/trans';

export function MultiFactorChallengeContainer({
  onSuccess,
}: React.PropsWithChildren<{
  onSuccess: () => void;
}>) {
  const [factorId, setFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const verifyMFAChallenge = useVerifyMFAChallenge();

  const onSubmitClicked: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      void (async () => {
        event.preventDefault();

        if (!factorId || !verifyCode) {
          return;
        }

        await verifyMFAChallenge.mutateAsync({
          factorId,
          verifyCode,
        });

        onSuccess();
      })();
    },
    [factorId, verifyMFAChallenge, onSuccess, verifyCode],
  );

  if (!factorId) {
    return (
      <FactorsListContainer onSelect={setFactorId} onSuccess={onSuccess} />
    );
  }

  return (
    <form onSubmit={onSubmitClicked}>
      <div className={'flex flex-col space-y-4'}>
        <span className={'text-sm'}>
          <Trans i18nKey={'profile:verifyActivationCodeDescription'} />
        </span>

        <div className={'flex w-full flex-col space-y-2.5'}>
          <OtpInput
            onInvalid={() => setVerifyCode('')}
            onValid={setVerifyCode}
          />

          <If condition={verifyMFAChallenge.error}>
            <Alert variant={'destructive'}>
              <AlertDescription>
                <Trans i18nKey={'profile:invalidVerificationCode'} />
              </AlertDescription>
            </Alert>
          </If>
        </div>

        <Button disabled={verifyMFAChallenge.isPending || !verifyCode}>
          {verifyMFAChallenge.isPending ? (
            <Trans i18nKey={'profile:verifyingCode'} />
          ) : (
            <Trans i18nKey={'profile:submitVerificationCode'} />
          )}
        </Button>
      </div>
    </form>
  );
}

function useVerifyMFAChallenge() {
  const client = useSupabase();

  const mutationKey = ['mfa-verify-challenge'];
  const mutationFn = async (params: {
    factorId: string;
    verifyCode: string;
  }) => {
    const { factorId, verifyCode: code } = params;

    const response = await client.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  };

  return useMutation({ mutationKey, mutationFn });
}

function FactorsListContainer({
  onSuccess,
  onSelect,
}: React.PropsWithChildren<{
  onSuccess: () => void;
  onSelect: (factor: string) => void;
}>) {
  const signOut = useSignOut();

  const { data: factors, isLoading, error } = useFetchAuthFactors();

  const isSuccess = factors && !isLoading && !error;

  useEffect(() => {
    // If there are no factors, continue
    if (isSuccess && !factors.totp.length) {
      onSuccess();
    }
  }, [factors?.totp.length, isSuccess, onSuccess]);

  useEffect(() => {
    // If there is an error, sign out
    if (error) {
      void signOut.mutateAsync();
    }
  }, [error, signOut]);

  useEffect(() => {
    // If there is only one factor, select it automatically
    if (isSuccess && factors.totp.length === 1) {
      const factorId = factors.totp[0]?.id;

      if (factorId) {
        onSelect(factorId);
      }
    }
  });

  if (isLoading) {
    return (
      <div className={'flex flex-col items-center space-y-4 py-8'}>
        <Spinner />

        <div>
          <Trans i18nKey={'profile:loadingFactors'} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={'w-full'}>
        <Alert variant={'destructive'}>
          <AlertDescription>
            <Trans i18nKey={'profile:factorsListError'} />
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const verifiedFactors = factors?.totp ?? [];

  return (
    <div className={'flex flex-col space-y-4'}>
      <div>
        <Heading level={6}>
          <Trans i18nKey={'profile:selectFactor'} />
        </Heading>
      </div>

      {verifiedFactors.map((factor) => (
        <div key={factor.id}>
          <Button
            variant={'outline'}
            className={'w-full border-gray-50'}
            onClick={() => onSelect(factor.id)}
          >
            {factor.friendly_name}
          </Button>
        </div>
      ))}
    </div>
  );
}
