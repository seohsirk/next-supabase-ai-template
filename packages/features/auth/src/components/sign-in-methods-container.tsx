'use client';

import { useRouter } from 'next/navigation';

import type { Provider } from '@supabase/supabase-js';

import { isBrowser } from '@supabase/ssr';

import { Divider } from '@kit/ui/divider';
import { If } from '@kit/ui/if';

import { EmailOtpContainer } from './email-otp-container';
import { MagicLinkAuthContainer } from './magic-link-auth-container';
import { OauthProviders } from './oauth-providers';
import { PasswordSignInContainer } from './password-sign-in-container';

export function SignInMethodsContainer(props: {
  paths: {
    callback: string;
    home: string;
  };

  providers: {
    password: boolean;
    magicLink: boolean;
    otp: boolean;
    oAuth: Provider[];
  };
}) {
  const redirectUrl = new URL(
    props.paths.callback,
    isBrowser() ? window?.location.origin : '',
  ).toString();

  const router = useRouter();
  const onSignIn = () => router.replace(props.paths.home);

  return (
    <>
      <If condition={props.providers.password}>
        <PasswordSignInContainer onSignIn={onSignIn} />
      </If>

      <If condition={props.providers.magicLink}>
        <MagicLinkAuthContainer redirectUrl={redirectUrl} />
      </If>

      <If condition={props.providers.otp}>
        <EmailOtpContainer
          onSignIn={onSignIn}
          redirectUrl={redirectUrl}
          shouldCreateUser={false}
        />
      </If>

      <If condition={props.providers.oAuth.length}>
        <Divider />

        <OauthProviders
          enabledProviders={props.providers.oAuth}
          redirectUrl={redirectUrl}
        />
      </If>
    </>
  );
}
