import { z } from 'zod';

export const ReportBillingUsageSchema = z.object({
  subscriptionId: z.string(),
  usage: z.object({
    quantity: z.number(),
  }),
});
