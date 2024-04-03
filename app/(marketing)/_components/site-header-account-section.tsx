'use client';

import Link from 'next/link';

import type { User } from '@supabase/supabase-js';

import { ChevronRight } from 'lucide-react';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

export function SiteHeaderAccountSection({
  user,
}: React.PropsWithChildren<{
  user: User | null;
}>) {
  if (!user) {
    return <AuthButtons />;
  }

  return <SuspendedPersonalAccountDropdown user={user} />;
}

function SuspendedPersonalAccountDropdown(props: { user: User | null }) {
  const signOut = useSignOut();
  const user = useUser(props.user);

  return (
    <If condition={user.data} fallback={<AuthButtons />}>
      {(data) => (
        <PersonalAccountDropdown
          paths={{
            home: pathsConfig.app.home,
          }}
          features={{
            enableThemeToggle: featuresFlagConfig.enableThemeToggle,
          }}
          user={data}
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
