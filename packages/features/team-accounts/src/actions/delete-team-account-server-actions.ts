'use server';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { DeleteTeamAccountSchema } from '../schema/delete-team-account.schema';
import { DeleteTeamAccountService } from '../services/delete-team-account.service';

export async function deleteTeamAccountAction(formData: FormData) {
  const body = Object.fromEntries(formData.entries());
  const params = DeleteTeamAccountSchema.parse(body);
  const client = getSupabaseServerActionClient();
  const service = new DeleteTeamAccountService(client);

  await service.deleteTeamAccount(params);

  return { success: true };
}
