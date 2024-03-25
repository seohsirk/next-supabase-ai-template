import { use } from 'react';

import { cookies } from 'next/headers';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Sidebar, SidebarContent, SidebarNavigation } from '@kit/ui/sidebar';

import { HomeSidebarAccountSelector } from '~/(dashboard)/home/components/home-sidebar-account-selector';
import { ProfileDropdownContainer } from '~/(dashboard)/home/components/personal-account-dropdown';
import { personalAccountSidebarConfig } from '~/config/personal-account-sidebar.config';

export function HomeSidebar() {
  const collapsed = getSidebarCollapsed();
  const accounts = use(loadUserAccounts());

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
          <ProfileDropdownContainer collapsed={collapsed} />
        </SidebarContent>
      </div>
    </Sidebar>
  );
}

function getSidebarCollapsed() {
  return cookies().get('sidebar-collapsed')?.value === 'true';
}

async function loadUserAccounts() {
  const client = getSupabaseServerComponentClient();

  const { data: accounts, error } = await client
    .from('user_accounts')
    .select('*');

  if (error) {
    throw error;
  }

  return accounts.map(({ name, slug, picture_url }) => {
    return {
      label: name,
      value: slug,
      image: picture_url,
    };
  });
}
