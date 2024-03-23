'use server';

import { RedirectType } from 'next/dist/client/components/redirect';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { SupabaseClient } from '@supabase/supabase-js';

import { join } from 'path';
import { z } from 'zod';

import getSupabaseServerActionClient from '@packages/supabase/action-client';

import { withSession } from '@kit/generic/actions-utils';
import getLogger from '@kit/logger';

import pathsConfig from '@/config/paths.config';
import pricingConfig from '@/config/pricing.config';

import { getUserMembershipByOrganization } from '@/lib/memberships/queries';
import {
  getOrganizationByCustomerId,
  getOrganizationByUid,
} from '@/lib/organizations/database/queries';
import { canChangeBilling } from '@/lib/organizations/permissions';
import requireSession from '@/lib/user/require-session';

import { stripe } from './stripe.service';

export const createCheckoutAction = withSession(
  async (_, formData: FormData) => {
    const logger = getLogger();

    const bodyResult = await getCheckoutBodySchema().safeParseAsync(
      Object.fromEntries(formData),
    );

    const redirectToErrorPage = (error?: string) => {
      const referer = headers().get('referer')!;
      const url = join(referer, `?error=true`);

      logger.error({ error }, `Could not create Stripe Checkout session`);

      return redirect(url);
    };

    // Validate the body schema
    if (!bodyResult.success) {
      return redirectToErrorPage(`Invalid request body`);
    }

    const { organizationUid, priceId, returnUrl } = bodyResult.data;

    // create the Supabase client
    const client = getSupabaseServerActionClient();

    // require the user to be logged in
    const sessionResult = await requireSession(client);
    const userId = sessionResult.user.id;
    const customerEmail = sessionResult.user.email;

    const { error, data } = await getOrganizationByUid(client, organizationUid);

    if (error) {
      return redirectToErrorPage(`Organization not found`);
    }

    const customerId = data?.subscription?.customerId;

    if (customerId) {
      logger.info({ customerId }, `Customer ID found for organization`);
    }

    const plan = getPlanByPriceId(priceId);

    // check if the plan exists in the appConfig.
    if (!plan) {
      console.warn(
        `Plan not found for price ID "${priceId}". Did you forget to add it to the configuration? If the Price ID is incorrect, the checkout will be rejected. Please check the Stripe dashboard`,
      );
    }

    // check the user's role has access to the checkout
    const canChangeBilling = await getUserCanAccessCheckout(client, {
      organizationUid,
      userId,
    });

    // disallow if the user doesn't have permissions to change
    // billing account based on its role. To change the logic, please update
    // {@link canChangeBilling}
    if (!canChangeBilling) {
      logger.debug(
        {
          userId,
          organizationUid,
        },
        `User attempted to access checkout but lacked permissions`,
      );

      return redirectToErrorPage(
        `You do not have permission to access this page`,
      );
    }

    const trialPeriodDays =
      plan && 'trialPeriodDays' in plan
        ? (plan.trialPeriodDays as number)
        : undefined;

    // create the Stripe Checkout session
    const session = await stripe
      .createCheckout({
        returnUrl,
        organizationUid,
        priceId,
        customerId,
        trialPeriodDays,
        customerEmail,
        embedded: true,
      })
      .catch((e) => {
        logger.error(e, `Stripe Checkout error`);
      });

    // if there was an error, redirect to the error page
    if (!session) {
      return redirectToErrorPage();
    }

    logger.info(
      {
        id: session.id,
        organizationUid,
      },
      `Created Stripe Checkout session`,
    );

    if (!session.client_secret) {
      logger.error(
        { id: session.id },
        `Stripe Checkout session missing client secret`,
      );

      return redirectToErrorPage();
    }

    // if the checkout is embedded, we need to render the checkout
    // therefore, we send the clientSecret back to the client
    logger.info(
      { id: session.id },
      `Using embedded checkout mode. Sending client secret back to client.`,
    );

    return {
      clientSecret: session.client_secret,
    };
  },
);

