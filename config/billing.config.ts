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
              id: 'price_1P0jgcI1i3VnbZTqXVXaZkMP',
              name: 'Base',
              description: 'Base plan',
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
              description: 'Base plan',
              cost: 9.99,
              type: 'base',
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
              description: 'Base plan',
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
              description: 'Base plan',
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
              description: 'Base plan',
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
              description: 'Base plan',
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
              description: 'Base plan',
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
