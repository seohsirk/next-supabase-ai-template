'use server';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { LeaveTeamAccountSchema } from '../schema/leave-team-account.schema';
import { LeaveAccountService } from '../services/leave-account.service';

export async function leaveTeamAccountAction(formData: FormData) {
  const body = Object.fromEntries(formData.entries());
  const params = LeaveTeamAccountSchema.parse(body);
  const service = new LeaveAccountService(getSupabaseServerActionClient());

  await service.leaveTeamAccount(params);

  return { success: true };
}
