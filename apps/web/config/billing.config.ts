import { BillingProviderSchema, createBillingSchema } from '@kit/billing';

const provider = BillingProviderSchema.parse(
  process.env.NEXT_PUBLIC_BILLING_PROVIDER,
);

export default createBillingSchema({
  provider,
  products: [
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
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe',
              name: 'Base',
              description: 'Base plan',
              cost: 9.99,
              type: 'base',
            },
            {
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe6',
              name: 'Per Seat',
              description: 'Add-on plan',
              cost: 1.99,
              type: 'per-seat',
            },
            {
              id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe7',
              name: 'Metered',
              description: 'Metered plan',
              cost: 0.99,
              type: 'metered',
              unit: 'GB',
              included: 10,
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
