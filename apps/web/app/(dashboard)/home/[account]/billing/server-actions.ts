'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getLineItemsFromPlanId } from '@kit/billing';
import { getBillingGatewayProvider } from '@kit/billing-gateway';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import appConfig from '~/config/app.config';
import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';

/**
 * Creates a checkout session for a team account.
 *
 * @param {object} params - The parameters for creating the checkout session.
 * @param {string} params.planId - The ID of the plan to be associated with the account.
 */
export async function createTeamAccountCheckoutSession(params: {
  productId: string;
  planId: string;
  accountId: string;
  slug: string;
}) {
  const client = getSupabaseServerActionClient();

  // we parse the plan ID from the parameters
  // no need in continuing if the plan ID is not valid
  const planId = z.string().min(1).parse(params.planId);
  const productId = z.string().min(1).parse(params.productId);

  // we require the user to be authenticated
  const { data: user } = await requireUser(client);

  if (!user) {
    throw new Error('Authentication required');
  }

  const userId = user.id;
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

  const product = billingConfig.products.find(
    (product) => product.id === productId,
  );

  if (!product) {
    throw new Error('Product not found');
  }

  const plan = product?.plans.find((plan) => plan.id === planId);

  if (!plan) {
    throw new Error('Plan not found');
  }

  // find the customer ID for the account if it exists
  // (eg. if the account has been billed before)
  const customerId = await getCustomerIdFromAccountId(client, accountId);
  const customerEmail = user.email;

  // the return URL for the checkout session
  const returnUrl = getCheckoutSessionReturnUrl(params.slug);

  // call the payment gateway to create the checkout session
  const { checkoutToken } = await service.createCheckoutSession({
    accountId,
    plan,
    returnUrl,
    customerEmail,
    customerId,
  });

  // return the checkout token to the client
  // so we can call the payment gateway to complete the checkout
  return {
    checkoutToken,
  };
}

export async function createBillingPortalSession(formData: FormData) {
  const client = getSupabaseServerActionClient();

  const { accountId, slug } = z
    .object({
      accountId: z.string().min(1),
      slug: z.string().min(1),
    })
    .parse(Object.fromEntries(formData));

  const { data: user, error } = await requireUser(client);

  if (error ?? !user) {
    throw new Error('Authentication required');
  }

  const userId = user.id;

  // we require the user to have permissions to manage billing for the account
  const hasPermission = await getPermissionsForAccountId(userId, accountId);

  // if the user does not have permission to manage billing for the account
  // then we should not proceed
  if (!hasPermission) {
    throw new Error('Permission denied');
  }

  const service = await getBillingGatewayProvider(client);
  const customerId = await getCustomerIdFromAccountId(client, accountId);
  const returnUrl = getBillingPortalReturnUrl(slug);

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

function getCheckoutSessionReturnUrl(accountSlug: string) {
  return new URL(pathsConfig.app.accountBillingReturn, appConfig.url)
    .toString()
    .replace('[account]', accountSlug);
}

function getBillingPortalReturnUrl(accountSlug: string) {
  return new URL(pathsConfig.app.accountBilling, appConfig.url)
    .toString()
    .replace('[account]', accountSlug);
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