/**
 * @name getUserCanAccessCheckout
 * @description check if the user has permissions to access the checkout
 * @param client
 * @param params
 */
async function getUserCanAccessCheckout(
  client: SupabaseClient,
  params: {
    organizationUid: string;
    userId: string;
  },
) {
  try {
    const { role } = await getUserMembershipByOrganization(client, params);

    if (role === undefined) {
      return false;
    }

    return canChangeBilling(role);
  } catch (error) {
    getLogger().error({ error }, `Could not retrieve user role`);

    return false;
  }
}

export const createBillingPortalSessionAction = withSession(
  async (formData: FormData) => {
    const body = Object.fromEntries(formData);
    const bodyResult = await getBillingPortalBodySchema().safeParseAsync(body);
    const referrerPath = getReferrer();

    // Validate the body schema
    if (!bodyResult.success) {
      return redirectToErrorPage(referrerPath);
    }

    const { customerId } = bodyResult.data;

    const client = getSupabaseServerActionClient();
    const logger = getLogger();
    const session = await requireSession(client);

    const userId = session.user.id;

    // get permissions to see if the user can access the portal
    const canAccess = await getUserCanAccessCustomerPortal(client, {
      customerId,
      userId,
    });

    // validate that the user can access the portal
    if (!canAccess) {
      return redirectToErrorPage(referrerPath);
    }

    const referer = headers().get('referer');
    const origin = headers().get('origin');
    const returnUrl = referer || origin || pathsConfig.appHome;

    // get the Stripe Billing Portal session
    const { url } = await stripe
      .createBillingPortalSession({
        returnUrl,
        customerId,
      })
      .catch((e) => {
        logger.error(e, `Stripe Billing Portal redirect error`);

        return redirectToErrorPage(referrerPath);
      });

    // redirect to the Stripe Billing Portal
    return redirect(url, RedirectType.replace);
  },
);

/**
 * @name getUserCanAccessCustomerPortal
 * @description Returns whether a user {@link userId} has access to the
 * Stripe portal of an organization with customer ID {@link customerId}
 */
async function getUserCanAccessCustomerPortal(
  client: SupabaseClient,
  params: {
    customerId: string;
    userId: string;
  },
) {
  const logger = getLogger();

  const { data: organization, error } = await getOrganizationByCustomerId(
    client,
    params.customerId,
  );

  if (error) {
    logger.error(
      {
        error,
        customerId: params.customerId,
      },
      `Could not retrieve organization by Customer ID`,
    );

    return false;
  }

  try {
    const organizationUid = organization.uuid;

    const { role } = await getUserMembershipByOrganization(client, {
      organizationUid,
      userId: params.userId,
    });

    if (role === undefined) {
      return false;
    }

    return canChangeBilling(role);
  } catch (error) {
    logger.error({ error }, `Could not retrieve user role`);

    return false;
  }
}

function getBillingPortalBodySchema() {
  return z.object({
    customerId: z.string().min(1),
  });
}

function getCheckoutBodySchema() {
  return z.object({
    organizationUid: z.string().uuid(),
    priceId: z.string().min(1),
    returnUrl: z.string().min(1),
  });
}

function getPlanByPriceId(priceId: string) {
  const products = pricingConfig.products;
  type Plan = (typeof products)[0]['plans'][0];

  return products.reduce<Maybe<Plan>>((acc, product) => {
    if (acc) {
      return acc;
    }

    return product.plans.find(({ stripePriceId }) => stripePriceId === priceId);
  }, undefined);
}

function redirectToErrorPage(referrerPath: string) {
  const url = join(referrerPath, `?error=true`);

  return redirect(url);
}

function getReferrer() {
  const referer = headers().get('referer');
  const origin = headers().get('origin');
  return referer || origin || pathsConfig.appHome;
}
