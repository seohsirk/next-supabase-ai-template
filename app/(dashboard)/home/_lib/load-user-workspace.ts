import { cache } from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const loadUserWorkspace = cache(async () => {
  const [accounts, session] = await Promise.all([
    loadUserAccounts(),
    loadSession(),
  ]);

  return {
    accounts,
    session,
  };
});

async function loadSession() {
  const client = getSupabaseServerComponentClient();

  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

async function loadUserAccounts() {
  const client = getSupabaseServerComponentClient();

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
