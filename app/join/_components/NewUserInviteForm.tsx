'use client';

import { useCallback, useState, useTransition } from 'react';

import { EmailOtpContainer } from '@kit/auth/src/components/email-otp-container';
import { OauthProviders } from '@kit/auth/src/components/oauth-providers';
import { PasswordSignInContainer } from '@kit/auth/src/components/password-sign-in-container';
import { EmailPasswordSignUpContainer } from '@kit/auth/src/components/password-sign-up-container';
import { isBrowser } from '@kit/shared/utils';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';

enum Mode {
  SignUp,
  SignIn,
}

function NewUserInviteForm(
  props: React.PropsWithChildren<{
    code: string;
  }>,
) {
  const [mode, setMode] = useState<Mode>(Mode.SignUp);
  const [isSubmitting, startTransition] = useTransition();
  const oAuthReturnUrl = isBrowser() ? window.location.pathname : '';

  const onInviteAccepted = useCallback(
    async (userId?: string) => {
      startTransition(async () => {
        await acceptInviteAction({
          code: props.code,
          userId,
        });
      });
    },
    [props.code],
  );

  return (
    <>
      <If condition={isSubmitting}>
        <LoadingOverlay fullPage>
          Accepting invite. Please wait...
        </LoadingOverlay>
      </If>

      <OauthProviders inviteCode={props.code} returnUrl={oAuthReturnUrl} />

      <If condition={authConfig.providers.password}>
        <If condition={mode === Mode.SignUp}>
          <div className={'flex w-full flex-col items-center space-y-4'}>
            <EmailPasswordSignUpContainer
              emailRedirectTo={emailRedirectTo}
              onSignUp={onInviteAccepted}
            />

            <Button
              className={'w-full'}
              variant={'ghost'}
              size={'sm'}
              onClick={() => setMode(Mode.SignIn)}
            >
              <Trans i18nKey={'auth:alreadyHaveAccountStatement'} />
            </Button>
          </div>
        </If>

        <If condition={mode === Mode.SignIn}>
          <div className={'flex w-full flex-col items-center space-y-4'}>
            <PasswordSignInContainer onSignIn={onInviteAccepted} />

            <Button
              className={'w-full'}
              variant={'ghost'}
              size={'sm'}
              onClick={() => setMode(Mode.SignUp)}
            >
              <Trans i18nKey={'auth:doNotHaveAccountStatement'} />
            </Button>
          </div>
        </If>
      </If>

      <If condition={authConfig.providers.magicLink}>
        <MagicLinkAuth inviteCode={props.code} />
      </If>

      <If condition={authConfig.providers.otp}>
        <EmailOtpContainer
          inviteCode={props.code}
          shouldCreateUser={true}
          onSuccess={onInviteAccepted}
        />
      </If>
    </>
  );
}

export default NewUserInviteForm;
