import 'server-only';

import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

import { Database } from '../database.types';
import { getServiceRoleKey } from '../get-service-role-key';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

/**
 * @name getSupabaseServerComponentClient
 * @description Get a Supabase client for use in the Server Components
 */
export function getSupabaseServerComponentClient<GenericSchema = Database>(
  params = {
    admin: false,
  },
) {
  const keys = getSupabaseClientKeys();

  if (params.admin) {
    const serviceRoleKey = getServiceRoleKey();

    return createServerClient<GenericSchema>(keys.url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
      cookies: {},
    });
  }

  return createServerClient<GenericSchema>(keys.url, keys.anonKey, {
    cookies: getCookiesStrategy(),
  });
}

function getCookiesStrategy() {
  const cookieStore = cookies();

  return {
    get: (name: string) => {
      return cookieStore.get(name)?.value;
    },
  };
}
