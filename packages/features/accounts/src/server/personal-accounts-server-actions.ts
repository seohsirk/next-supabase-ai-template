'use server';

import { RedirectType, redirect } from 'next/navigation';

import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { DeletePersonalAccountService } from './services/delete-personal-account.service';

const emailSettings = getEmailSettingsFromEnvironment();

export async function refreshAuthSession() {
  const client = getSupabaseServerActionClient();

  await client.auth.refreshSession();

  return {};
}

export async function deletePersonalAccountAction(formData: FormData) {
  const confirmation = formData.get('confirmation');

  if (confirmation !== 'DELETE') {
    throw new Error('Confirmation required to delete account');
  }

  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (auth.error) {
    const logger = await getLogger();
    logger.error(`User is not authenticated. Redirecting to login page`);

    redirect(auth.redirectTo);
  }

  // retrieve user ID and email
  const userId = auth.data.id;
  const userEmail = auth.data.email ?? null;

  // create a new instance of the personal accounts service
  const service = new DeletePersonalAccountService();

  // delete the user's account and cancel all subscriptions
  await service.deletePersonalAccount({
    adminClient: getSupabaseServerActionClient({ admin: true }),
    userId,
    userEmail,
    emailSettings,
  });

  // sign out the user after deleting their account
  await client.auth.signOut();

  // redirect to the home page
  redirect('/', RedirectType.replace);
}

function getEmailSettingsFromEnvironment() {
  return z
    .object({
      fromEmail: z.string().email(),
      productName: z.string().min(1),
    })
    .parse({
      fromEmail: process.env.EMAIL_SENDER,
      productName: process.env.NEXT_PUBLIC_PRODUCT_NAME,
    });
}
