'use server';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

/**
 * Refreshes the user session on the server when updating the user profile.
 */
export async function refreshSessionAction() {
  const supabase = getSupabaseServerActionClient();

  await supabase.auth.refreshSession();
}
