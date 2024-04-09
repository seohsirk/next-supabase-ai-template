import { notFound } from 'next/navigation';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { isSuperAdmin } from './is-super-admin';

export function enhanceAdminAction<Args, Response>(
  fn: (params: Args) => Response,
) {
  return async (params: Args) => {
    const isAdmin = await isSuperAdmin(getSupabaseServerActionClient());

    if (!isAdmin) {
      notFound();
    }

    return fn(params);
  };
}
