import { cache } from 'react';

import { redirect } from 'next/navigation';

import 'server-only';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import pathsConfig from '~/config/paths.config';

/**
 * Load the organization workspace data.
 * We place this function into a separate file so it can be reused in multiple places across the server components.
 *
 * This function is used in the layout component for the organization workspace.
 * It is cached so that the data is only fetched once per request.
 *
 * @param accountSlug
 */
export const loadTeamWorkspace = cache(async (accountSlug: string) => {
  const client = getSupabaseServerComponentClient();

  const accountPromise = client.rpc('organization_account_workspace', {
    account_slug: accountSlug,
  });

  const accountsPromise = client.from('user_accounts').select('*');

  const [accountResult, accountsResult] = await Promise.all([
    accountPromise,
    accountsPromise,
  ]);

  if (accountResult.error) {
    throw accountResult.error;
  }

  // we cannot find any record for the selected organization
  // so we redirect the user to the home page
  if (!accountResult.data.length) {
    return redirect(pathsConfig.app.home);
  }

  const accountData = accountResult.data[0];

  if (!accountData) {
    return redirect(pathsConfig.app.home);
  }

  if (accountsResult.error) {
    throw accountsResult.error;
  }

  return {
    account: accountData,
    accounts: accountsResult.data,
  };
});
