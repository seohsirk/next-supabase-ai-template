import { z } from 'zod';

export const MailerSchema = z
  .object({
    to: z.string().email(),
    from: z.string().email(),
    subject: z.string(),
  })
  .and(
    z.union([
      z.object({
        text: z.string(),
      }),
      z.object({
        html: z.string(),
      }),
    ]),
  );
