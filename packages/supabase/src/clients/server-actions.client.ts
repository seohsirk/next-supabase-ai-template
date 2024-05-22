import 'server-only';

import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';

import { Database } from '../database.types';
import {
  getServiceRoleKey,
  warnServiceRoleKeyUsage,
} from '../get-service-role-key';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

const keys = getSupabaseClientKeys();
const serviceRoleKey = getServiceRoleKey();

function createServerSupabaseClient<GenericSchema = Database>() {
  return createServerClient<GenericSchema>(keys.url, keys.anonKey, {
    cookies: getCookiesStrategy(),
  });
}

export function getSupabaseServerActionClient<
  GenericSchema = Database,
>(params?: { admin: boolean }) {
  const keys = getSupabaseClientKeys();
  const admin = params?.admin ?? false;

  if (admin) {
    warnServiceRoleKeyUsage();

    return createServerClient<GenericSchema>(keys.url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
      cookies: {},
    });
  }

  return createServerSupabaseClient<GenericSchema>();
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
