import { cache } from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const loadUserWorkspace = cache(async () => {
  const client = getSupabaseServerComponentClient();

  const accounts = await loadUserAccounts(client);
  const { data } = await client.auth.getSession();

  return {
    accounts,
    session: data.session,
  };
});

async function loadUserAccounts(
  client: ReturnType<typeof getSupabaseServerComponentClient>,
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
