import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { Page } from '@/components/app/Page';

import AdminSidebar from '../../packages/admin/components/AdminSidebar';
import isUserSuperAdmin from './utils/is-user-super-admin';

async function AdminLayout({ children }: React.PropsWithChildren) {
  const isAdmin = await isUserSuperAdmin();

  if (!isAdmin) {
    notFound();
  }

  const csrfToken = headers().get('X-CSRF-Token');

  return <Page sidebar={<AdminSidebar />}>{children}</Page>;
}

export default AdminLayout;
