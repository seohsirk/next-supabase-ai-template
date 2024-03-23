'use client';

import { HomeIcon, UserIcon, UsersIcon } from 'lucide-react';

import Logo from '@/components/app/Logo';
import { Sidebar, SidebarContent, SidebarItem } from '@/components/app/Sidebar';

function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarContent className={'mb-6 mt-4 pt-2'}>
        <Logo href={'/admin'} />
      </SidebarContent>

      <SidebarContent>
        <SidebarItem end path={'/admin'} Icon={<HomeIcon className={'h-4'} />}>
          Admin
        </SidebarItem>

        <SidebarItem
          path={'/admin/users'}
          Icon={<UserIcon className={'h-4'} />}
        >
          Users
        </SidebarItem>

        <SidebarItem
          path={'/admin/organizations'}
          Icon={<UsersIcon className={'h-4'} />}
        >
          Organizations
        </SidebarItem>
      </SidebarContent>
    </Sidebar>
  );
}

export default AdminSidebar;
