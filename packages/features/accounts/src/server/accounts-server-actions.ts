'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { Logger } from '@kit/shared/logger';
import { requireAuth } from '@kit/supabase/require-auth';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { CreateOrganizationAccountSchema } from '../schema/create-organization.schema';
import { AccountsService } from './services/accounts.service';

const ORGANIZATION_ACCOUNTS_PATH = z
  .string({
    required_error: 'Organization accounts path is required',
  })
  .min(1)
  .parse(process.env.ORGANIZATION_ACCOUNTS_PATH);

export async function createOrganizationAccountAction(
  params: z.infer<typeof CreateOrganizationAccountSchema>,
) {
  const { name: accountName } = CreateOrganizationAccountSchema.parse(params);

  const client = getSupabaseServerActionClient();
  const accountsService = new AccountsService(client);
  const session = await requireAuth(client);

  if (session.error) {
    redirect(session.redirectTo);
  }

  const createAccountResponse =
    await accountsService.createNewOrganizationAccount({
      name: accountName,
      userId: session.data.user.id,
    });

  if (createAccountResponse.error) {
    return handleError(
      createAccountResponse.error,
      `Error creating organization`,
    );
  }

  const accountHomePath =
    ORGANIZATION_ACCOUNTS_PATH + createAccountResponse.data.slug;

  redirect(accountHomePath);
}

function handleError<Error = unknown>(
  error: Error,
  message: string,
  organizationId?: string,
) {
  const exception = error instanceof Error ? error.message : undefined;

  Logger.error(
    {
      exception,
      organizationId,
    },
    message,
  );

  throw new Error(message);
}
