'use client';

import type { Session } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';

import pathsConfig from '~/config/paths.config';

export function ProfileDropdownContainer(props: {
  collapsed: boolean;
  session: Session | null;
}) {
  const signOut = useSignOut();

  return (
    <div className={props.collapsed ? '' : 'w-full'}>
      <PersonalAccountDropdown
        paths={{
          home: pathsConfig.app.home,
        }}
        className={'w-full'}
        showProfileName={!props.collapsed}
        session={props.session}
        signOutRequested={() => signOut.mutateAsync()}
      />
    </div>
  );
}
