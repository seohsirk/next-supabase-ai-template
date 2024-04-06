import { cache } from 'react';

import 'server-only';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const loadTeamAccountBillingPage = cache((accountId: string) => {
  const client = getSupabaseServerComponentClient();

  // TODO: improve these queries to only load the necessary data
  const subscription = client
    .from('subscriptions')
    .select('*, items: subscription_items !inner (*)')
    .eq('account_id', accountId)
    .maybeSingle()
    .then(({ data }) => data);

  const customerId = client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', accountId)
    .maybeSingle()
    .then(({ data }) => data?.customer_id);

  return Promise.all([subscription, customerId]);
});
