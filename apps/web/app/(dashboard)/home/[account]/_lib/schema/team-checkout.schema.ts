import { z } from 'zod';

export const TeamCheckoutSchema = z.object({
  slug: z.string().min(1),
  productId: z.string().min(1),
  planId: z.string().min(1),
  accountId: z.string().uuid(),
});
