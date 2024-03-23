'use server';

import { revalidatePath } from 'next/cache';

import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { InviteMembersSchema } from '../schema/invite-members.schema';
import { AccountInvitationsService } from '../services/account-invitations.service';

/**
 * Creates invitations for inviting members.
 */
export async function createInvitationsAction(params: {
  account: string;
  invitations: z.infer<typeof InviteMembersSchema>['invitations'];
}) {
  const client = getSupabaseServerActionClient();

  await assertSession(client);

  const { invitations } = InviteMembersSchema.parse({
    invitations: params.invitations,
  });

  const service = new AccountInvitationsService(client);

  await service.sendInvitations({ invitations, account: params.account });

  revalidatePath('/home/[account]/members', 'page');

  return { success: true };
}

/**
 * Deletes an invitation specified by the invitation ID.
 *
 * @param {Object} params - The parameters for the method.
 * @param {string} params.invitationId - The ID of the invitation to be deleted.
 *
 * @return {Object} - The result of the delete operation.
 */
export async function deleteInvitationAction(params: { invitationId: string }) {
  const client = getSupabaseServerActionClient();
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error(`Authentication required`);
  }

  const service = new AccountInvitationsService(client);

  await service.removeInvitation({
    invitationId: params.invitationId,
  });

  return { success: true };
}

export async function updateInvitationAction(params: {
  invitationId: string;
  role: Database['public']['Enums']['account_role'];
}) {
  const client = getSupabaseServerActionClient();

  await assertSession(client);

  const service = new AccountInvitationsService(client);

  await service.updateInvitation({
    invitationId: params.invitationId,
    role: params.role,
  });

  return { success: true };
}

async function assertSession(client: SupabaseClient<Database>) {
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error(`Authentication required`);
  }
}
