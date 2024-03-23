import { invariant } from '@epic-web/invariant';
import 'server-only';

const STRIPE_API_VERSION = '2023-10-16';

/**
 * @description returns a Stripe instance
 */
export async function createStripeClient() {
  const { default: Stripe } = await import('stripe');

  invariant(
    process.env.STRIPE_SECRET_KEY,
    `'STRIPE_SECRET_KEY' environment variable was not provided`,
  );

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
  });
}
