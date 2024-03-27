import { z } from 'zod';

export const RecurringPlanInterval = z.enum(['month', 'year']);

export const BillingProvider = z.enum(['stripe', 'paddle', 'lemon-squeezy']);

export const PaymentType = z.enum(['recurring', 'one-time']);

export const LineItemUsageType = z.enum(['licensed', 'metered']);

const RecurringLineItemSchema = z
  .object({
    id: z.string().min(1),
    interval: RecurringPlanInterval,
    metered: z.boolean().optional().default(false),
    costPerUnit: z.number().positive().optional(),
    perSeat: z.boolean().default(false).optional().default(false),
    usageType: LineItemUsageType.optional().default('licensed'),
  })
  .refine(
    (schema) => {
      if (!schema.metered && schema.perSeat) {
        return false;
      }

      return true;
    },
    {
      message: 'Line item must be either metered or a member seat',
      path: ['metered', 'perSeat'],
    },
  )
  .refine(
    (schema) => {
      if (schema.metered && !schema.usageType) {
        return false;
      }

      return true;
    },
    {
      message: 'Line item must have a usage type',
      path: ['usageType'],
    },
  );

const RecurringSchema = z
  .object({
    interval: RecurringPlanInterval,
    metered: z.boolean().optional(),
    costPerUnit: z.number().positive().optional(),
    perSeat: z.boolean().optional(),
    usageType: LineItemUsageType.optional(),
    addOns: z.array(RecurringLineItemSchema).optional(),
  })
  .refine(
    (schema) => {
      if (schema.metered) {
        return schema.costPerUnit;
      }

      return true;
    },
    {
      message: 'Metered plans must have a cost per unit',
      path: ['costPerUnit'],
    },
  )
  .refine(
    (schema) => {
      if (schema.perSeat && !schema.metered) {
        return false;
      }

      return true;
    },
    {
      message: 'Per seat plans must be metered',
      path: ['perSeat'],
    },
  )
  .refine(
    (schema) => {
      if (schema.metered) {
        return !!schema.usageType;
      }

      return true;
    },
    {
      message: 'Metered plans must have a usage type',
      path: ['usageType'],
    },
  );

export const RecurringPlanSchema = z.object({
  name: z.string().min(1).max(100),
  id: z.string().min(1),
  price: z.number().positive(),
  recurring: RecurringSchema,
  trialDays: z.number().positive().optional(),
});

export const OneTimePlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  price: z.number().positive(),
});

export const ProductSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    currency: z.string().optional().default('USD'),
    plans: RecurringPlanSchema.strict()
      .array()
      .nonempty()
      .or(OneTimePlanSchema.strict().array().nonempty()),
    paymentType: PaymentType,
    features: z.array(z.string()),
    badge: z.string().min(1).optional(),
    highlighted: z.boolean().default(false).optional(),
    hidden: z.boolean().default(false).optional(),
  })
  .refine(
    (schema) => {
      const recurringPlans = schema.plans.filter((plan) => 'recurring' in plan);

      if (recurringPlans.length && schema.paymentType === 'one-time') {
        return false;
      }

      return true;
    },
    {
      message: 'One-time products cannot have recurring plans',
      path: ['paymentType'],
    },
  )
  .refine(
    (schema) => {
      const recurringPlans = schema.plans.filter((plan) => 'recurring' in plan);

      if (recurringPlans.length === 0 && schema.paymentType === 'recurring') {
        return false;
      }

      return true;
    },
    {
      message:
        'The product must have at least one recurring plan if the payment type is recurring',
      path: ['paymentType'],
    },
  )
  .refine(
    (schema) => {
      return !(schema.paymentType === 'one-time' && schema.plans.length > 1);
    },
    {
      message: 'One-time products can only have one plan',
      path: ['plans'],
    },
  );

export const BillingSchema = z
  .object({
    products: z.array(ProductSchema).nonempty(),
    provider: BillingProvider,
  })
  .refine(
    (schema) => {
      const ids = schema.products.map((product) => product.id);

      return new Set(ids).size === ids.length;
    },
    {
      message: 'Duplicate product IDs',
      path: ['products'],
    },
  )
  .refine(
    (schema) => {
      const planIds = getAllPlanIds(schema);

      return new Set(planIds).size === planIds.length;
    },
    {
      message: 'Duplicate plan IDs',
      path: ['products'],
    },
  );

/**
 * Create and validate the billing schema
 * @param config The billing configuration
 */
export function createBillingSchema(config: z.infer<typeof BillingSchema>) {
  console.log(JSON.stringify(config));
  return BillingSchema.parse(config);
}

/**
 * Retrieves the intervals of all plans specified in the given configuration.
 * @param config The billing configuration containing products and plans.
 */
export function getPlanIntervals(config: z.infer<typeof BillingSchema>) {
  return Array.from(
    new Set(
      config.products.flatMap((product) => {
        const isRecurring = product.paymentType === 'recurring';

        if (isRecurring) {
          const plans = product.plans as z.infer<typeof RecurringPlanSchema>[];

          return plans.map((plan) => plan.recurring.interval);
        }

        return [];
      }),
    ),
  ).filter(Boolean);
}

export function getProductPlanPairFromId(
  config: z.infer<typeof BillingSchema>,
  planId: string,
) {
  for (const product of config.products) {
    for (const plan of product.plans) {
      if (plan.id === planId) {
        return { product, plan };
      }
    }
  }

  throw new Error('Plan not found');
}

export function getAllPlanIds(config: z.infer<typeof BillingSchema>) {
  const ids: string[] = [];

  for (const product of config.products) {
    for (const plan of product.plans) {
      ids.push(plan.id);
    }
  }

  return ids;
}

export function isRecurringPlan(
  plan: z.infer<typeof RecurringPlanSchema | typeof OneTimePlanSchema>,
): plan is z.infer<typeof RecurringPlanSchema> {
  return 'recurring' in plan;
}
