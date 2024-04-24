import { cache } from 'react';

import { createAccountsApi } from '@kit/accounts/api';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import featureFlagsConfig from '~/config/feature-flags.config';

const shouldLoadAccounts = featureFlagsConfig.enableTeamAccounts;

/**
 * @name loadUserWorkspace
 * @description
 * Load the user workspace data. It's a cached per-request function that fetches the user workspace data.
 * It can be used across the server components to load the user workspace data.
 */
export const loadUserWorkspace = cache(async () => {
  const client = getSupabaseServerComponentClient();
  const api = createAccountsApi(client);

  const accountsPromise = shouldLoadAccounts
    ? () => api.loadUserAccounts()
    : () => Promise.resolve([]);

  const workspacePromise = api.getAccountWorkspace();
  const userPromise = client.auth.getUser();

  const [accounts, workspace, userResult] = await Promise.all([
    accountsPromise(),
    workspacePromise,
    userPromise,
  ]);

  const user = userResult.data.user;

  if (!user) {
    throw new Error('User is not logged in');
  }

  return {
    accounts,
    workspace,
    user,
  };
});
