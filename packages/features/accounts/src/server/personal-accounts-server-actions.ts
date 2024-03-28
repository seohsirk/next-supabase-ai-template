'use server';

import { RedirectType, redirect } from 'next/navigation';

import { z } from 'zod';

import { Logger } from '@kit/shared/logger';
import { requireAuth } from '@kit/supabase/require-auth';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { PersonalAccountsService } from './services/personal-accounts.service';

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
  const session = await requireAuth(client);

  if (session.error) {
    Logger.error(`User is not authenticated. Redirecting to login page`);

    redirect(session.redirectTo);
  }

  // retrieve user ID and email
  const userId = session.data.user.id;
  const userEmail = session.data.user.email ?? null;

  // create a new instance of the personal accounts service
  const service = new PersonalAccountsService(client);

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
