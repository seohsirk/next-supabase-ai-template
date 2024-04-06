/**
 * This is a sample billing configuration file. You should copy this file to `billing.config.ts` and then replace
 * the configuration with your own billing provider and products.
 */
import { BillingProviderSchema, createBillingSchema } from '@kit/billing';

// The billing provider to use. This should be set in the environment variables
// and should match the provider in the database. We also add it here so we can validate
// your configuration against the selected provider at build time.
const provider = BillingProviderSchema.parse(
  process.env.NEXT_PUBLIC_BILLING_PROVIDER,
);

export default createBillingSchema({
  // also update config.billing_provider in the DB to match the selected
  provider,
  // products configuration
  products: [
    {
      id: 'lifetime',
      name: 'Lifetime',
      description: 'The perfect plan for a lifetime',
      currency: 'USD',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      plans: [
        {
          name: 'Lifetime',
          id: 'lifetime',
          paymentType: 'one-time',
          lineItems: [
            {
              id: '324643',
              name: 'Base',
              cost: 999.99,
              type: 'base',
            },
          ],
        },
      ],
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'The perfect plan to get started',
      currency: 'USD',
      badge: `Value`,
      plans: [
        {
          name: 'Starter Monthly',
          id: 'starter-monthly',
          trialPeriod: 7,
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: '55476',
              name: 'Base',
              cost: 9.99,
              type: 'base',
            },
            {
              id: '324644',
              name: 'Addon 1',
              cost: 99.99,
              type: 'metered',
              unit: 'GB',
              tiers: [
                {
                  upTo: 10,
                  cost: 0.99,
                },
                {
                  upTo: 100,
                  cost: 0.49,
                },
                {
                  upTo: 1000,
                  cost: 0.29,
                },
                {
                  upTo: 'unlimited',
                  cost: 0.19,
                },
              ],
            },
            {
              id: '324645',
              name: 'Addon 2',
              cost: 9.99,
              type: 'per-seat',
              tiers: [
                {
                  upTo: 5,
                  cost: 0,
                },
                {
                  upTo: 10,
                  cost: 6.99,
                },
                {
                  upTo: 'unlimited',
                  cost: 0.49,
                },
              ],
            },
          ],
        },
        {
          name: 'Starter Yearly',
          id: 'starter-yearly',
          paymentType: 'recurring',
          interval: 'year',
          lineItems: [
            {
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe1',
              name: 'Base',
              cost: 99.99,
              type: 'base',
            },
          ],
        },
      ],
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: `Popular`,
      highlighted: true,
      description: 'The perfect plan for professionals',
      currency: 'USD',
      plans: [
        {
          name: 'Pro Monthly',
          id: 'pro-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe2',
              name: 'Base',
              cost: 19.99,
              type: 'base',
            },
          ],
        },
        {
          name: 'Pro Yearly',
          id: 'pro-yearly',
          paymentType: 'recurring',
          interval: 'year',
          lineItems: [
            {
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe3',
              name: 'Base',
              cost: 199.99,
              type: 'base',
            },
          ],
        },
      ],
      features: [
        'Feature 1',
        'Feature 2',
        'Feature 3',
        'Feature 4',
        'Feature 5',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'The perfect plan for enterprises',
      currency: 'USD',
      plans: [
        {
          name: 'Enterprise Monthly',
          id: 'enterprise-monthly',
          paymentType: 'recurring',
          interval: 'month',
          lineItems: [
            {
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe4',
              name: 'Base',
              cost: 29.99,
              type: 'base',
            },
          ],
        },
        {
          name: 'Enterprise Yearly',
          id: 'enterprise-yearly',
          paymentType: 'recurring',
          interval: 'year',
          lineItems: [
            {
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe5',
              name: 'Base',
              cost: 299.99,
              type: 'base',
            },
          ],
        },
      ],
      features: [
        'Feature 1',
        'Feature 2',
        'Feature 3',
        'Feature 4',
        'Feature 5',
        'Feature 6',
        'Feature 7',
      ],
    },
  ],
});
