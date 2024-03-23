'use client';

import type { Provider } from '@supabase/supabase-js';

import { isBrowser } from '@supabase/ssr';

import { Divider } from '@kit/ui/divider';
import { If } from '@kit/ui/if';

import { EmailOtpContainer } from './email-otp-container';
import { MagicLinkAuthContainer } from './magic-link-auth-container';
import { OauthProviders } from './oauth-providers';
import { EmailPasswordSignUpContainer } from './password-sign-up-container';

export function SignUpMethodsContainer(props: {
  callbackPath: string;

  providers: {
    password: boolean;
    magicLink: boolean;
    otp: boolean;
    oAuth: Provider[];
  };

  inviteCode?: string;
}) {
  const redirectUrl = new URL(
    props.callbackPath,
    isBrowser() ? window?.location.origin : '',
  ).toString();

  return (
    <>
      <If condition={props.providers.password}>
        <EmailPasswordSignUpContainer emailRedirectTo={redirectUrl} />
      </If>

      <If condition={props.providers.magicLink}>
        <MagicLinkAuthContainer
          inviteCode={props.inviteCode}
          redirectUrl={redirectUrl}
        />
      </If>

      <If condition={props.providers.otp}>
        <EmailOtpContainer
          redirectUrl={redirectUrl}
          shouldCreateUser={true}
          inviteCode={props.inviteCode}
        />
      </If>

      <If condition={props.providers.oAuth.length}>
        <Divider />

        <OauthProviders
          enabledProviders={props.providers.oAuth}
          redirectUrl={redirectUrl}
          inviteCode={props.inviteCode}
        />
      </If>
    </>
  );
}
