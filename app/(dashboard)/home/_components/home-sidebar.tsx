import { use } from 'react';

import { cookies } from 'next/headers';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Sidebar, SidebarContent, SidebarNavigation } from '@kit/ui/sidebar';

import { HomeSidebarAccountSelector } from '~/(dashboard)/home/_components/home-sidebar-account-selector';
import { ProfileDropdownContainer } from '~/(dashboard)/home/_components/personal-account-dropdown';
import { personalAccountSidebarConfig } from '~/config/personal-account-sidebar.config';

export function HomeSidebar() {
  const collapsed = getSidebarCollapsed();

  const [accounts, session] = use(
    Promise.all([loadUserAccounts(), loadSession()]),
  );

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
          <ProfileDropdownContainer session={session} collapsed={collapsed} />
        </SidebarContent>
      </div>
    </Sidebar>
  );
}

function getSidebarCollapsed() {
  return cookies().get('sidebar-collapsed')?.value === 'true';
}

async function loadSession() {
  const client = getSupabaseServerComponentClient();

  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

async function loadUserAccounts() {
  const client = getSupabaseServerComponentClient();

  const { data: accounts, error } = await client
    .from('user_accounts')
    .select(`name, slug, picture_url`);

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
