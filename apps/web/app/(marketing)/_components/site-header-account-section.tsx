'use client';

import { Suspense } from 'react';

import Link from 'next/link';

import type { Session } from '@supabase/supabase-js';

import { ChevronRight } from 'lucide-react';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUserSession } from '@kit/supabase/hooks/use-user-session';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

export function SiteHeaderAccountSection(
  props: React.PropsWithChildren<{
    session: Session | null;
  }>,
) {
  return (
    <Suspense fallback={<AuthButtons />}>
      <SuspendedPersonalAccountDropdown session={props.session} />
    </Suspense>
  );
}

function SuspendedPersonalAccountDropdown(props: { session: Session | null }) {
  const signOut = useSignOut();
  const userSession = useUserSession(props.session);

  return (
    <If condition={userSession.data} fallback={<AuthButtons />}>
      {(session) => (
        <PersonalAccountDropdown
          paths={{
            home: pathsConfig.app.home,
          }}
          session={session}
          signOutRequested={() => signOut.mutateAsync()}
        />
      )}
    </If>
  );
}

function AuthButtons() {
  return (
    <div className={'hidden space-x-2 lg:flex'}>
      <Button variant={'link'}>
        <Link href={pathsConfig.auth.signIn}>
          <Trans i18nKey={'auth:signIn'} />
        </Link>
      </Button>

      <Link href={pathsConfig.auth.signUp}>
        <Button className={'rounded-full'}>
          <Trans i18nKey={'auth:signUp'} />
          <ChevronRight className={'h-4'} />
        </Button>
      </Link>
    </div>
  );
}
