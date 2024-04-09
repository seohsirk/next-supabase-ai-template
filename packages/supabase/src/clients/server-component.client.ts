import 'server-only';

import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

import { Database } from '../database.types';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

/**
 * @name getSupabaseServerComponentClient
 * @description Get a Supabase client for use in the Server Components
 */
export const getSupabaseServerComponentClient = (
  params = {
    admin: false,
  },
) => {
  const keys = getSupabaseClientKeys();

  if (params.admin) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[Dev Only] You are using the Supabase Service Role. Make sure it's the right call.`,
      );
    }

    if (!serviceRoleKey) {
      throw new Error('Supabase Service Role Key not provided');
    }

    return createServerClient<Database>(keys.url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
      cookies: {},
    });
  }

  return createServerClient<Database>(keys.url, keys.anonKey, {
    cookies: getCookiesStrategy(),
  });
};

function getCookiesStrategy() {
  const cookieStore = cookies();

  return {
    get: (name: string) => {
      return cookieStore.get(name)?.value;
    },
  };
}
