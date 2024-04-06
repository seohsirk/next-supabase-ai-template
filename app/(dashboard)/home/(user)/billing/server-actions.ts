'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { PersonalAccountCheckoutSchema } from './_lib/schema/personal-account-checkout.schema';
import { UserBillingService } from './_lib/server/user-billing.service';

/**
 * @description Creates a checkout session for a personal account.
 */
export async function createPersonalAccountCheckoutSession(
  params: z.infer<typeof PersonalAccountCheckoutSchema>,
) {
  // parse the parameters
  const data = PersonalAccountCheckoutSchema.parse(params);
  const service = new UserBillingService(getSupabaseServerActionClient());

  return await service.createCheckoutSession(data);
}

/**
 * @description Creates a billing Portal session for a personal account
 */
export async function createPersonalAccountBillingPortalSession() {
  const service = new UserBillingService(getSupabaseServerActionClient());
  const url = await service.createBillingPortalSession();

  return redirect(url);
}
