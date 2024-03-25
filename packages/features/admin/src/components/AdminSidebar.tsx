'use client';

import { Home, User, Users } from 'lucide-react';

import { Sidebar, SidebarContent, SidebarItem } from '@kit/ui/sidebar';

function AdminSidebar(props: { Logo: React.ReactNode }) {
  return (
    <Sidebar>
      <SidebarContent className={'mb-6 mt-4 pt-2'}>{props.Logo}</SidebarContent>

      <SidebarContent>
        <SidebarItem end path={'/admin'} Icon={<Home className={'h-4'} />}>
          Admin
        </SidebarItem>

        <SidebarItem path={'/admin/users'} Icon={<User className={'h-4'} />}>
          Users
        </SidebarItem>

        <SidebarItem
          path={'/admin/organizations'}
          Icon={<Users className={'h-4'} />}
        >
          Organizations
        </SidebarItem>
      </SidebarContent>
    </Sidebar>
  );
}

export default AdminSidebar;
