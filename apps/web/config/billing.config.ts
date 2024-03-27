import { createBillingSchema } from '@kit/billing';

export default createBillingSchema({
  provider: 'stripe',
  products: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'The perfect plan to get started',
      currency: 'USD',
      badge: `Value`,
      paymentType: 'recurring',
      plans: [
        {
          name: 'Starter Monthly',
          id: 'price_1NNwYHI1i3VnbZTqI2UzaHIe',
          price: 9.99,
          recurring: {
            interval: 'month',
          },
        },
        {
          name: 'Starter Yearly',
          id: 'starter-yearly',
          price: 99.99,
          recurring: {
            interval: 'year',
          },
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
      paymentType: 'recurring',
      plans: [
        {
          name: 'Pro Monthly',
          id: 'pro-monthly',
          price: 19.99,
          recurring: {
            interval: 'month',
          },
        },
        {
          name: 'Pro Yearly',
          id: 'pro-yearly',
          price: 199.99,
          recurring: {
            interval: 'year',
          },
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
      paymentType: 'recurring',
      plans: [
        {
          name: 'Enterprise Monthly',
          id: 'enterprise-monthly',
          price: 99.99,
          recurring: {
            interval: 'month',
          },
        },
        {
          name: 'Enterprise Yearly',
          id: 'enterprise-yearly',
          price: 999.99,
          recurring: {
            interval: 'year',
          },
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
