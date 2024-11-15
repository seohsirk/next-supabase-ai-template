import 'server-only';

import { cache } from 'react';

import { redirect } from 'next/navigation';

import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * @name requireUserInServerComponent
 * @description Require the user to be authenticated in a server component.
 * We reuse this function in multiple server _components - it is cached so that the data is only fetched once per request.
 * Use this instead of `requireUser` in server _components, so you don't need to hit the database multiple times in a single request.
 */
export const requireUserInServerComponent = cache(async () => {
  const client = getSupabaseServerClient();
  const result = await requireUser(client);

  if (result.error) {
    redirect(result.redirectTo);
  }

  return result.data;
});
