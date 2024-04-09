'use client';

import Link from 'next/link';

import type { User } from '@supabase/supabase-js';

import { ChevronRight } from 'lucide-react';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Button } from '@kit/ui/button';
import { ModeToggle } from '@kit/ui/mode-toggle';
import { Trans } from '@kit/ui/trans';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const paths = {
  home: pathsConfig.app.home,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

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

  if (user.data) {
    return (
      <PersonalAccountDropdown
        paths={paths}
        features={features}
        user={user.data}
        signOutRequested={() => signOut.mutateAsync()}
      />
    );
  }

  return <AuthButtons />;
}

function AuthButtons() {
  return (
    <div className={'hidden space-x-0.5 lg:flex'}>
      <ModeToggle />

      <Link href={pathsConfig.auth.signIn}>
        <Button variant={'link'}>
          <Trans i18nKey={'auth:signIn'} />
        </Button>
      </Link>

      <Link href={pathsConfig.auth.signUp}>
        <Button className={'rounded-full'}>
          <Trans i18nKey={'auth:getStarted'} />
          <ChevronRight className={'h-4'} />
        </Button>
      </Link>
    </div>
  );
}
