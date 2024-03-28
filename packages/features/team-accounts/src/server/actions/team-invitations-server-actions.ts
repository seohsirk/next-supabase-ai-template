'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { Database } from '@kit/supabase/database';
import { requireAuth } from '@kit/supabase/require-auth';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { AcceptInvitationSchema } from '../../schema/accept-invitation.schema';
import { DeleteInvitationSchema } from '../../schema/delete-invitation.schema';
import { InviteMembersSchema } from '../../schema/invite-members.schema';
import { UpdateInvitationSchema } from '../../schema/update-invitation-schema';
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
export async function deleteInvitationAction(
  params: z.infer<typeof DeleteInvitationSchema>,
) {
  const invitation = DeleteInvitationSchema.parse(params);

  const client = getSupabaseServerActionClient();
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error(`Authentication required`);
  }

  const service = new AccountInvitationsService(client);

  await service.deleteInvitation(invitation);

  return { success: true };
}

export async function updateInvitationAction(
  params: z.infer<typeof UpdateInvitationSchema>,
) {
  const client = getSupabaseServerActionClient();
  const invitation = UpdateInvitationSchema.parse(params);

  await assertSession(client);

  const service = new AccountInvitationsService(client);

  await service.updateInvitation(invitation);

  return { success: true };
}

export async function acceptInvitationAction(data: FormData) {
  const client = getSupabaseServerActionClient();

  const { inviteToken, nextPath } = AcceptInvitationSchema.parse(
    Object.fromEntries(data),
  );

  const { user } = await assertSession(client);

  const service = new AccountInvitationsService(client);

  await service.acceptInvitationToTeam({
    adminClient: getSupabaseServerActionClient({ admin: true }),
    inviteToken,
    userId: user.id,
  });

  return redirect(nextPath);
}

async function assertSession(client: SupabaseClient<Database>) {
  const { error, data } = await requireAuth(client);

  if (error) {
    throw new Error(`Authentication required`);
  }

  return data;
}
