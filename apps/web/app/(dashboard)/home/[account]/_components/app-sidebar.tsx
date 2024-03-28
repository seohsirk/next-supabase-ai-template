'use client';

import { useRouter } from 'next/navigation';

import type { Session } from '@supabase/supabase-js';

import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

import { AccountSelector } from '@kit/accounts/account-selector';
import { Sidebar, SidebarContent } from '@kit/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { ProfileDropdownContainer } from '~/(dashboard)/home/_components/personal-account-dropdown';
import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

import { AppSidebarNavigation } from './app-sidebar-navigation';

type AccountModel = {
  label: string | null;
  value: string | null;
  image: string | null;
};

const features = {
  enableTeamAccounts: featureFlagsConfig.enableTeamAccounts,
  enableTeamCreation: featureFlagsConfig.enableTeamCreation,
};

export function AppSidebar(props: {
  account: string;
  accounts: AccountModel[];
  collapsed: boolean;
  session: Session | null;
}) {
  return (
    <Sidebar collapsed={props.collapsed}>
      {({ collapsed, setCollapsed }) => (
        <SidebarContainer
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          account={props.account}
          accounts={props.accounts}
          session={props.session}
        />
      )}
    </Sidebar>
  );
}

function SidebarContainer(props: {
  account: string;
  accounts: AccountModel[];
  session: Session | null;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const { account, accounts } = props;
  const router = useRouter();

  return (
    <>
      <SidebarContent className={'my-4'}>
        <AccountSelector
          selectedAccount={account}
          accounts={accounts}
          collapsed={props.collapsed}
          features={features}
          onAccountChange={(value) => {
            const path = value
              ? pathsConfig.app.accountHome.replace('[account]', value)
              : pathsConfig.app.home;

            router.replace(path);
          }}
        />
      </SidebarContent>

      <SidebarContent className={`h-[calc(100%-160px)] overflow-y-auto`}>
        <AppSidebarNavigation account={account} />
      </SidebarContent>

      <div className={'absolute bottom-4 left-0 w-full'}>
        <SidebarContent>
          <ProfileDropdownContainer
            session={props.session}
            collapsed={props.collapsed}
          />

          <AppSidebarFooterMenu
            collapsed={props.collapsed}
            setCollapsed={props.setCollapsed}
          />
        </SidebarContent>
      </div>
    </>
  );
}

function AppSidebarFooterMenu(props: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  return (
    <CollapsibleButton
      collapsed={props.collapsed}
      onClick={props.setCollapsed}
    />
  );
}

function CollapsibleButton({
  collapsed,
  onClick,
}: React.PropsWithChildren<{
  collapsed: boolean;
  onClick: (collapsed: boolean) => void;
}>) {
  const className = cn(
    `bg-background absolute -right-[10.5px] bottom-4 cursor-pointer block`,
  );

  const iconClassName =
    'bg-background text-gray-300 dark:text-gray-600 h-5 w-5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={className}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => onClick(!collapsed)}
        >
          <ArrowRightCircle
            className={cn(iconClassName, {
              hidden: !collapsed,
            })}
          />

          <ArrowLeftCircle
            className={cn(iconClassName, {
              hidden: collapsed,
            })}
          />
        </TooltipTrigger>

        <TooltipContent sideOffset={20}>
          <Trans
            i18nKey={
              collapsed ? 'common:expandSidebar' : 'common:collapseSidebar'
            }
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
