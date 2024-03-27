'use client';

import type { Provider } from '@supabase/supabase-js';

import { isBrowser } from '@kit/shared/utils';
import { Divider } from '@kit/ui/divider';
import { If } from '@kit/ui/if';

import { MagicLinkAuthContainer } from './magic-link-auth-container';
import { OauthProviders } from './oauth-providers';
import { EmailPasswordSignUpContainer } from './password-sign-up-container';

export function SignUpMethodsContainer(props: {
  paths: {
    callback: string;
    appHome: string;
  };

  providers: {
    password: boolean;
    magicLink: boolean;
    oAuth: Provider[];
  };

  inviteToken?: string;
}) {
  const redirectUrl = isBrowser()
    ? new URL(props.paths.callback, window?.location.origin).toString()
    : '';

  return (
    <>
      <If condition={props.providers.password}>
        <EmailPasswordSignUpContainer emailRedirectTo={redirectUrl} />
      </If>

      <If condition={props.providers.magicLink}>
        <MagicLinkAuthContainer
          inviteToken={props.inviteToken}
          redirectUrl={redirectUrl}
        />
      </If>

      <If condition={props.providers.oAuth.length}>
        <Divider />

        <OauthProviders
          enabledProviders={props.providers.oAuth}
          inviteToken={props.inviteToken}
          paths={{
            callback: props.paths.callback,
            returnPath: props.paths.appHome,
          }}
        />
      </If>
    </>
  );
}
