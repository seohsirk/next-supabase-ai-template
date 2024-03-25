'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Home, LogOut, Menu } from 'lucide-react';

import { AccountSelector } from '@kit/accounts/account-selector';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';

import featureFlagsConfig from '~/config/feature-flags.config';
import { getOrganizationAccountSidebarConfig } from '~/config/organization-account-sidebar.config';
import pathsConfig from '~/config/paths.config';

export const MobileAppNavigation = (
  props: React.PropsWithChildren<{
    slug: string;
  }>,
) => {
  const signOut = useSignOut();

  const Links = getOrganizationAccountSidebarConfig(props.slug).routes.map(
    (item, index) => {
      if ('children' in item) {
        return item.children.map((child) => {
          return (
            <DropdownLink
              key={child.path}
              Icon={child.Icon}
              path={child.path}
              label={child.label}
            />
          );
        });
      }

      if ('divider' in item) {
        return <DropdownMenuSeparator key={index} />;
      }

      return (
        <DropdownLink
          key={item.path}
          Icon={item.Icon}
          path={item.path}
          label={item.label}
        />
      );
    },
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className={'h-9'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={10} className={'w-screen rounded-none'}>
        <OrganizationsModal />

        {Links}

        <DropdownMenuSeparator />
        <SignOutDropdownItem onSignOut={() => signOut.mutateAsync()} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>,
) {
  return (
    <DropdownMenuItem asChild key={props.path}>
      <Link
        href={props.path}
        className={'flex h-12 w-full items-center space-x-4'}
      >
        {props.Icon}

        <span>
          <Trans i18nKey={props.label} defaults={props.label} />
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutDropdownItem(
  props: React.PropsWithChildren<{
    onSignOut: () => unknown;
  }>,
) {
  return (
    <DropdownMenuItem
      className={'flex h-12 w-full items-center space-x-4'}
      onClick={props.onSignOut}
    >
      <LogOut className={'h-6'} />

      <span>
        <Trans i18nKey={'common:signOut'} defaults={'Sign out'} />
      </span>
    </DropdownMenuItem>
  );
}

function OrganizationsModal() {
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger>
        <DropdownMenuItem
          className={'h-12'}
          onSelect={(e) => e.preventDefault()}
        >
          <button className={'flex items-center space-x-4'}>
            <Home className={'h-6'} />

            <span>
              <Trans i18nKey={'common:yourOrganizations'} />
            </span>
          </button>
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'common:yourOrganizations'} />
          </DialogTitle>
        </DialogHeader>

        <div className={'flex flex-col space-y-6 py-4'}>
          <AccountSelector
            onAccountChange={(value) => {
              const path = value
                ? pathsConfig.app.accountHome.replace('[account]', value)
                : pathsConfig.app.home;

              router.replace(path);
            }}
            accounts={[]}
            features={{
              enableOrganizationAccounts:
                featureFlagsConfig.enableOrganizationAccounts,
              enableOrganizationCreation:
                featureFlagsConfig.enableOrganizationCreation,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
