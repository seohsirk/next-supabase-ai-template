'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getProductPlanPair } from '@kit/billing';
import { getBillingGatewayProvider } from '@kit/billing-gateway';
import { Logger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import appConfig from '~/config/app.config';
import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';

const CreateCheckoutSchema = z.object({
  planId: z.string(),
  productId: z.string(),
});

/**
 * Creates a checkout session for a personal account.
 *
 * @param {object} params - The parameters for creating the checkout session.
 * @param {string} params.planId - The ID of the plan to be associated with the account.
 */
export async function createPersonalAccountCheckoutSession(
  params: z.infer<typeof CreateCheckoutSchema>,
) {
  // parse the parameters
  const { planId, productId } = CreateCheckoutSchema.parse(params);

  // get the authenticated user
  const client = getSupabaseServerActionClient();
  const { data: user, error } = await requireUser(client);

  if (error ?? !user) {
    throw new Error('Authentication required');
  }

  const service = await getBillingGatewayProvider(client);

  // in the case of personal accounts
  // the account ID is the same as the user ID
  const accountId = user.id;

  // the return URL for the checkout session
  const returnUrl = getCheckoutSessionReturnUrl();

  // find the customer ID for the account if it exists
  // (eg. if the account has been billed before)
  const customerId = await getCustomerIdFromAccountId(accountId);

  const product = billingConfig.products.find((item) => item.id === productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const { plan } = getProductPlanPair(billingConfig, planId);

  Logger.info(
    {
      name: `billing.personal-account`,
      planId,
      customerId,
      accountId,
    },
    `User requested a personal account checkout session. Contacting provider...`,
  );

  try {
    // call the payment gateway to create the checkout session
    const { checkoutToken } = await service.createCheckoutSession({
      returnUrl,
      accountId,
      customerEmail: user.email,
      customerId,
      plan,
      variantQuantities: [],
    });

    Logger.info(
      {
        userId: user.id,
      },
      `Checkout session created. Returning checkout token to client...`,
    );

    // return the checkout token to the client
    // so we can call the payment gateway to complete the checkout
    return {
      checkoutToken,
    };
  } catch (error) {
    Logger.error(
      {
        name: `billing.personal-account`,
        planId,
        customerId,
        accountId,
        error,
      },
      `Checkout session not created due to an error`,
    );

    throw new Error(`Failed to create a checkout session`);
  }
}

export async function createPersonalAccountBillingPortalSession() {
  const client = getSupabaseServerActionClient();
  const { data, error } = await client.auth.getUser();

  if (error ?? !data.user) {
    throw new Error('Authentication required');
  }

  const service = await getBillingGatewayProvider(client);

  const accountId = data.user.id;
  const customerId = await getCustomerIdFromAccountId(accountId);
  const returnUrl = getBillingPortalReturnUrl();

  if (!customerId) {
    throw new Error('Customer not found');
  }

  Logger.info(
    {
      name: `billing.personal-account`,
      customerId,
      accountId,
    },
    `User requested a Billing Portal session. Contacting provider...`,
  );

  let url: string;

  try {
    const session = await service.createBillingPortalSession({
      customerId,
      returnUrl,
    });

    url = session.url;
  } catch (error) {
    Logger.error(
      {
        error,
        customerId,
        accountId,
      },
      `Failed to create a Billing Portal session`,
    );

    throw new Error(`Encountered an error creating the Billing Portal session`);
  }

  Logger.info(
    {
      name: `billing.personal-account`,
      customerId,
      accountId,
    },
    `Session successfully created. Redirecting user...`,
  );

  // redirect user to billing portal
  return redirect(url);
}

function getCheckoutSessionReturnUrl() {
  return new URL(
    pathsConfig.app.personalAccountBillingReturn,
    appConfig.url,
  ).toString();
}

function getBillingPortalReturnUrl() {
  return new URL(
    pathsConfig.app.personalAccountBilling,
    appConfig.url,
  ).toString();
}

async function getCustomerIdFromAccountId(accountId: string) {
  const client = getSupabaseServerActionClient();

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
