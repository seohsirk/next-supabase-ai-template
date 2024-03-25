'use client';

import { useMemo } from 'react';

import Link from 'next/link';

import type { Session } from '@supabase/gotrue-js';

import {
  EllipsisVertical,
  Home,
  LogOut,
  MessageCircleQuestion,
  Shield,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { usePersonalAccountData } from '../hooks/use-personal-account-data';

export function PersonalAccountDropdown({
  className,
  session,
  signOutRequested,
  showProfileName,
  paths,
}: {
  className?: string;
  session: Session | null;
  signOutRequested: () => unknown;
  showProfileName?: boolean;
  paths: {
    home: string;
  };
}) {
  const { data: personalAccountData } = usePersonalAccountData();
  const authUser = session?.user;

  const signedInAsLabel = useMemo(() => {
    const email = authUser?.email ?? undefined;
    const phone = authUser?.phone ?? undefined;

    return email ?? phone;
  }, [authUser?.email, authUser?.phone]);

  const displayName = personalAccountData?.name ?? authUser?.email ?? '';

  const isSuperAdmin = useMemo(() => {
    return authUser?.app_metadata.role === 'super-admin';
  }, [authUser]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open your profile menu"
        data-test={'profile-dropdown-trigger'}
        className={cn(
          'animate-in fade-in group flex cursor-pointer items-center focus:outline-none',
          className ?? '',
          {
            ['items-center space-x-2.5 rounded-lg border' +
            ' hover:bg-muted p-2 transition-colors']: showProfileName,
          },
        )}
      >
        <ProfileAvatar
          displayName={displayName ?? authUser?.email ?? ''}
          pictureUrl={personalAccountData?.picture_url}
        />

        <If condition={showProfileName}>
          <div className={'flex w-full flex-col truncate text-left'}>
            <span className={'truncate text-sm'}>{displayName}</span>

            <span className={'text-muted-foreground truncate text-xs'}>
              {signedInAsLabel}
            </span>
          </div>

          <EllipsisVertical
            className={'text-muted-foreground hidden h-8 group-hover:flex'}
          />
        </If>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={'!min-w-[15rem]'}
        collisionPadding={{ right: 20, left: 20 }}
        sideOffset={20}
      >
        <DropdownMenuItem className={'!h-10 rounded-none'}>
          <div
            className={'flex flex-col justify-start truncate text-left text-xs'}
          >
            <div className={'text-gray-500'}>
              <Trans i18nKey={'common:signedInAs'} />
            </div>

            <div>
              <span className={'block truncate'}>{signedInAsLabel}</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={'s-full flex items-center space-x-2'}
            href={paths.home}
          >
            <Home className={'h-5'} />

            <span>
              <Trans i18nKey={'common:homeTabLabel'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link className={'s-full flex items-center space-x-2'} href={'/docs'}>
            <MessageCircleQuestion className={'h-5'} />

            <span>
              <Trans i18nKey={'common:documentation'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <If condition={isSuperAdmin}>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              className={'s-full flex items-center space-x-2'}
              href={'/admin'}
            >
              <Shield className={'h-5'} />

              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        </If>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          role={'button'}
          className={'cursor-pointer'}
          onClick={signOutRequested}
        >
          <span className={'flex w-full items-center space-x-2'}>
            <LogOut className={'h-5'} />

            <span>
              <Trans i18nKey={'auth:signOut'} />
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
