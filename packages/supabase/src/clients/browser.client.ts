import { invariant } from '@epic-web/invariant';
import { createBrowserClient } from '@supabase/ssr';

import { Database } from '../database.types';

let client: ReturnType<typeof createBrowserClient>;

export function getSupabaseBrowserClient<GenericSchema = Database>() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  invariant(SUPABASE_URL, `Supabase URL was not provided`);
  invariant(SUPABASE_ANON_KEY, `Supabase Anon key was not provided`);

  if (client) return client;

  client = createBrowserClient<GenericSchema>(SUPABASE_URL, SUPABASE_ANON_KEY);

  return client;
}
