import { cache } from 'react';

import 'server-only';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const loadPersonalAccountBillingPageData = cache((userId: string) => {
  const client = getSupabaseServerComponentClient();

  const subscription = client
    .from('subscriptions')
    .select('*, items: subscription_items !inner (*)')
    .eq('account_id', userId)
    .maybeSingle()
    .then(({ data }) => data);

  const customer = client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', userId)
    .maybeSingle()
    .then(({ data }) => data?.customer_id);

  return Promise.all([subscription, customer]);
});
