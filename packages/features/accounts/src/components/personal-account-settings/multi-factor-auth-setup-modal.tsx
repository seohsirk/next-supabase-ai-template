import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useFactorsMutationKey } from '@kit/supabase/hooks/use-user-factors-mutation-key';
import { Alert } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { OtpInput } from '@kit/ui/otp-input';
import { Trans } from '@kit/ui/trans';

function MultiFactorAuthSetupModal(
  props: React.PropsWithChildren<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>,
) {
  const { t } = useTranslation();

  const onEnrollSuccess = useCallback(() => {
    props.setIsOpen(false);

    return toast.success(t(`profile:multiFactorSetupSuccess`));
  }, [props, t]);

  return (
    <Dialog open={props.isOpen} onOpenChange={props.setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'profile:setupMfaButtonLabel'} />
          </DialogTitle>
        </DialogHeader>

        <MultiFactorAuthSetupForm
          onCancel={() => props.setIsOpen(false)}
          onEnrolled={onEnrollSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function MultiFactorAuthSetupForm({
  onEnrolled,
  onCancel,
}: React.PropsWithChildren<{
  onCancel: () => void;
  onEnrolled: () => void;
}>) {
  const verifyCodeMutation = useVerifyCodeMutation();
  const [factorId, setFactorId] = useState<string | undefined>();
  const [verificationCode, setVerificationCode] = useState('');

  const [state, setState] = useState({
    loading: false,
    error: '',
  });

  const onSubmit = useCallback(async () => {
    setState({
      loading: true,
      error: '',
    });

    if (!factorId || !verificationCode) {
      return setState({
        loading: false,
        error: 'No factor ID or verification code found',
      });
    }

    try {
      await verifyCodeMutation.mutateAsync({
        factorId,
        code: verificationCode,
      });

      setState({
        loading: false,
        error: '',
      });

      onEnrolled();
    } catch (error) {
      const message = (error as Error).message || `Unknown error`;

      setState({
        loading: false,
        error: message,
      });
    }
  }, [onEnrolled, verifyCodeMutation, factorId, verificationCode]);

  if (state.error) {
    return (
      <div className={'flex flex-col space-y-4'}>
        <Alert variant={'destructive'}>
          <Trans i18nKey={'profile:multiFactorSetupError'} />
        </Alert>
      </div>
    );
  }

  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex justify-center'}>
        <FactorQrCode onCancel={onCancel} onSetFactorId={setFactorId} />
      </div>

      <If condition={factorId}>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            return onSubmit();
          }}
          className={'w-full'}
        >
          <div className={'flex flex-col space-y-4'}>
            <Label>
              <Trans i18nKey={'profile:verificationCode'} />

              <OtpInput
                onInvalid={() => setVerificationCode('')}
                onValid={setVerificationCode}
              />

              <span>
                <Trans i18nKey={'profile:verifyActivationCodeDescription'} />
              </span>
            </Label>

            <div className={'flex justify-end space-x-2'}>
              <Button disabled={!verificationCode} type={'submit'}>
                {state.loading ? (
                  <Trans i18nKey={'profile:verifyingCode'} />
                ) : (
                  <Trans i18nKey={'profile:enableMfaFactor'} />
                )}
              </Button>
            </div>
          </div>
        </form>
      </If>
    </div>
  );
}

function FactorQrCode({
  onSetFactorId,
  onCancel,
}: React.PropsWithChildren<{
  onCancel: () => void;
  onSetFactorId: React.Dispatch<React.SetStateAction<string | undefined>>;
}>) {
  const enrollFactorMutation = useEnrollFactor();
  const [error, setError] = useState(false);

  const [factor, setFactor] = useState({
    name: '',
    qrCode: '',
  });

  const factorName = factor.name;

  useEffect(() => {
    if (!factorName) {
      return;
    }

    void (async () => {
      try {
        const data = await enrollFactorMutation.mutateAsync(factorName);

        if (!data) {
          return setError(true);
        }

        // set image
        setFactor((factor) => {
          return {
            ...factor,
            qrCode: data.totp.qr_code,
          };
        });

        // dispatch event to set factor ID
        onSetFactorId(data.id);
      } catch (e) {
        setError(true);
      }
    })();
  }, [onSetFactorId, factorName, enrollFactorMutation]);

  if (error) {
    return (
      <div className={'flex w-full flex-col space-y-2'}>
        <Alert variant={'destructive'}>
          <Trans i18nKey={'profile:qrCodeError'} />
        </Alert>
      </div>
    );
  }

  if (!factorName) {
    return (
      <FactorNameForm
        onCancel={onCancel}
        onSetFactorName={(name) => {
          setFactor((factor) => ({ ...factor, name }));
        }}
      />
    );
  }

  return (
    <div className={'flex flex-col space-y-4'}>
      <p>
        <span className={'text-base'}>
          <Trans i18nKey={'profile:multiFactorModalHeading'} />
        </span>
      </p>

      <div className={'flex justify-center'}>
        <QrImage src={factor.qrCode} />
      </div>
    </div>
  );
}

function FactorNameForm(
  props: React.PropsWithChildren<{
    onSetFactorName: (name: string) => void;
    onCancel: () => void;
  }>,
) {
  const inputName = 'factorName';

  return (
    <form
      className={'w-full'}
      onSubmit={(event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const name = data.get(inputName) as string;

        props.onSetFactorName(name);
      }}
    >
      <div className={'flex flex-col space-y-4'}>
        <Label>
          <Trans i18nKey={'profile:factorNameLabel'} />

          <Input autoComplete={'off'} required name={inputName} />

          <span>
            <Trans i18nKey={'profile:factorNameHint'} />
          </span>
        </Label>

        <div className={'flex justify-end space-x-2'}>
          <Button type={'submit'}>
            <Trans i18nKey={'profile:factorNameSubmitLabel'} />
          </Button>
        </div>
      </div>
    </form>
  );
}

function QrImage({ src }: { src: string }) {
  return <Image alt={'QR Code'} src={src} width={160} height={160} />;
}

export default MultiFactorAuthSetupModal;

function useEnrollFactor() {
  const client = useSupabase();
  const mutationKey = useFactorsMutationKey();

  const mutationFn = async (factorName: string) => {
    const { data, error } = await client.auth.mfa.enroll({
      friendlyName: factorName,
      factorType: 'totp',
    });

    if (error) {
      throw error;
    }

    return data;
  };

  return useMutation({
    mutationFn,
    mutationKey,
  });
}

function useVerifyCodeMutation() {
  const mutationKey = useFactorsMutationKey();
  const client = useSupabase();

  const mutationFn = async (params: { factorId: string; code: string }) => {
    const challenge = await client.auth.mfa.challenge({
      factorId: params.factorId,
    });

    if (challenge.error) {
      throw challenge.error;
    }

    const challengeId = challenge.data.id;

    const verify = await client.auth.mfa.verify({
      factorId: params.factorId,
      code: params.code,
      challengeId,
    });

    if (verify.error) {
      throw verify.error;
    }

    return verify;
  };

  return useMutation({ mutationKey, mutationFn });
}
