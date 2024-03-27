import { z } from 'zod';

import { LineItemUsageType, PaymentType } from '../create-billing-schema';

export const CreateBillingCheckoutSchema = z
  .object({
    returnUrl: z.string().url(),
    accountId: z.string(),
    paymentType: PaymentType,
    lineItems: z.array(
      z.object({
        id: z.string(),
        quantity: z.number().int().positive(),
        usageType: LineItemUsageType.optional(),
      }),
    ),
    trialDays: z.number().optional(),
    customerId: z.string().optional(),
    customerEmail: z.string().optional(),
  })
  .refine(
    (schema) => {
      if (schema.paymentType === 'one-time' && schema.trialDays) {
        return false;
      }
    },
    {
      message: 'Trial days are only allowed for recurring payments',
      path: ['trialDays'],
    },
  );
