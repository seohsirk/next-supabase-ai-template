import { use } from 'react';

import { cookies } from 'next/headers';

import { Sidebar, SidebarContent, SidebarNavigation } from '@kit/ui/sidebar';

import { HomeSidebarAccountSelector } from '~/(dashboard)/home/_components/home-sidebar-account-selector';
import { ProfileAccountDropdownContainer } from '~/(dashboard)/home/_components/personal-account-dropdown';
import { loadUserWorkspace } from '~/(dashboard)/home/_lib/load-user-workspace';
import { personalAccountSidebarConfig } from '~/config/personal-account-sidebar.config';

export function HomeSidebar() {
  const collapsed = getSidebarCollapsed();
  const { session, accounts } = use(loadUserWorkspace());

  return (
    <Sidebar collapsed={collapsed}>
      <SidebarContent className={'my-4'}>
        <HomeSidebarAccountSelector collapsed={collapsed} accounts={accounts} />
      </SidebarContent>

      <SidebarContent className={`h-[calc(100%-160px)] overflow-y-auto`}>
        <SidebarNavigation config={personalAccountSidebarConfig} />
      </SidebarContent>

      <div className={'absolute bottom-4 left-0 w-full'}>
        <SidebarContent>
          <ProfileAccountDropdownContainer
            session={session}
            collapsed={collapsed}
          />
        </SidebarContent>
      </div>
    </Sidebar>
  );
}

function getSidebarCollapsed() {
  return cookies().get('sidebar-collapsed')?.value === 'true';
}
