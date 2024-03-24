import { z } from 'zod';

export const CreateBillingCheckoutSchema = z.object({
  returnUrl: z.string().url(),
  accountId: z.string(),
  planId: z.string(),
  paymentType: z.enum(['recurring', 'one-time']),

  trialPeriodDays: z.number().optional(),

  customerId: z.string().optional(),
  customerEmail: z.string().optional(),
});
