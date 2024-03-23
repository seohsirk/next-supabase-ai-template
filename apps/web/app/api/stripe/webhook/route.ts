import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Stripe } from 'stripe';

import getSupabaseRouteHandlerClient from '@packages/supabase/route-handler-client';

import { Logger } from '@kit/logger';
import createStripeClient from '@kit/stripe/get-stripe';
import StripeWebhooks from '@kit/stripe/stripe-webhooks.enum';

import { setOrganizationSubscriptionData } from '@/lib/organizations/database/mutations';
import {
  addSubscription,
  deleteSubscription,
  updateSubscriptionById,
} from '@/lib/subscriptions/mutations';

const STRIPE_SIGNATURE_HEADER = 'stripe-signature';

const webhookSecretKey = process.env.STRIPE_WEBHOOK_SECRET!;

const logName = 'stripe-webhook';

/**
 * @description Handle the webhooks from Stripe related to checkouts
 */
export async function POST(request: Request) {
  const signature = headers().get(STRIPE_SIGNATURE_HEADER);

  Logger.info(`[Stripe] Received Stripe Webhook`);

  if (!webhookSecretKey) {
    Logger.error(
      {
        name: logName,
      },
      `The variable STRIPE_WEBHOOK_SECRET is unset. Please add the STRIPE_WEBHOOK_SECRET environment variable`,
    );

    return new Response(null, {
      status: 500,
    });
  }

  // verify signature header is not missing
  if (!signature) {
    return new Response('Invalid signature', {
      status: 400,
    });
  }

  const rawBody = await request.text();
  const stripe = await createStripeClient();

  // create an Admin client to write to the subscriptions table
  const client = getSupabaseRouteHandlerClient({
    admin: true,
  });

  try {
    // build the event from the raw body and signature using Stripe
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecretKey,
    );

    Logger.info(
      {
        name: logName,
        type: event.type,
      },
      `Processing Stripe Webhook...`,
    );

    switch (event.type) {
      case StripeWebhooks.Completed: {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await onCheckoutCompleted(client, session, subscription);

        break;
      }

      case StripeWebhooks.SubscriptionDeleted: {
        const subscription = event.data.object as Stripe.Subscription;

        await deleteSubscription(client, subscription.id);

        break;
      }

      case StripeWebhooks.SubscriptionUpdated: {
        const subscription = event.data.object as Stripe.Subscription;

        await updateSubscriptionById(client, subscription);

        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Logger.error(
      {
        error,
        name: logName,
      },
      `Webhook handling failed`,
    );

    return new Response(null, {
      status: 500,
    });
  }
}

/**
 * @description When the checkout is completed, we store the order. The
 * subscription is only activated if the order was paid successfully.
 * Otherwise, we have to wait for a further webhook
 */
async function onCheckoutCompleted(
  client: SupabaseClient,
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription,
) {
  const organizationUid = getOrganizationUidFromClientReference(session);
  const customerId = session.customer as string;

  // build organization subscription and set on the organization document
  // we add just enough data in the DB, so we do not query
  // Stripe for every bit of data
  // if you need your DB record to contain further data
  // add it to {@link buildOrganizationSubscription}
  const { error, data } = await addSubscription(client, subscription);

  if (error) {
    return Promise.reject(
      `Failed to add subscription to the database: ${error}`,
    );
  }

  return setOrganizationSubscriptionData(client, {
    organizationUid,
    customerId,
    subscriptionId: data.id,
  });
}

/**
 * @name getOrganizationUidFromClientReference
 * @description Get the organization UUID from the client reference ID
 * @param session
 */
function getOrganizationUidFromClientReference(
  session: Stripe.Checkout.Session,
) {
  return session.client_reference_id!;
}
