'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { Logger } from '@kit/shared/logger';
import { requireAuth } from '@kit/supabase/require-auth';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { CreateTeamSchema } from '../schema/create-team.schema';
import { CreateTeamAccountService } from '../services/create-team-account.service';

const TEAM_ACCOUNTS_HOME_PATH = z
  .string({
    required_error: 'variable TEAM_ACCOUNTS_HOME_PATH is required',
  })
  .min(1)
  .parse(process.env.TEAM_ACCOUNTS_HOME_PATH);

export async function createOrganizationAccountAction(
  params: z.infer<typeof CreateTeamSchema>,
) {
  const { name: accountName } = CreateTeamSchema.parse(params);

  const client = getSupabaseServerActionClient();
  const service = new CreateTeamAccountService(client);
  const session = await requireAuth(client);

  if (session.error) {
    redirect(session.redirectTo);
  }

  const userId = session.data.user.id;

  const createAccountResponse = await service.createNewOrganizationAccount({
    name: accountName,
    userId,
  });

  if (createAccountResponse.error) {
    Logger.error(
      {
        userId,
        error: createAccountResponse.error,
        name: 'accounts',
      },
      `Error creating organization account`,
    );

    throw new Error('Error creating organization account');
  }

  const accountHomePath =
    TEAM_ACCOUNTS_HOME_PATH + '/' + createAccountResponse.data.slug;

  redirect(accountHomePath);
}
