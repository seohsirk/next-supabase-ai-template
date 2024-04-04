import { z } from 'zod';

export const ReportBillingUsageSchema = z.object({
  subscriptionItemId: z.string(),
  usage: z.object({
    quantity: z.number(),
    action: z.enum(['increment', 'set']),
  }),
});
