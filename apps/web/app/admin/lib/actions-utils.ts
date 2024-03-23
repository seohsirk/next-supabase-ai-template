import { notFound } from 'next/navigation';

import isUserSuperAdmin from '~/admin/utils/is-user-super-admin';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

export function withAdminSession<Args extends unknown[], Response>(
  fn: (...params: Args) => Response,
) {
  return async (...params: Args) => {
    const isAdmin = await isUserSuperAdmin({
      client: getSupabaseServerActionClient(),
    });

    if (!isAdmin) {
      notFound();
    }

    return fn(...params);
  };
}
