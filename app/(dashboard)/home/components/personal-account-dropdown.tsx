'use client';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUserSession } from '@kit/supabase/hooks/use-user-session';

import pathsConfig from '~/config/paths.config';

export function ProfileDropdownContainer(props: { collapsed: boolean }) {
  const userSession = useUserSession();
  const signOut = useSignOut();
  const session = userSession?.data ?? undefined;

  return (
    <div className={props.collapsed ? '' : 'w-full'}>
      <PersonalAccountDropdown
        paths={{
          home: pathsConfig.app.home,
        }}
        className={'w-full'}
        showProfileName={!props.collapsed}
        session={session}
        signOutRequested={() => signOut.mutateAsync()}
      />
    </div>
  );
}
