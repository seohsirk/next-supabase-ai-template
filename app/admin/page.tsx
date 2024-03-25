import { PageBody } from '@/components/app/Page';
import appConfig from '@/config/app.config';

import getSupabaseServerComponentClient from '@packages/supabase/server-component-client';

import AdminDashboard from '../../packages/admin/components/AdminDashboard';
import AdminGuard from '../../packages/admin/components/AdminGuard';
import AdminHeader from '../../packages/admin/components/AdminHeader';

export const metadata = {
  title: `Admin | ${appConfig.name}`,
};

async function AdminPage() {
  const data = await loadData();

  return (
    <div className={'flex flex-1 flex-col'}>
      <AdminHeader>Admin</AdminHeader>

      <PageBody>
        <AdminDashboard data={data} />
      </PageBody>
    </div>
  );
}

export default AdminGuard(AdminPage);

async function loadData() {
  const client = getSupabaseServerComponentClient({ admin: true });

  const { count: usersCount } = await client.from('users').select('*', {
    count: 'exact',
    head: true,
  });

  const { count: organizationsCount } = await client
    .from('organizations')
    .select('*', {
      count: 'exact',
      head: true,
    });

  const { count: activeSubscriptions } = await client
    .from('subscriptions')
    .select(`*`, {
      count: 'exact',
      head: true,
    })
    .eq('status', 'active');

  const { count: trialSubscriptions } = await client
    .from('subscriptions')
    .select(`*`, {
      count: 'exact',
      head: true,
    })
    .eq('status', 'trialing');

  return {
    usersCount: usersCount || 0,
    organizationsCount: organizationsCount || 0,
    activeSubscriptions: activeSubscriptions || 0,
    trialSubscriptions: trialSubscriptions || 0,
  };
}
