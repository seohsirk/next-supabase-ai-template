'use server';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { DeleteTeamAccountSchema } from '../schema/delete-team-account.schema';
import { DeleteAccountService } from '../services/delete-account.service';

export async function deleteTeamAccountAction(formData: FormData) {
  const body = Object.fromEntries(formData.entries());
  const params = DeleteTeamAccountSchema.parse(body);
  const client = getSupabaseServerActionClient();
  const service = new DeleteAccountService(client);

  await service.deleteTeamAccount(params);

  return { success: true };
}
