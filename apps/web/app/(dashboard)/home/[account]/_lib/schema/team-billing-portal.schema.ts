import { z } from 'zod';

export const TeamBillingPortalSchema = z.object({
  accountId: z.string().uuid(),
  slug: z.string().min(1),
});
