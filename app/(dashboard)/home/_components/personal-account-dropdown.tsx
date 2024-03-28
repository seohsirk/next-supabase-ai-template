'use client';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

export function ProfileAccountDropdownContainer(props: { collapsed: boolean }) {
  const signOut = useSignOut();
  const user = useUser();

  return (
    <div className={props.collapsed ? '' : 'w-full'}>
      <PersonalAccountDropdown
        paths={{
          home: pathsConfig.app.home,
        }}
        features={{
          enableThemeToggle: featuresFlagConfig.enableThemeToggle,
        }}
        className={'w-full'}
        showProfileName={!props.collapsed}
        user={user.data ?? null}
        signOutRequested={() => signOut.mutateAsync()}
      />
    </div>
  );
}
