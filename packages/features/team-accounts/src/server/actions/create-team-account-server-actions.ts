'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { CreateTeamSchema } from '../../schema/create-team.schema';
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
  const auth = await requireUser(client);

  if (auth.error) {
    redirect(auth.redirectTo);
  }

  const logger = await getLogger();
  const userId = auth.data.id;

  const createAccountResponse = await service.createNewOrganizationAccount({
    name: accountName,
    userId,
  });

  if (createAccountResponse.error) {
    logger.error(
      {
        userId,
        error: createAccountResponse.error,
        name: 'accounts',
      },
      `Error creating team account`,
    );

    throw new Error('Error creating team account');
  }

  logger.info(
    {
      userId,
      accountName,
      name: 'accounts',
    },
    `Team account created successfully`,
  );

  const accountHomePath =
    TEAM_ACCOUNTS_HOME_PATH + '/' + createAccountResponse.data.slug;

  redirect(accountHomePath);
}
