import { createBillingSchema } from '@kit/billing';

export default createBillingSchema({
  provider: 'stripe',
  products: [
    {
      id: 'starter',
      name: 'Starter',
      description: 'The perfect plan to get started',
      currency: 'USD',
      paymentType: 'recurring',
      badge: `Value`,
      plans: [
        {
          id: 'starter-monthly',
          name: 'Starter Monthly',
          price: '9.99',
          interval: 'month',
          perSeat: false,
        },
        {
          id: 'starter-yearly',
          name: 'Starter Yearly',
          price: '99.99',
          interval: 'year',
          perSeat: false,
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
      paymentType: 'recurring',
      currency: 'USD',
      plans: [
        {
          id: 'pro-monthly',
          name: 'Pro Monthly',
          price: '19.99',
          interval: 'month',
          perSeat: false,
        },
        {
          id: 'pro-yearly',
          name: 'Pro Yearly',
          price: '199.99',
          interval: 'year',
          perSeat: false,
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
      paymentType: 'recurring',
      currency: 'USD',
      plans: [
        {
          id: 'enterprise-monthly',
          name: 'Enterprise Monthly',
          price: '99.99',
          interval: 'month',
          perSeat: false,
        },
        {
          id: 'enterprise-yearly',
          name: 'Enterprise Yearly',
          price: '999.99',
          interval: 'year',
          perSeat: false,
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
