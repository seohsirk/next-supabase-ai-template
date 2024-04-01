import {
  NewCheckout,
  createCheckout,
  getCustomer,
} from '@lemonsqueezy/lemonsqueezy.js';
import { z } from 'zod';

import { CreateBillingCheckoutSchema } from '@kit/billing/schema';

import { getLemonSqueezyEnv } from '../schema/lemon-squeezy-server-env.schema';
import { initializeLemonSqueezyClient } from './lemon-squeezy-sdk';

/**
 * Creates a checkout for a Lemon Squeezy product.
 *
 * @param {object} params - The parameters for creating the checkout.
 * @return {Promise<object>} - A promise that resolves to the created Lemon Squeezy checkout.
 * @throws {Error} - If no line items are found in the subscription.
 */
export async function createLemonSqueezyCheckout(
  params: z.infer<typeof CreateBillingCheckoutSchema>,
) {
  await initializeLemonSqueezyClient();

  const lineItem = params.plan.lineItems[0];

  if (!lineItem) {
    throw new Error('No line items found in subscription');
  }

  const env = getLemonSqueezyEnv();
  const storeId = env.storeId;
  const variantId = lineItem.id;

  const urls = getUrls({
    returnUrl: params.returnUrl,
  });

  const customer = params.customerId
    ? await getCustomer(params.customerId)
    : null;

  let customerEmail = params.customerEmail;

  // if we can find an existing customer using the ID,
  // we use the email from the customer object so that we can
  // link the previous subscription to this one
  // otherwise it will create a new customer if another email is provided (ex. a different team member)
  if (customer?.data) {
    customerEmail = customer.data.data.attributes.email;
  }

  const newCheckout: NewCheckout = {
    checkoutOptions: {
      embed: true,
      media: true,
      logo: true,
    },
    checkoutData: {
      email: customerEmail,
      custom: {
        account_id: params.accountId,
      },
    },
    productOptions: {
      redirectUrl: urls.return_url,
    },
    expiresAt: null,
    preview: true,
    testMode: process.env.NODE_ENV !== 'production',
  };

  return createCheckout(storeId, variantId, newCheckout);
}

function getUrls(params: { returnUrl: string }) {
  const returnUrl = `${params.returnUrl}?session_id={CHECKOUT_SESSION_ID}`;

  return {
    return_url: returnUrl,
  };
}
