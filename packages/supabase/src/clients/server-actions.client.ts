import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';
import 'server-only';

import { Database } from '../database.types';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

const createServerSupabaseClient = () => {
  const keys = getSupabaseClientKeys();

  return createServerClient<Database>(keys.url, keys.anonKey, {
    cookies: getCookiesStrategy(),
  });
};

export const getSupabaseServerActionClient = (params?: { admin: false }) => {
  const keys = getSupabaseClientKeys();
  const admin = params?.admin ?? false;

  if (admin) {
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

  return createServerSupabaseClient();
};

function getCookiesStrategy() {
  const cookieStore = cookies();

  return {
    get: (name: string) => {
      return cookieStore.get(name)?.value;
    },
    set: (name: string, value: string, options: object) => {
      cookieStore.set({ name, value, ...options });
    },
    remove: (name: string, options: object) => {
      cookieStore.set({
        name,
        value: '',
        ...options,
      });
    },
  };
}
