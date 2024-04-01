import { z } from 'zod';

export const getLemonSqueezyEnv = () =>
  z
    .object({
      secretKey: z.string().min(1),
      webhooksSecret: z.string().min(1),
      storeId: z.number().positive(),
    })
    .parse({
      secretKey: process.env.LEMON_SQUEEZY_SECRET_KEY,
      webhooksSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
      storeId: process.env.LEMON_SQUEEZY_STORE_ID,
    });
