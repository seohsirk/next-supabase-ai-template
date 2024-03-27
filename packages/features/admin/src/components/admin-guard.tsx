import { notFound } from 'next/navigation';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { isSuperAdmin } from '../lib/is-super-admin';

type LayoutOrPageComponent<Params> = React.ComponentType<Params>;

export function AdminGuard<Params extends object>(
  Component: LayoutOrPageComponent<Params>,
) {
  return async function AdminGuardServerComponentWrapper(params: Params) {
    const client = getSupabaseServerComponentClient();
    const isUserSuperAdmin = await isSuperAdmin(client);

    // if the user is not a super-admin, we redirect to a 404
    if (!isUserSuperAdmin) {
      notFound();
    }

    return <Component {...params} />;
  };
}
