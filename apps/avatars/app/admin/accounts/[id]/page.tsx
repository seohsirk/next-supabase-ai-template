import { cache } from 'react';

import { AdminAccountPage } from '@kit/admin/components/admin-account-page';
import { AdminGuard } from '@kit/admin/components/admin-guard';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

interface Params {
  params: {
    id: string;
  };
}

export const generateMetadata = async ({ params }: Params) => {
  const account = await loadAccount(params.id);

  return {
    title: `Admin | ${account.name}`,
  };
};

async function AccountPage({ params }: Params) {
  const account = await loadAccount(params.id);

  return <AdminAccountPage account={account} />;
}

export default AdminGuard(AccountPage);

const loadAccount = cache(async (id: string) => {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const { data, error } = await client
    .from('accounts')
    .select('*, memberships: accounts_memberships (*)')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
});
