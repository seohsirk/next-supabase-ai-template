'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getProductPlanPairFromId } from '@kit/billing';
import { getBillingGatewayProvider } from '@kit/billing-gateway';
import { requireAuth } from '@kit/supabase/require-auth';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';

/**
 * Creates a checkout session for a team account.
 *
 * @param {object} params - The parameters for creating the checkout session.
 * @param {string} params.planId - The ID of the plan to be associated with the account.
 */
export async function createTeamAccountCheckoutSession(params: {
  planId: string;
  accountId: string;
}) {
  const client = getSupabaseServerActionClient();

  // we parse the plan ID from the parameters
  // no need in continuing if the plan ID is not valid
  const planId = z.string().min(1).parse(params.planId);

  // we require the user to be authenticated
  const { data: session } = await requireAuth(client);

  if (!session) {
    throw new Error('Authentication required');
  }

  const userId = session.user.id;
  const accountId = params.accountId;

  const hasPermission = await getPermissionsForAccountId(userId, accountId);

  // if the user does not have permission to manage billing for the account
  // then we should not proceed
  if (!hasPermission) {
    throw new Error('Permission denied');
  }

  // here we have confirmed that the user has permission to manage billing for the account
  // so we go on and create a checkout session
  const service = await getBillingGatewayProvider(client);
  const productPlanPairFromId = getProductPlanPairFromId(billingConfig, planId);

  if (!productPlanPairFromId) {
    throw new Error('Product not found');
  }

  // the return URL for the checkout session
  const returnUrl = getCheckoutSessionReturnUrl();

  // find the customer ID for the account if it exists
  // (eg. if the account has been billed before)
  const customerId = await getCustomerIdFromAccountId(client, accountId);
  const customerEmail = session.user.email;

  // retrieve the product and plan from the billing configuration
  const { product, plan } = productPlanPairFromId;

  // call the payment gateway to create the checkout session
  const { checkoutToken } = await service.createCheckoutSession({
    accountId,
    returnUrl,
    planId,
    customerEmail,
    customerId,
    paymentType: product.paymentType,
    trialPeriodDays: plan.trialPeriodDays,
  });

  // return the checkout token to the client
  // so we can call the payment gateway to complete the checkout
  return {
    checkoutToken,
  };
}

export async function createBillingPortalSession(data: FormData) {
  const client = getSupabaseServerActionClient();

  const accountId = z
    .object({
      accountId: z.string().min(1),
    })
    .parse(Object.fromEntries(data)).accountId;

  const { data: session, error } = await requireAuth(client);

  if (error ?? !session) {
    throw new Error('Authentication required');
  }

  const userId = session.user.id;

  // we require the user to have permissions to manage billing for the account
  const hasPermission = await getPermissionsForAccountId(userId, accountId);

  // if the user does not have permission to manage billing for the account
  // then we should not proceed
  if (!hasPermission) {
    throw new Error('Permission denied');
  }

  const service = await getBillingGatewayProvider(client);
  const customerId = await getCustomerIdFromAccountId(client, accountId);
  const returnUrl = getBillingPortalReturnUrl();

  if (!customerId) {
    throw new Error('Customer not found');
  }

  const { url } = await service.createBillingPortalSession({
    customerId,
    returnUrl,
  });

  // redirect the user to the billing portal
  return redirect(url);
}

function getCheckoutSessionReturnUrl() {
  const origin = headers().get('origin')!;

  return new URL(pathsConfig.app.accountBillingReturn, origin).toString();
}

function getBillingPortalReturnUrl() {
  const origin = headers().get('origin')!;

  return new URL(pathsConfig.app.accountBilling, origin).toString();
}

/**
 * Retrieves the permissions for a user on an account for managing billing.
 * @param userId
 * @param accountId
 */
async function getPermissionsForAccountId(userId: string, accountId: string) {
  const client = getSupabaseServerActionClient();

  const { data, error } = await client.rpc('has_permission', {
    account_id: accountId,
    user_id: userId,
    permission_name: 'billing.manage',
  });

  if (error) {
    throw error;
  }

  return data;
}

async function getCustomerIdFromAccountId(
  client: ReturnType<typeof getSupabaseServerActionClient>,
  accountId: string,
) {
  const { data, error } = await client
    .from('billing_customers')
    .select('customer_id')
    .eq('account_id', accountId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.customer_id;
}
