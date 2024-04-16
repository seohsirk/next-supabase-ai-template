'use client';

import type { User } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

export function ProfileAccountDropdownContainer(props: {
  collapsed: boolean;
  user: User | null;
}) {
  const signOut = useSignOut();
  const user = useUser(props.user);

  const userData = user.data ?? props.user ?? null;

  return (
    <div className={props.collapsed ? '' : 'w-full animate-in fade-in-90'}>
      <PersonalAccountDropdown
        paths={{
          home: pathsConfig.app.home,
        }}
        features={{
          enableThemeToggle: featuresFlagConfig.enableThemeToggle,
        }}
        className={'w-full'}
        showProfileName={!props.collapsed}
        user={userData}
        signOutRequested={() => signOut.mutateAsync()}
      />
    </div>
  );
}
