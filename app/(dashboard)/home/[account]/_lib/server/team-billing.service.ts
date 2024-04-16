import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { LineItemSchema } from '@kit/billing';
import { getBillingGatewayProvider } from '@kit/billing-gateway';
import { getLogger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import appConfig from '~/config/app.config';
import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { Database } from '~/lib/database.types';

import { TeamCheckoutSchema } from '../../_lib/schema/team-billing.schema';

export class TeamBillingService {
  private readonly namespace = 'billing.team-account';

  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * @name createCheckout
   * @description Creates a checkout session for a Team account
   */
  async createCheckout(params: z.infer<typeof TeamCheckoutSchema>) {
    // we require the user to be authenticated
    const { data: user } = await requireUser(this.client);

    if (!user) {
      throw new Error('Authentication required');
    }

    const userId = user.id;
    const accountId = params.accountId;
    const logger = await getLogger();

    const ctx = {
      userId,
      accountId,
      name: this.namespace,
    };

    logger.info(ctx, `Requested checkout session. Processing...`);

    // verify permissions to manage billing
    const hasPermission = await getBillingPermissionsForAccountId(
      userId,
      accountId,
    );

    // if the user does not have permission to manage billing for the account
    // then we should not proceed
    if (!hasPermission) {
      logger.warn(
        ctx,
        `User without permissions attempted to create checkout.`,
      );

      throw new Error('Permission denied');
    }

    // here we have confirmed that the user has permission to manage billing for the account
    // so we go on and create a checkout session
    const service = await getBillingGatewayProvider(this.client);

    // retrieve the plan from the configuration
    // so we can assign the correct checkout data
    const { plan, product } = getPlanDetails(params.productId, params.planId);

    // find the customer ID for the account if it exists
    // (eg. if the account has been billed before)
    const customerId = await getCustomerIdFromAccountId(this.client, accountId);
    const customerEmail = user.email;

    // the return URL for the checkout session
    const returnUrl = getCheckoutSessionReturnUrl(params.slug);

    // get variant quantities
    // useful for setting an initial quantity value for certain line items
    // such as per seat
    const variantQuantities = await this.getVariantQuantities(
      plan.lineItems,
      accountId,
    );

    logger.info(
      {
        ...ctx,
        planId: plan.id,
      },
      `Creating checkout session...`,
    );

    try {
      // call the payment gateway to create the checkout session
      const { checkoutToken } = await service.createCheckoutSession({
        accountId,
        plan,
        returnUrl,
        customerEmail,
        customerId,
        variantQuantities,
        enableDiscountField: product.enableDiscountField,
      });

      // return the checkout token to the client
      // so we can call the payment gateway to complete the checkout
      return {
        checkoutToken,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        `Error creating the checkout session`,
      );

      throw new Error(`Checkout not created`);
    }
  }

  /**
   * @name createBillingPortalSession
   * @description Creates a new billing portal session for a team account
   * @param accountId
   * @param slug
   */
  async createBillingPortalSession({
    accountId,
    slug,
  }: {
    accountId: string;
    slug: string;
  }) {
    const client = getSupabaseServerActionClient();
    const logger = await getLogger();

    logger.info(
      {
        accountId,
        name: this.namespace,
      },
      `Billing portal session requested. Processing...`,
    );

    const { data: user, error } = await requireUser(client);

    if (error ?? !user) {
      throw new Error('Authentication required');
    }

    const userId = user.id;

    // we require the user to have permissions to manage billing for the account
    const hasPermission = await getBillingPermissionsForAccountId(
      userId,
      accountId,
    );

    // if the user does not have permission to manage billing for the account
    // then we should not proceed
    if (!hasPermission) {
      logger.warn(
        {
          userId,
          accountId,
          name: this.namespace,
        },
        `User without permissions attempted to create billing portal session.`,
      );

      throw new Error('Permission denied');
    }

    const service = await getBillingGatewayProvider(client);
    const customerId = await getCustomerIdFromAccountId(client, accountId);

    if (!customerId) {
      throw new Error('Customer not found');
    }

    logger.info(
      {
        userId,
        customerId,
        accountId,
        name: this.namespace,
      },
      `Creating billing portal session...`,
    );

    try {
      const returnUrl = getBillingPortalReturnUrl(slug);

      const { url } = await service.createBillingPortalSession({
        customerId,
        returnUrl,
      });

      // redirect the user to the billing portal
      return url;
    } catch (error) {
      logger.error(
        {
          userId,
          customerId,
          accountId,
          name: this.namespace,
        },
        `Billing Portal session was not created`,
      );

      throw new Error(`Error creating Billing Portal`);
    }
  }

  /**
   * Retrieves variant quantities for line items.
   */
  private async getVariantQuantities(
    lineItems: z.infer<typeof LineItemSchema>[],
    accountId: string,
  ) {
    const variantQuantities = [];

    for (const lineItem of lineItems) {
      if (lineItem.type === 'per-seat') {
        const quantity = await this.getCurrentMembersCount(accountId);

        const item = {
          quantity,
          variantId: lineItem.id,
        };

        variantQuantities.push(item);
      }
    }

    return variantQuantities;
  }

  private async getCurrentMembersCount(accountId: string) {
    const { count, error } = await this.client
      .from('accounts_memberships')
      .select('*', {
        head: true,
        count: 'exact',
      })
      .eq('account_id', accountId);

    if (error) {
      const logger = await getLogger();

      logger.error(
        {
          accountId,
          error,
          name: `billing.checkout`,
        },
        `Encountered an error while fetching the number of existing seats`,
      );

      throw new Error();
    }

    return count ?? 1;
  }
}

function getCheckoutSessionReturnUrl(accountSlug: string) {
  return getAccountUrl(pathsConfig.app.accountBillingReturn, accountSlug);
}

function getBillingPortalReturnUrl(accountSlug: string) {
  return getAccountUrl(pathsConfig.app.accountBilling, accountSlug);
}

function getAccountUrl(path: string, slug: string) {
  return new URL(path, appConfig.url).toString().replace('[account]', slug);
}

/**
 * @name getBillingPermissionsForAccountId
 * @description Retrieves the permissions for a user on an account for managing billing.
 */
async function getBillingPermissionsForAccountId(
  userId: string,
  accountId: string,
) {
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

/**
 * Retrieves the customer ID based on the provided account ID.
 * If it exists we need to pass it to the provider so we can bill the same
 * customer ID for the provided account ID
 */
async function getCustomerIdFromAccountId(
  client: SupabaseClient<Database>,
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

function getPlanDetails(productId: string, planId: string) {
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

  return { plan, product };
}
