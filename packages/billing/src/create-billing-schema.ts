import { z } from 'zod';

const Interval = z.enum(['month', 'year']);
const PaymentType = z.enum(['recurring', 'one-time']);
const BillingProvider = z.enum(['stripe']);

const PlanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  price: z.string().min(1).max(100),
  trialPeriodDays: z.number().optional(),
  interval: Interval,
  perSeat: z.boolean().optional().default(false),
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  currency: z.string().optional().default('USD'),
  plans: z.array(PlanSchema),
  features: z.array(z.string()),
  badge: z.string().optional(),
  highlighted: z.boolean().optional(),
  hidden: z.boolean().optional(),
  paymentType: PaymentType.optional().default('recurring'),
});

export const BillingSchema = z
  .object({
    products: z.array(ProductSchema),
    provider: BillingProvider,
  })
  .refine((schema) => {
    // verify dupe product ids
    const ids = schema.products.map((product) => product.id);

    if (new Set(ids).size !== ids.length) {
      return {
        message: 'Duplicate product IDs',
        path: ['products'],
      };
    }

    return true;
  })
  .refine((schema) => {
    // verify dupe plan ids
    const planIds = schema.products.flatMap((product) =>
      product.plans.map((plan) => plan.id),
    );

    if (new Set(planIds).size !== planIds.length) {
      return {
        message: 'Duplicate plan IDs',
        path: ['products'],
      };
    }

    return true;
  });

/**
 * Create and validate the billing schema
 * @param config
 */
export function createBillingSchema(config: z.infer<typeof BillingSchema>) {
  return BillingSchema.parse(config);
}

/**
 * Returns an array of billing plans based on the provided configuration.
 *
 * @param {Object} config - The configuration object containing product and plan information.
 * @return {Array} - An array of billing plans.
 */
export function getBillingPlans(config: z.infer<typeof BillingSchema>) {
  return config.products.flatMap((product) => product.plans);
}

/**
 * Retrieves the intervals of all plans specified in the given configuration.
 *
 * @param {Object} config - The billing configuration containing products and plans.
 * @returns {Array} - An array of intervals.
 */
export function getPlanIntervals(config: z.infer<typeof BillingSchema>) {
  return Array.from(
    new Set(
      config.products.flatMap((product) =>
        product.plans.map((plan) => plan.interval),
      ),
    ),
  );
}
