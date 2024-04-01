import type { Stripe } from 'stripe';
import { z } from 'zod';

import { CreateBillingCheckoutSchema } from '@kit/billing/schema';

/**
 * @name createStripeCheckout
 * @description Creates a Stripe Checkout session, and returns an Object
 * containing the session, which you can use to redirect the user to the
 * checkout page
 */
export async function createStripeCheckout(
  stripe: Stripe,
  params: z.infer<typeof CreateBillingCheckoutSchema>,
) {
  // in MakerKit, a subscription belongs to an organization,
  // rather than to a user
  // if you wish to change it, use the current user ID instead
  const clientReferenceId = params.accountId;

  // we pass an optional customer ID, so we do not duplicate the Stripe
  // customers if an organization subscribes multiple times
  const customer = params.customerId ?? undefined;

  // docs: https://stripe.com/docs/billing/subscriptions/build-subscription
  const mode: Stripe.Checkout.SessionCreateParams.Mode =
    params.plan.paymentType === 'recurring' ? 'subscription' : 'payment';

  // this should only be set if the mode is 'subscription'
  const subscriptionData:
    | Stripe.Checkout.SessionCreateParams.SubscriptionData
    | undefined =
    mode === 'subscription'
      ? {
          trial_period_days: params.trialDays,
          metadata: {
            accountId: params.accountId,
          },
        }
      : undefined;

  const urls = getUrls({
    returnUrl: params.returnUrl,
  });

  // we use the embedded mode, so the user does not leave the page
  const uiMode = 'embedded';

  const customerData = customer
    ? {
        customer,
      }
    : {
        customer_email: params.customerEmail,
      };

  const lineItems = params.plan.lineItems.map((item) => {
    if (item.type === 'metered') {
      return {
        price: item.id,
      };
    }

    return {
      price: item.id,
      quantity: 1,
    };
  });

  return stripe.checkout.sessions.create({
    mode,
    ui_mode: uiMode,
    line_items: lineItems,
    client_reference_id: clientReferenceId,
    subscription_data: subscriptionData,
    customer_creation: 'always',
    ...customerData,
    ...urls,
  });
}

function getUrls(params: { returnUrl: string }) {
  const returnUrl = `${params.returnUrl}?session_id={CHECKOUT_SESSION_ID}`;

  return {
    return_url: returnUrl,
  };
}
