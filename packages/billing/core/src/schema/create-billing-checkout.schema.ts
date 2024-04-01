import { z } from 'zod';

import { PlanSchema } from '../create-billing-schema';

export const CreateBillingCheckoutSchema = z.object({
  returnUrl: z.string().url(),
  accountId: z.string().uuid(),
  plan: PlanSchema,
  trialDays: z.number().optional(),
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
});
