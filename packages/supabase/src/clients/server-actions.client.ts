import 'server-only';

import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

import { Database } from '../database.types';
import { getServiceRoleKey } from '../get-service-role-key';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

function createServerSupabaseClient() {
  const keys = getSupabaseClientKeys();

  return createServerClient<Database>(keys.url, keys.anonKey, {
    cookies: getCookiesStrategy(),
  });
}

export function getSupabaseServerActionClient<
  GenericSchema = Database,
>(params?: { admin: boolean }) {
  const keys = getSupabaseClientKeys();
  const admin = params?.admin ?? false;

  if (admin) {
    const serviceRoleKey = getServiceRoleKey();

    return createServerClient<GenericSchema>(keys.url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
      cookies: {},
    });
  }

  return createServerSupabaseClient();
}

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
