'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { AccountMembersService } from '../services/account-members.service';

export async function removeMemberFromAccountAction(params: {
  accountId: string;
  userId: string;
}) {
  const client = getSupabaseServerActionClient();
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error(`Authentication required`);
  }

  const service = new AccountMembersService(client);

  await service.removeMemberFromAccount({
    accountId: params.accountId,
    userId: params.userId,
  });

  return { success: true };
}

export async function updateMemberRoleAction(params: {
  accountId: string;
  userId: string;
  role: string;
}) {
  const client = getSupabaseServerActionClient();

  await assertSession(client);

  const service = new AccountMembersService(client);

  await service.updateMemberRole({
    accountId: params.accountId,
    userId: params.userId,
    role: params.role,
  });

  return { success: true };
}

export async function transferOwnershipAction(params: {
  accountId: string;
  userId: string;
}) {
  const client = getSupabaseServerActionClient();

  await assertSession(client);

  const service = new AccountMembersService(client);

  await service.transferOwnership({
    accountId: params.accountId,
    userId: params.userId,
  });

  return { success: true };
}

async function assertSession(client: SupabaseClient<Database>) {
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error(`Authentication required`);
  }
}
