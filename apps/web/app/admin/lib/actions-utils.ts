import { notFound } from 'next/navigation';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import isUserSuperAdmin from '~/admin/utils/is-user-super-admin';

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
