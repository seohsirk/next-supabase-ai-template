import { cache } from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import featureFlagsConfig from '~/config/feature-flags.config';
import { Database } from '~/lib/database.types';

export const loadUserWorkspace = cache(async () => {
  const client = getSupabaseServerComponentClient();
  const loadAccounts = featureFlagsConfig.enableTeamAccounts;

  const accounts = loadAccounts ? await loadUserAccounts(client) : [];
  const { data } = await client.auth.getSession();

  return {
    accounts,
    session: data.session,
  };
});

async function loadUserAccounts(
  client: ReturnType<typeof getSupabaseServerComponentClient<Database>>,
) {
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
