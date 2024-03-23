'use client';

import Link from 'next/link';

import { ChevronRightIcon } from 'lucide-react';
import pathsConfig from '~/config/paths.config';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUserSession } from '@kit/supabase/hooks/use-user-session';
import { Button } from '@kit/ui/button';

export function SiteHeaderAccountSection() {
  const signOut = useSignOut();
  const userSession = useUserSession();

  if (userSession.data) {
    return (
      <PersonalAccountDropdown
        session={userSession.data}
        paths={{
          home: pathsConfig.app.home,
        }}
        signOutRequested={() => signOut.mutateAsync()}
      />
    );
  }

  return <AuthButtons />;
}

function AuthButtons() {
  return (
    <div className={'hidden space-x-2 lg:flex'}>
      <Button variant={'link'}>
        <Link href={pathsConfig.auth.signIn}>Sign In</Link>
      </Button>

      <Link href={pathsConfig.auth.signUp}>
        <Button className={'rounded-full'}>
          Sign Up
          <ChevronRightIcon className={'h-4'} />
        </Button>
      </Link>
    </div>
  );
}
