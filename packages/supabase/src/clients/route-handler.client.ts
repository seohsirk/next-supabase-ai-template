import 'server-only';

import { cookies } from 'next/headers';

import type { CookieOptions } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';

import { Database } from '../database.types';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

/**
 * @name getSupabaseRouteHandlerClient
 * @description Get a Supabase client for use in the Route Handler Routes
 */
export function getSupabaseRouteHandlerClient<GenericSchema = Database>(
  params = {
    admin: false,
  },
) {
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
    set: (name: string, value: string, options: CookieOptions) => {
      cookieStore.set({ name, value, ...options });
    },
    get: (name: string) => {
      return cookieStore.get(name)?.value;
    },
    remove: (name: string, options: CookieOptions) => {
      cookieStore.set({ name, value: '', ...options });
    },
  };
}
