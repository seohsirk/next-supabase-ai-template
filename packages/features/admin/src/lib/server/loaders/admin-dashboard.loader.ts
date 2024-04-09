import 'server-only';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

/**
 * @name loadAdminDashboard
 * @description Load the admin dashboard data.
 * @param params
 */
export async function loadAdminDashboard(params?: {
  count: 'exact' | 'estimated' | 'planned';
}) {
  const count = params?.count ?? 'estimated';
  const client = getSupabaseServerComponentClient({ admin: true });

  const selectParams = {
    count,
    head: true,
  };

  const subscriptionsPromise = client
    .from('subscriptions')
    .select('*', selectParams)
    .eq('status', 'active')
    .then((response) => response.count);

  const trialsPromise = client
    .from('subscriptions')
    .select('*', selectParams)
    .eq('status', 'trialing')
    .then((response) => response.count);

  const accountsPromise = client
    .from('accounts')
    .select('*', selectParams)
    .eq('is_personal_account', true)
    .then((response) => response.count);

  const teamAccountsPromise = client
    .from('accounts')
    .select('*', selectParams)
    .eq('is_personal_account', false)
    .then((response) => response.count);

  const [subscriptions, trials, accounts, teamAccounts] = await Promise.all([
    subscriptionsPromise,
    trialsPromise,
    accountsPromise,
    teamAccountsPromise,
  ]);

  return {
    subscriptions,
    trials,
    accounts,
    teamAccounts,
  };
}
