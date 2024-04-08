import { Home, Users } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
} from '@kit/ui/sidebar';

import { AppLogo } from '~/components/app-logo';

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarContent className={'py-4'}>
        <AppLogo href={'/admin'} />
      </SidebarContent>

      <SidebarContent>
        <SidebarGroup label={'Admin'} collapsible={false}>
          <SidebarItem end path={'/admin'} Icon={<Home className={'h-4'} />}>
            Home
          </SidebarItem>

          <SidebarItem
            path={'/admin/accounts'}
            Icon={<Users className={'h-4'} />}
          >
            Accounts
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
